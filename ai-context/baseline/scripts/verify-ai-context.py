#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path

from ai_context_sync_lib import (
    add_common_arguments,
    entry_enabled,
    expand_file_patterns,
    file_sha256,
    format_migration,
    format_path_list,
    load_manifest,
    placeholder_file_is_optional,
    resolve_mode,
    source_checkout,
    validate_source_args,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify ai-context baseline and local structure.")
    add_common_arguments(parser, require_source=False)
    args = parser.parse_args()
    validate_source_args(args, require_source=False)

    target_root = Path(args.target_dir).resolve()

    if args.source_dir or args.source_repo:
        checkout_cm = source_checkout(args.source_dir, args.source_repo, args.branch)
    else:
        checkout_cm = None

    issues: list[str] = []

    if checkout_cm is None:
        manifest = load_manifest(target_root)
        mode = resolve_mode(target_root, target_root, args.mode)
        local_manifest = manifest["local"]
        for entry in local_manifest["ensure_directories"]:
            if entry_enabled(entry, mode) and not (target_root / entry["path"]).exists():
                issues.append(f"missing local directory: {entry['path']}")
        for entry in local_manifest["ensure_files"]:
            if not entry_enabled(entry, mode):
                continue
            target_path = target_root / entry["target"]
            if target_path.exists() or placeholder_file_is_optional(target_path):
                continue
            issues.append(f"missing local file: {entry['target']}")
        for entry in local_manifest.get("migrate_paths", []):
            if entry_enabled(entry, mode) and (target_root / entry["source"]).exists():
                issues.append(f"legacy local path still present: {format_migration(entry['source'], entry['target'])}")
    else:
        with checkout_cm as source:
            manifest = load_manifest(source.root)
            mode = resolve_mode(target_root, source.root, args.mode)
            local_manifest = manifest["local"]

            baseline_patterns = manifest["baseline"]["replace"]
            expected_files = set(expand_file_patterns(source.root, baseline_patterns))
            actual_files = set(expand_file_patterns(target_root, baseline_patterns))

            for rel_path in sorted(expected_files - actual_files):
                issues.append(f"missing baseline file: {rel_path}")

            for rel_path in sorted(actual_files - expected_files):
                issues.append(f"unexpected baseline file: {rel_path}")

            for rel_path in sorted(expected_files & actual_files):
                source_path = source.root / rel_path
                target_path = target_root / rel_path
                if file_sha256(source_path) != file_sha256(target_path):
                    issues.append(f"baseline drift: {rel_path}")

            for entry in local_manifest["ensure_directories"]:
                if entry_enabled(entry, mode) and not (target_root / entry["path"]).exists():
                    issues.append(f"missing local directory: {entry['path']}")

            for entry in local_manifest["ensure_files"]:
                if not entry_enabled(entry, mode):
                    continue
                target_path = target_root / entry["target"]
                if target_path.exists() or placeholder_file_is_optional(target_path):
                    continue
                issues.append(f"missing local file: {entry['target']}")

            for entry in local_manifest.get("migrate_paths", []):
                if entry_enabled(entry, mode) and (target_root / entry["source"]).exists():
                    issues.append(f"legacy local path still present: {format_migration(entry['source'], entry['target'])}")

    if issues:
        print("ai-context verify failed")
        print(format_path_list(issues))
        return 1

    print("ai-context verify passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
