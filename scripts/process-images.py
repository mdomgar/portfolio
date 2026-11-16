"""Genera las imágenes de public/img a partir de la foto original.

Uso: python scripts/process-images.py scripts/source/portrait-original.webp
Si la foto ya tiene transparencia (p. ej. un PNG de remove.bg) no se ejecuta rembg.
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "img"


def cutout(src):
    img = Image.open(src)
    if img.mode == "RGBA" and img.getextrema()[3][0] < 255:
        return img
    from rembg import new_session, remove

    session = new_session("isnet-general-use")
    return remove(img.convert("RGB"), session=session, alpha_matting=True)


def save_portraits(cut):
    cut.save(OUT / "portrait-1086.webp", "WEBP", quality=82, method=6)
    small = cut.resize((540, round(cut.height * 540 / cut.width)), Image.LANCZOS)
    small.save(OUT / "portrait-540.webp", "WEBP", quality=80, method=6)


def save_logo():
    logo = Image.open(ROOT / "scripts" / "source" / "solarmetrics-logo.png").convert("RGBA")
    logo.resize((256, 256), Image.LANCZOS).save(OUT / "solarmetrics-logo.webp", "WEBP", quality=85, method=6)


def main():
    if len(sys.argv) != 2:
        sys.exit("Uso: python scripts/process-images.py <foto>")
    OUT.mkdir(parents=True, exist_ok=True)
    cut = cutout(Path(sys.argv[1]))
    save_portraits(cut)
    save_logo()
    for file in sorted(OUT.iterdir()):
        with Image.open(file) as img:
            print(f"{file.name}: {img.size[0]}x{img.size[1]}, {file.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
