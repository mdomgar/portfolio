"""Genera las imágenes de public/img a partir de la foto original.

Uso: python scripts/process-images.py scripts/source/portrait-original.webp
Si la foto ya tiene transparencia (p. ej. un PNG de remove.bg) no se ejecuta rembg.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "img"
BG = (7, 8, 13)
TEXT = (232, 236, 244)
MUTED = (138, 147, 166)
ACCENT = (0, 229, 255)


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default(size=size)


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
    logo = Image.open(ROOT / "public" / "SolarMetrics.png").convert("RGBA")
    logo.resize((256, 256), Image.LANCZOS).save(OUT / "solarmetrics-logo.webp", "WEBP", quality=85, method=6)


def save_og(cut):
    width, height = 1200, 630
    glow = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(glow)
    draw.ellipse((720, 20, 1240, 660), fill=(0, 72, 92))
    draw.ellipse((520, 280, 920, 720), fill=(44, 30, 96))
    canvas = glow.filter(ImageFilter.GaussianBlur(120))

    person_h = 600
    person = cut.resize((round(cut.width * person_h / cut.height), person_h), Image.LANCZOS)
    canvas.paste(person, (width - person.width - 40, height - person_h), person)

    draw = ImageDraw.Draw(canvas)
    bold = load_font("C:/Windows/Fonts/segoeuib.ttf", 64)
    regular = load_font("C:/Windows/Fonts/segoeui.ttf", 34)
    draw.text((70, 190), "Miguel Ángel", font=bold, fill=TEXT)
    draw.text((70, 265), "Domínguez García", font=bold, fill=TEXT)
    draw.text((70, 365), "Web Developer · Full Stack", font=regular, fill=ACCENT)
    draw.text((70, 415), "Jaén, España", font=regular, fill=MUTED)
    canvas.save(OUT / "og-image.jpg", "JPEG", quality=85, optimize=True)


def main():
    if len(sys.argv) != 2:
        sys.exit("Uso: python scripts/process-images.py <foto>")
    OUT.mkdir(parents=True, exist_ok=True)
    cut = cutout(Path(sys.argv[1]))
    save_portraits(cut)
    save_logo()
    save_og(cut)
    for file in sorted(OUT.iterdir()):
        with Image.open(file) as img:
            print(f"{file.name}: {img.size[0]}x{img.size[1]}, {file.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
