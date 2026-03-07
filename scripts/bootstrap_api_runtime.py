from __future__ import annotations

from pathlib import Path
import shutil
import site
import sys


EXCLUDED_NAMES = {
    "a1_coverage.pth",
    "pulso_bootstrap.pth",
    "pulso_local_app.pth",
}
EXCLUDED_PREFIXES = (
    "__editable__",
)


def should_skip(path: Path) -> bool:
    name = path.name
    if name in EXCLUDED_NAMES:
        return True
    return any(name.startswith(prefix) for prefix in EXCLUDED_PREFIXES)


def main() -> int:
    if len(sys.argv) != 3:
        raise SystemExit("usage: bootstrap_api_runtime.py <venv_site_packages> <api_dir>")

    target_site_packages = Path(sys.argv[1]).resolve()
    api_dir = Path(sys.argv[2]).resolve()
    target_site_packages.mkdir(parents=True, exist_ok=True)

    source_site_packages = Path(site.getsitepackages()[-1]).resolve()

    for item in source_site_packages.iterdir():
        if should_skip(item):
            continue
        destination = target_site_packages / item.name
        if item.is_dir():
            shutil.copytree(item, destination, dirs_exist_ok=True)
        else:
            shutil.copy2(item, destination)

    for stale_name in ("pulso_bootstrap.pth", "__editable__.polis_ai_backend-0.1.0.pth"):
        stale_path = target_site_packages / stale_name
        if stale_path.exists():
            stale_path.unlink()

    for stale_name in ("__editable___polis_ai_backend_0_1_0_finder.py",):
        stale_path = target_site_packages / stale_name
        if stale_path.exists():
            if stale_path.is_dir():
                shutil.rmtree(stale_path)
            else:
                stale_path.unlink()

    (target_site_packages / "pulso_local_app.pth").write_text(f"{api_dir}\n", encoding="ascii")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
