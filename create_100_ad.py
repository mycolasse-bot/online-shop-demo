from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PHOTO = ROOT / "assets" / "photos" / "dress-1.jpg"
OUT_PNG = ROOT / "iklan-jasa-pembuatan-website-100x100.png"
OUT_JPG = ROOT / "iklan-jasa-pembuatan-website-100x100.jpg"

W = H = 100
img = Image.new("RGB", (W, H), "#fff4f5")
draw = ImageDraw.Draw(img, "RGBA")

# Rose-to-mint background blocks keep the visual connected to Online Shop.
for y in range(H):
    for x in range(W):
        t = (x + y) / 198
        img.putpixel((x, y), (int(252 - 16 * t), int(236 + 11 * t), int(239 + 7 * t)))
draw = ImageDraw.Draw(img, "RGBA")
draw.ellipse((-34, 62, 44, 136), fill=(205, 80, 115, 55))
draw.ellipse((62, -28, 138, 51), fill=(140, 198, 189, 80))

def f(path, size):
    return ImageFont.truetype(path, size)

FB = r"C:\Windows\Fonts\segoeuib.ttf"
FR = r"C:\Windows\Fonts\segoeui.ttf"

# Tiny browser-card preview using a real catalog photo.
card = (56, 7, 95, 66)
draw.rounded_rectangle(card, radius=6, fill=(255, 255, 255, 245), outline=(255, 255, 255, 220), width=1)
draw.rounded_rectangle((59, 10, 92, 14), radius=2, fill="#f7dce3")
draw.ellipse((61, 11, 63, 13), fill="#c94f72")
draw.text((66, 10), "Online Shop", font=f(FB, 3), fill="#412b36")
photo = Image.open(PHOTO).convert("RGB").resize((31, 32), Image.Resampling.LANCZOS)
img.paste(photo, (60, 17))
draw.rounded_rectangle((60, 52, 91, 56), radius=2, fill="#fbecf0")
draw.text((62, 52), "Fashion Store", font=f(FB, 3), fill="#6a505a")
draw.rounded_rectangle((60, 58, 78, 63), radius=2, fill="#c94f72")
draw.text((63, 59), "Belanja", font=f(FB, 3), fill="#ffffff")

# Ad copy at readable pixel scale.
draw.text((6, 9), "JASA", font=f(FB, 10), fill="#412b36")
draw.text((6, 19), "BUAT", font=f(FB, 10), fill="#c94f72")
draw.text((6, 29), "WEBSITE", font=f(FB, 9), fill="#412b36")
draw.text((6, 39), "TOKO ONLINE", font=f(FB, 6), fill="#6a505a")
draw.rounded_rectangle((6, 48, 49, 61), radius=6, fill="#c94f72")
draw.text((10, 51), "MULAI SEKARANG", font=f(FB, 5), fill="#ffffff")
draw.text((6, 69), "Tampilan modern", font=f(FR, 5), fill="#6a505a")
draw.text((6, 76), "Siap jualan online", font=f(FB, 5), fill="#412b36")
draw.text((6, 91), "Online Shop", font=f(FB, 5), fill="#c94f72")

img.save(OUT_PNG, optimize=True)
img.save(OUT_JPG, quality=95, optimize=True)
print(OUT_PNG)
