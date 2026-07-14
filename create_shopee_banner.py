from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math

ROOT = Path(__file__).resolve().parent
PHOTO = ROOT / "assets" / "photos"
OUT = ROOT / "aurelia-mode-shopee-banner-1200x400.png"
OUT_JPG = ROOT / "aurelia-mode-shopee-banner-1200x400.jpg"

W, H = 1200, 400
img = Image.new("RGB", (W, H), "#fbf1f1")
px = img.load()
for y in range(H):
    for x in range(W):
        t = (x / W) * 0.75 + (y / H) * 0.25
        px[x, y] = (int(250 - 15 * t), int(235 + 8 * t), int(238 + 7 * t))

draw = ImageDraw.Draw(img, "RGBA")

# Soft decorative shapes matching the site's rose / mint palette.
draw.ellipse((-140, 220, 280, 630), fill=(219, 137, 160, 36))
draw.ellipse((845, -220, 1340, 280), fill=(145, 201, 191, 45))
draw.ellipse((720, 260, 1080, 620), fill=(255, 255, 255, 55))

FONT = r"C:\Windows\Fonts\segoeui.ttf"
FONT_B = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_S = r"C:\Windows\Fonts\georgia.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def rounded_photo(path, box, radius=24, border=(255, 255, 255, 210), border_w=5):
    x, y, w, h = box
    src = Image.open(path).convert("RGB")
    scale = max(w / src.width, h / src.height)
    src = src.resize((int(src.width * scale), int(src.height * scale)), Image.Resampling.LANCZOS)
    left = (src.width - w) // 2
    top = (src.height - h) // 2
    src = src.crop((left, top, left + w, top + h))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius, fill=255)
    shadow = Image.new("RGBA", (w + 18, h + 18), (0, 0, 0, 0))
    sm = Image.new("L", shadow.size, 0)
    ImageDraw.Draw(sm).rounded_rectangle((9, 9, w + 8, h + 8), radius, fill=90)
    shadow.putalpha(sm.filter(ImageFilter.GaussianBlur(8)))
    img.paste(shadow, (x - 9, y - 2), shadow)
    img.paste(src, (x, y), mask)
    draw.rounded_rectangle((x, y, x + w - 1, y + h - 1), radius, outline=border, width=border_w)

# Brand and headline.
draw.rounded_rectangle((50, 42, 245, 82), 20, fill=(255, 255, 255, 150))
draw.ellipse((63, 51, 87, 75), fill=(201, 79, 114, 255))
draw.text((96, 49), "Online Shop", font=font(FONT_B, 22), fill="#412b36")
draw.text((52, 110), "Koleksi Fashion", font=font(FONT_S, 47), fill="#412b36")
draw.text((52, 158), "Wanita Pilihan", font=font(FONT_B, 47), fill="#c94f72")
draw.text((55, 226), "Dress • Blouse • Outer • Tas • Rok • Heels", font=font(FONT, 18), fill="#6a505a")

# Offer pill and CTA.
draw.rounded_rectangle((52, 274, 272, 322), 24, fill="#c94f72")
draw.text((72, 284), "DISKON HINGGA 30%", font=font(FONT_B, 17), fill="#ffffff")
draw.text((55, 347), "Temukan gaya favoritmu hari ini", font=font(FONT, 16), fill="#6a505a")

# Product montage from the website's real catalog images.
rounded_photo(PHOTO / "dress-1.jpg", (615, 42, 222, 306), 28)
rounded_photo(PHOTO / "bag-1.jpg", (858, 46, 145, 145), 22)
rounded_photo(PHOTO / "heels-1.jpg", (1018, 46, 145, 145), 22)
rounded_photo(PHOTO / "blouse-1.jpg", (858, 213, 145, 145), 22)
rounded_photo(PHOTO / "skirt-1.jpg", (1018, 213, 145, 145), 22)

# Small labels keep the offer legible on Shopee's compact banner crop.
draw.rounded_rectangle((633, 315, 820, 354), 18, fill=(255, 255, 255, 215))
draw.text((652, 324), "Satin Midi Dress", font=font(FONT_B, 14), fill="#412b36")
draw.text((1013, 370), "aureliamode", font=font(FONT, 12), fill="#8b6875")

img.save(OUT, quality=95, optimize=True)
img.save(OUT_JPG, quality=94, optimize=True, progressive=True)
print(OUT)
