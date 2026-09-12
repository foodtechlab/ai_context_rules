#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


SKILLS_MANIFEST = Path("ai-context/baseline/skills/manifest.json")
SKILL_NAME_PATTERN = re.compile(r"aic-[a-z0-9]+(?:-[a-z0-9]+)*\Z")


def load_skills_manifest(repo_root: Path) -> dict:
    path = repo_root / SKILLS_MANIFEST
    if not path.is_file():
        raise RuntimeError(f"Skills manifest not found: {path}")
    manifest = json.loads(path.read_text(encoding="utf-8"))
    validate_skills_manifest(repo_root, manifest)
    return manifest


def parse_skill_name(skill_file: Path) -> str | None:
    text = skill_file.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(?P<header>.*?)\n---(?:\s*\n|\Z)", text, re.DOTALL)
    if not match:
        return None
    for line in match.group("header").splitlines():
        if line.startswith("name:"):
            return line.split(":", 1)[1].strip()
    return None


def parse_display_name(openai_yaml: Path) -> str | None:
    for line in openai_yaml.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("display_name:"):
            return stripped.split(":", 1)[1].strip().strip('"').strip("'")
    return None


def validate_skills_manifest(repo_root: Path, manifest: dict) -> None:
    if manifest.get("manifest_version") != 1:
        raise RuntimeError("Unsupported skills manifest_version; expected 1.")

    target_directory = manifest.get("target_directory")
    state_file = manifest.get("state_file")
    name_prefix = manifest.get("name_prefix")
    display_prefix = manifest.get("display_name_prefix")
    skills = manifest.get("skills")

    if target_directory != ".agents/skills":
        raise RuntimeError("Only repository scope .agents/skills is supported.")
    if state_file != ".agents/skills/.aic-installed.json":
        raise RuntimeError("Unexpected skills state_file.")
    if name_prefix != "aic-" or display_prefix != "AIC: ":
        raise RuntimeError("Skills prefixes must be aic- and AIC: .")
    if not isinstance(skills, list):
        raise RuntimeError("Skills manifest field 'skills' must be a list.")

    seen: set[str] = set()
    for entry in skills:
        name = entry.get("name")
        source = entry.get("source")
        if not isinstance(name, str) or not SKILL_NAME_PATTERN.fullmatch(name):
            raise RuntimeError(f"Invalid managed skill name: {name!r}")
        if name in seen:
            raise RuntimeError(f"Duplicate managed skill name: {name}")
        seen.add(name)
        if not isinstance(source, str):
            raise RuntimeError(f"Missing source for managed skill: {name}")

        relative_source = Path(source)
        expected_source = Path("ai-context/baseline/skills") / name
        if relative_source != expected_source:
            raise RuntimeError(f"Source for {name} must be {expected_source.as_posix()}.")

        source_path = repo_root / relative_source
        skill_file = source_path / "SKILL.md"
        openai_yaml = source_path / "agents" / "openai.yaml"
        if not skill_file.is_file():
            raise RuntimeError(f"Missing SKILL.md for {name}: {skill_file}")
        if source_path.name != name or parse_skill_name(skill_file) != name:
            raise RuntimeError(f"Directory and SKILL.md name must equal {name}.")
        if not openai_yaml.is_file():
            raise RuntimeError(f"Missing agents/openai.yaml for {name}: {openai_yaml}")
        display_name = parse_display_name(openai_yaml)
        if not display_name or not display_name.startswith(display_prefix):
            raise RuntimeError(f"display_name for {name} must start with {display_prefix!r}.")


def directory_digest(path: Path) -> str:
    digest = hashlib.sha256()
    for candidate in sorted(item for item in path.rglob("*") if item.is_file()):
        relative = candidate.relative_to(path).as_posix()
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(candidate.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def load_install_state(path: Path) -> dict:
    if not path.is_file():
        return {"manifest_version": 1, "managed_skills": {}}
    state = json.loads(path.read_text(encoding="utf-8"))
    if state.get("manifest_version") != 1 or not isinstance(state.get("managed_skills"), dict):
        raise RuntimeError(f"Invalid AIC skills state file: {path}")
    for name in state["managed_skills"]:
        if not isinstance(name, str) or not SKILL_NAME_PATTERN.fullmatch(name):
            raise RuntimeError(f"Invalid managed skill name in state file: {name!r}")
    return state
