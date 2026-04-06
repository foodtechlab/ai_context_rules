#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path

from ai_context_sync_lib import (
    add_common_arguments,
    copy_file,
    entry_enabled,
    expand_file_patterns,
    file_sha256,
    format_path_list,
    load_manifest,
    placeholder_file_is_optional,
    prune_empty_parents,
    resolve_mode,
    set_usage_mode_default,
    source_checkout,
    validate_source_args,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Synchronize ai-context baseline and bootstrap workspace files.")
    add_common_arguments(parser, require_source=True)
    args = parser.parse_args()
    validate_source_args(args, require_source=True)

    target_root = Path(args.target_dir).resolve()

    with source_checkout(args.source_dir, args.source_repo, args.branch) as source:
        manifest = load_manifest(source.root)
        mode = resolve_mode(target_root, source.root, args.mode)

        baseline_patterns = manifest["baseline"]["replace"]
        source_baseline_files = expand_file_patterns(source.root, baseline_patterns)
        target_baseline_files = expand_file_patterns(target_root, baseline_patterns)

        updated: list[str] = []
        removed: list[str] = []
        ensured_dirs: list[str] = []
        bootstrapped: list[str] = []
        preserved_workspace: list[str] = []

        source_baseline_set = set(source_baseline_files)
        target_baseline_set = set(target_baseline_files)

        for rel_path in sorted(target_baseline_set - source_baseline_set):
            target_path = target_root / rel_path
            target_path.unlink()
            prune_empty_parents(target_path, target_root)
            removed.append(rel_path)

        for rel_path in source_baseline_files:
            source_path = source.root / rel_path
            target_path = target_root / rel_path
            if not target_path.exists() or file_sha256(source_path) != file_sha256(target_path):
                copy_file(source_path, target_path)
                updated.append(rel_path)

        for entry in manifest["workspace"]["ensure_directories"]:
            if not entry_enabled(entry, mode):
                continue
            path = target_root / entry["path"]
            if not path.exists():
                path.mkdir(parents=True, exist_ok=True)
                ensured_dirs.append(entry["path"])

        explicit_mode = args.mode if args.mode != "auto" else None

        for entry in manifest["workspace"]["ensure_files"]:
            if not entry_enabled(entry, mode):
                continue
            source_path = source.root / entry["source"]
            target_path = target_root / entry["target"]
            if placeholder_file_is_optional(target_path):
                preserved_workspace.append(entry["target"])
                continue
            if target_path.exists():
                preserved_workspace.append(entry["target"])
                continue
            copy_file(source_path, target_path)
            if explicit_mode and entry["target"].endswith("repository-parameters.yaml"):
                set_usage_mode_default(target_path, explicit_mode)
            bootstrapped.append(entry["target"])

        print("ai-context sync completed")
        if source.repo:
            print(f"source_repo: {source.repo}")
        if source.branch:
            print(f"source_branch: {source.branch}")
        print(f"mode: {mode}")
        print("updated_baseline:")
        print(format_path_list(updated))
        print("removed_baseline:")
        print(format_path_list(removed))
        print("created_workspace_directories:")
        print(format_path_list(ensured_dirs))
        print("bootstrapped_workspace_files:")
        print(format_path_list(bootstrapped))
        print("preserved_workspace_files:")
        print(format_path_list(sorted(set(preserved_workspace))))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
