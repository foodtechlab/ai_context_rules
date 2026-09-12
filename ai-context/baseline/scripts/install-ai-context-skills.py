#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import shutil
import tempfile
from pathlib import Path

from ai_context_skills_lib import directory_digest, load_install_state, load_skills_manifest
from ai_context_sync_lib import format_path_list, load_manifest, source_checkout, validate_source_args


def replace_directory(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    stage_root = Path(tempfile.mkdtemp(prefix=".aic-stage-", dir=target.parent))
    staged = stage_root / target.name
    backup = stage_root / f"{target.name}.backup"
    try:
        shutil.copytree(source, staged)
        if target.exists():
            target.rename(backup)
        staged.rename(target)
    except Exception:
        if backup.exists() and not target.exists():
            backup.rename(target)
        raise
    finally:
        shutil.rmtree(stage_root, ignore_errors=True)


def resolve_default_source(args: argparse.Namespace, target_root: Path) -> tuple[str | None, str | None]:
    if args.source_dir or args.source_repo:
        return args.source_dir, args.source_repo
    root_manifest = load_manifest(target_root)
    repo = root_manifest.get("source_of_truth", {}).get("repo")
    if not repo:
        raise RuntimeError("Source repository is not configured in baseline/manifest.json.")
    return None, repo


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Install or update AIC-managed skills in the current repository."
    )
    parser.add_argument("--target-dir", default=".", help="Target repository root.")
    parser.add_argument("--source-dir", help="Local source-of-truth repository root.")
    parser.add_argument("--source-repo", help="Remote source-of-truth git URL.")
    parser.add_argument("--branch", help="Optional source branch override.")
    args = parser.parse_args()
    validate_source_args(args, require_source=False)

    target_root = Path(args.target_dir).resolve()
    source_dir, source_repo = resolve_default_source(args, target_root)

    with source_checkout(source_dir, source_repo, args.branch) as source:
        manifest = load_skills_manifest(source.root)
        target_directory = target_root / manifest["target_directory"]
        state_path = target_root / manifest["state_file"]
        old_state = load_install_state(state_path)
        old_managed = set(old_state["managed_skills"])
        expected_names = {entry["name"] for entry in manifest["skills"]}

        installed: list[str] = []
        updated: list[str] = []
        unchanged: list[str] = []
        removed: list[str] = []
        state_skills: dict[str, dict[str, str]] = {}

        for entry in manifest["skills"]:
            name = entry["name"]
            source_path = source.root / entry["source"]
            target_path = target_directory / name
            source_digest = directory_digest(source_path)

            if target_path.is_dir() and directory_digest(target_path) == source_digest:
                unchanged.append(name)
            else:
                existed = target_path.exists()
                if existed and not target_path.is_dir():
                    raise RuntimeError(f"Managed skill target is not a directory: {target_path}")
                replace_directory(source_path, target_path)
                (updated if existed else installed).append(name)

            state_skills[name] = {
                "source": entry["source"],
                "sha256": source_digest,
            }

        for name in sorted(old_managed - expected_names):
            obsolete_path = target_directory / name
            if obsolete_path.is_dir():
                shutil.rmtree(obsolete_path)
                removed.append(name)
            elif obsolete_path.exists():
                raise RuntimeError(f"Obsolete managed skill target is not a directory: {obsolete_path}")

        target_directory.mkdir(parents=True, exist_ok=True)
        state = {
            "manifest_version": 1,
            "source_repo": source.repo,
            "source_branch": source.branch,
            "managed_skills": state_skills,
        }
        temporary_state = state_path.with_name(f"{state_path.name}.tmp")
        temporary_state.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary_state.replace(state_path)

        print("AIC repository skills installation completed")
        if source.repo:
            print(f"source_repo: {source.repo}")
        else:
            print(f"source_dir: {source.root}")
        if source.branch:
            print(f"source_branch: {source.branch}")
        print(f"target_directory: {manifest['target_directory']}")
        print("installed:")
        print(format_path_list(installed))
        print("updated:")
        print(format_path_list(updated))
        print("unchanged:")
        print(format_path_list(unchanged))
        print("removed_obsolete_managed_skills:")
        print(format_path_list(removed))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
