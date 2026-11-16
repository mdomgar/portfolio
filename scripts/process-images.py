"""Genera las imágenes de public/img a partir de los originales de scripts/source.

Uso: python scripts/process-images.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "img"


def save_logo():
    logo = Image.open(ROOT / "scripts" / "source" / "solarmetrics-logo.png").convert("RGBA")
    logo.resize((256, 256), Image.LANCZOS).save(OUT / "solarmetrics-logo.webp", "WEBP", quality=85, method=6)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    save_logo()
    for file in sorted(OUT.iterdir()):
        with Image.open(file) as img:
            print(f"{file.name}: {img.size[0]}x{img.size[1]}, {file.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
