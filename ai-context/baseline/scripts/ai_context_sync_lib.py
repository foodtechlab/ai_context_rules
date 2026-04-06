#!/usr/bin/env python3

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator


DEFAULT_BRANCH_PRIORITY = ("main", "master")


@dataclass(frozen=True)
class SourceCheckout:
    root: Path
    repo: str | None
    branch: str | None


def load_manifest(repo_root: Path) -> dict:
    manifest_path = repo_root / "ai-context" / "baseline" / "manifest.json"
    if not manifest_path.is_file():
        raise RuntimeError(f"Manifest not found: {manifest_path}")
    return json.loads(manifest_path.read_text(encoding="utf-8"))


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def expand_file_patterns(root: Path, patterns: list[str]) -> list[str]:
    matches: set[str] = set()
    for pattern in patterns:
        for candidate in root.glob(pattern):
            if candidate.is_file():
                matches.add(candidate.relative_to(root).as_posix())
    return sorted(matches)


def entry_enabled(entry: dict, mode: str) -> bool:
    modes = entry.get("modes")
    if not modes:
        return True
    return mode in modes


def parse_usage_mode_default(config_path: Path) -> str | None:
    usage_modes_indent: int | None = None
    for raw_line in config_path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        stripped = raw_line.strip()
        if usage_modes_indent is None:
            if stripped == "usage_modes:":
                usage_modes_indent = indent
            continue
        if indent <= usage_modes_indent:
            usage_modes_indent = None
            if stripped == "usage_modes:":
                usage_modes_indent = indent
            continue
        if stripped.startswith("default:"):
            return stripped.split(":", 1)[1].strip()
    return None


def resolve_mode(target_root: Path, fallback_repo_root: Path, requested_mode: str) -> str:
    if requested_mode != "auto":
        return requested_mode

    candidates = [
        target_root / "ai-context" / "parameters" / "repository-parameters.yaml",
        target_root / "ai-context" / "workspace" / "parameters" / "repository-parameters.yaml",
        fallback_repo_root / "ai-context" / "baseline" / "templates" / "repository-parameters.yaml",
    ]
    for candidate in candidates:
        if candidate.is_file():
            mode = parse_usage_mode_default(candidate)
            if mode:
                return mode
    return "developer"


def set_usage_mode_default(config_path: Path, mode: str) -> None:
    lines = config_path.read_text(encoding="utf-8").splitlines()
    output: list[str] = []
    usage_modes_indent: int | None = None
    updated = False
    for raw_line in lines:
        stripped = raw_line.strip()
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        if usage_modes_indent is None:
            if stripped == "usage_modes:":
                usage_modes_indent = indent
            output.append(raw_line)
            continue
        if indent <= usage_modes_indent:
            usage_modes_indent = None
            output.append(raw_line)
            if stripped == "usage_modes:":
                usage_modes_indent = indent
            continue
        if stripped.startswith("default:") and not updated:
            prefix = " " * indent
            output.append(f"{prefix}default: {mode}")
            updated = True
            continue
        output.append(raw_line)

    if not updated:
        raise RuntimeError(f"Could not set usage mode in {config_path}")
    config_path.write_text("\n".join(output) + "\n", encoding="utf-8")


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def copy_file(source: Path, target: Path) -> None:
    ensure_parent(target)
    shutil.copy2(source, target)


def move_path(source: Path, target: Path) -> None:
    ensure_parent(target)
    shutil.move(str(source), str(target))


def prune_empty_parents(path: Path, stop_at: Path) -> None:
    current = path.parent
    while current != stop_at and current.exists():
        try:
            current.rmdir()
        except OSError:
            return
        current = current.parent


def format_path_list(paths: list[str]) -> str:
    if not paths:
        return "  - none"
    return "\n".join(f"  - {path}" for path in paths)


def format_migration(source: str, target: str) -> str:
    return f"{source} -> {target}"


def placeholder_file_is_optional(target_path: Path) -> bool:
    if target_path.name != ".gitkeep":
        return False
    if not target_path.parent.exists():
        return False
    for candidate in target_path.parent.iterdir():
        if candidate.name != ".gitkeep":
            return True
    return False


def add_common_arguments(parser: argparse.ArgumentParser, require_source: bool) -> None:
    parser.add_argument("--target-dir", default=".", help="Path to the target repository root.")
    parser.add_argument(
        "--mode",
        choices=("auto", "developer", "project-manager"),
        default="auto",
        help="Override usage mode. Use auto to detect it from repository parameters.",
    )
    parser.add_argument("--source-dir", help="Local path to the source-of-truth repository.")
    parser.add_argument("--source-repo", help="Remote git URL of the source-of-truth repository.")
    parser.add_argument("--branch", help="Optional source branch override.")
    if require_source:
        parser.epilog = "One of --source-dir or --source-repo is required."


def validate_source_args(args: argparse.Namespace, require_source: bool) -> None:
    provided = [bool(args.source_dir), bool(args.source_repo)]
    if sum(provided) > 1:
        raise SystemExit("Use only one of --source-dir or --source-repo.")
    if require_source and sum(provided) == 0:
        raise SystemExit("Provide --source-dir or --source-repo.")


@contextlib.contextmanager
def source_checkout(
    source_dir: str | None,
    source_repo: str | None,
    branch: str | None,
    branch_priority: tuple[str, ...] = DEFAULT_BRANCH_PRIORITY,
) -> Iterator[SourceCheckout]:
    if source_dir:
        yield SourceCheckout(Path(source_dir).resolve(), None, None)
        return

    if not source_repo:
        raise RuntimeError("Source repo is not provided.")

    temp_root = Path(tempfile.mkdtemp(prefix="ai-context-source-"))
    clone_root = temp_root / "repo"
    attempts = [branch] if branch else list(branch_priority)
    errors: list[str] = []
    try:
        for candidate in attempts:
            command = ["git", "clone", "--depth", "1", "--branch", candidate, source_repo, str(clone_root)]
            result = subprocess.run(command, capture_output=True, text=True, check=False)
            if result.returncode == 0:
                yield SourceCheckout(clone_root, source_repo, candidate)
                return
            errors.append(f"{candidate}: {result.stderr.strip() or result.stdout.strip()}")
        raise RuntimeError("Could not clone source repository.\n" + "\n".join(errors))
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)
