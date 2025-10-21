import re
import sys
import urllib.request
from pathlib import Path

# Script to download Pokemon sprite icons locally under public/sprites/
# - Parses biome-data.ts to discover all used Pokemon names
# - Normalizes names to PokemonDB slug format (similar to formatPokemonNameForSprite)
# - Tries special-case URLs where needed
# - Saves PNGs to public/sprites/{slug}.png
#
# Usage (Windows PowerShell):
#   python .\scripts\download_sprites.py
#
# Notes: This script only downloads 'icon' sprites from Scarlet/Violet when available,
# with a couple of exceptions aligned with the app component.

WORKSPACE = Path(__file__).resolve().parents[1]
BIOME_DATA = WORKSPACE / "biome-data.ts"
OUTPUT_DIR = WORKSPACE / "public" / "sprites"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REGIONAL_FORMS = ["alolan", "galarian", "hisuian", "paldean"]

# Map input names to slug overrides
NAME_OVERRIDES = {
    "bloodmoon-ursaluna": "ursaluna-bloodmoon",
    "flabébé": "flabebe",
    "eternal-floette": "floette-eternal",
}

# Some slugs have unique image paths
SPECIAL_URLS = {
    "ursuluna-bloodmoon": "https://img.pokemondb.net/sprites/scarlet-violet/normal/ursaluna-bloodmoon.png",
    "darmanitan-galarian": "https://img.pokemondb.net/sprites/sword-shield/normal/darmanitan-galarian-standard.png",
}

ICON_URL = "https://img.pokemondb.net/sprites/scarlet-violet/icon/{slug}.png"


def to_slug(name: str) -> str:
    s = name.lower()
    # move regional form to suffix
    for form in REGIONAL_FORMS:
        if s.startswith(form + " "):
            parts = s.split(" ")
            s = "-".join(parts[1:]) + f"-{form}"
            break
    # normalize characters
    s = (
        s.replace(" ", "-")
        .replace(".", "")
        .replace("'", "")
        .replace(":", "")
        .replace("♀", "-f")
        .replace("♂", "-m")
    )
    if s in NAME_OVERRIDES:
        return NAME_OVERRIDES[s]
    return s


def extract_pokemon_names(ts_path: Path) -> set[str]:
    text = ts_path.read_text(encoding="utf-8")
    # naive JSON-ish extraction: find all quoted strings inside arrays
    # This is sufficient given the structure in biome-data.ts
    pattern = re.compile(r'"([^"]+)"')
    names = set(m.group(1) for m in pattern.finditer(text))
    # Filter out biome names and keys that aren't Pokemon by heuristic: exclude known biome list
    # We'll include all and rely on HTTP 404 to skip non-existent sprites safely.
    return names


def download(url: str, dest: Path) -> bool:
    try:
        with urllib.request.urlopen(url) as resp:
            if resp.status != 200:
                return False
            data = resp.read()
            dest.write_bytes(data)
            return True
    except Exception as e:
        return False


def main():
    names = extract_pokemon_names(BIOME_DATA)
    slugs = sorted({to_slug(n) for n in names})

    print(f"Found {len(slugs)} unique candidate slugs. Downloading...")
    success = 0
    skipped = 0
    for slug in slugs:
        out = OUTPUT_DIR / f"{slug}.png"
        if out.exists():
            skipped += 1
            continue
        url = SPECIAL_URLS.get(slug, ICON_URL.format(slug=slug))
        if download(url, out):
            success += 1
            print(f"OK  {slug}")
        else:
            # remove partial file if created
            if out.exists():
                try:
                    out.unlink()
                except Exception:
                    pass
            print(f"MISS {slug}")
    print(f"Done. Downloaded: {success}, skipped existing: {skipped}")


if __name__ == "__main__":
    sys.exit(main())
