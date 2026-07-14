from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PHOTO = ROOT / "assets" / "photos" / "dress-1.jpg"
OUT_PNG = ROOT / "iklan-jasa-pembuatan-website-1000x1000.png"
OUT_JPG = ROOT / "iklan-jasa-pembuatan-website-1000x1000.jpg"
S = 10
W = H = 1000

img = Image.new("RGB", (W, H))
for y in range(H):
    for x in range(W):
        t = (x + y) / (2 * (W - 1))
        img.putpixel((x, y), (int(252 - 16 * t), int(236 + 11 * t), int(239 + 7 * t)))
draw = ImageDraw.Draw(img, "RGBA")

def box(b): return tuple(int(v * S) for v in b)
def F(path, size): return ImageFont.truetype(path, int(size * S))
FB = r"C:\Windows\Fonts\segoeuib.ttf"
FR = r"C:\Windows\Fonts\segoeui.ttf"

draw.ellipse(box((-34, 62, 44, 136)), fill=(205, 80, 115, 55))
draw.ellipse(box((62, -28, 138, 51)), fill=(140, 198, 189, 80))

# Browser preview card, using a real product photo from the supplied website.
draw.rounded_rectangle(box((56, 7, 95, 66)), radius=6*S, fill=(255,255,255,245), outline=(255,255,255,220), width=2*S)
draw.rounded_rectangle(box((59, 10, 92, 14)), radius=2*S, fill="#f7dce3")
draw.ellipse(box((61, 11, 63, 13)), fill="#c94f72")
draw.text((66*S, 10*S), "Online Shop", font=F(FB, 3), fill="#412b36")
photo = Image.open(PHOTO).convert("RGB").resize((310, 320), Image.Resampling.LANCZOS)
img.paste(photo, (600, 170))
draw.rounded_rectangle(box((60, 52, 91, 56)), radius=2*S, fill="#fbecf0")
draw.text((62*S, 52*S), "Fashion Store", font=F(FB, 3), fill="#6a505a")
draw.rounded_rectangle(box((60, 58, 78, 63)), radius=2*S, fill="#c94f72")
draw.text((63*S, 59*S), "Belanja", font=F(FB, 3), fill="#ffffff")

# Main ad message.
draw.text((6*S, 9*S), "JASA", font=F(FB, 10), fill="#412b36")
draw.text((6*S, 19*S), "BUAT", font=F(FB, 10), fill="#c94f72")
draw.text((6*S, 29*S), "WEBSITE", font=F(FB, 9), fill="#412b36")
draw.text((6*S, 39*S), "TOKO ONLINE", font=F(FB, 6), fill="#6a505a")
draw.rounded_rectangle(box((6, 48, 49, 61)), radius=6*S, fill="#c94f72")
draw.text((9*S, 51*S), "MULAI SEKARANG", font=F(FB, 4.1), fill="#ffffff")
draw.text((6*S, 69*S), "Tampilan modern", font=F(FR, 5), fill="#6a505a")
draw.text((6*S, 76*S), "Siap jualan online", font=F(FB, 5), fill="#412b36")
draw.text((6*S, 91*S), "Online Shop", font=F(FB, 5), fill="#c94f72")

img.save(OUT_PNG, optimize=True)
img.save(OUT_JPG, quality=95, optimize=True, progressive=True)
print(OUT_PNG)
