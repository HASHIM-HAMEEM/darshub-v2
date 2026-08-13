from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "assets" / "images"
source = root / "icon.png"
image = Image.open(source).convert("RGBA")

targets = {
    "icon.png": 1024,
    "splash-icon.png": 1024,
    "android-icon-foreground.png": 1024,
    "android-icon-monochrome.png": 512,
    "favicon.png": 192,
}

for filename, size in targets.items():
    rendered = image.resize((size, size), Image.Resampling.LANCZOS)
    rendered.save(root / filename, format="PNG", optimize=True, compress_level=9)
