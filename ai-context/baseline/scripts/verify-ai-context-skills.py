#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path

from ai_context_skills_lib import directory_digest, load_install_state, load_skills_manifest
from ai_context_sync_lib import format_path_list, load_manifest, source_checkout, validate_source_args


def resolve_default_source(args: argparse.Namespace, target_root: Path) -> tuple[str | None, str | None]:
    if args.source_dir or args.source_repo:
        return args.source_dir, args.source_repo
    root_manifest = load_manifest(target_root)
    repo = root_manifest.get("source_of_truth", {}).get("repo")
    if not repo:
        raise RuntimeError("Source repository is not configured in baseline/manifest.json.")
    return None, repo


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify installed AIC repository skills.")
    parser.add_argument("--target-dir", default=".", help="Target repository root.")
    parser.add_argument("--source-dir", help="Local source-of-truth repository root.")
    parser.add_argument("--source-repo", help="Remote source-of-truth git URL.")
    parser.add_argument("--branch", help="Optional source branch override.")
    args = parser.parse_args()
    validate_source_args(args, require_source=False)

    target_root = Path(args.target_dir).resolve()
    source_dir, source_repo = resolve_default_source(args, target_root)
    issues: list[str] = []

    with source_checkout(source_dir, source_repo, args.branch) as source:
        manifest = load_skills_manifest(source.root)
        state_path = target_root / manifest["state_file"]
        state = load_install_state(state_path)
        state_skills = state["managed_skills"]
        expected_names = {entry["name"] for entry in manifest["skills"]}

        if not state_path.is_file():
            issues.append(f"missing install state: {manifest['state_file']}")

        for entry in manifest["skills"]:
            name = entry["name"]
            source_path = source.root / entry["source"]
            target_path = target_root / manifest["target_directory"] / name
            if not target_path.is_dir():
                issues.append(f"missing managed skill: {name}")
                continue
            expected_digest = directory_digest(source_path)
            actual_digest = directory_digest(target_path)
            if actual_digest != expected_digest:
                issues.append(f"managed skill drift: {name}")
            state_entry = state_skills.get(name)
            if not state_entry or state_entry.get("sha256") != expected_digest:
                issues.append(f"install state drift: {name}")

        for name in sorted(set(state_skills) - expected_names):
            issues.append(f"obsolete managed skill in install state: {name}")

    if issues:
        print("AIC repository skills verify failed")
        print(format_path_list(issues))
        return 1

    print("AIC repository skills verify passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
