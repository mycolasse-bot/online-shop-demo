from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PHOTO = ROOT / "assets" / "photos"
OUT_PNG = ROOT / "iklan-website-desktop-mobile-1000x1000.png"
OUT_JPG = ROOT / "iklan-website-desktop-mobile-1000x1000.jpg"
W = H = 1000

img = Image.new("RGB", (W, H), "#f7edf1")
px = img.load()
for y in range(H):
    for x in range(W):
        t = (x / W) * 0.65 + (y / H) * 0.35
        px[x, y] = (int(249 - 18*t), int(235 + 10*t), int(240 + 11*t))
draw = ImageDraw.Draw(img, "RGBA")

def F(path, size): return ImageFont.truetype(path, size)
FB = r"C:\Windows\Fonts\segoeuib.ttf"
FR = r"C:\Windows\Fonts\segoeui.ttf"
FG = r"C:\Windows\Fonts\georgia.ttf"

# Background accents.
draw.ellipse((-220, 720, 350, 1260), fill=(203, 82, 116, 45))
draw.ellipse((730, -210, 1240, 300), fill=(143, 199, 190, 76))
for x in range(35, 1000, 48):
    draw.line((x, 300, x + 170, 0), fill=(255,255,255,28), width=2)

# Headline and selling points.
draw.rounded_rectangle((55, 42, 300, 88), 23, fill=(255,255,255,195))
draw.ellipse((72, 55, 96, 79), fill="#c94f72")
draw.text((112, 52), "JASA WEB DESIGN", font=F(FB, 25), fill="#412b36")
draw.text((55, 116), "Website Cantik.", font=F(FG, 52), fill="#412b36")
draw.text((55, 175), "Jualan Makin Asik!", font=F(FB, 45), fill="#c94f72")
draw.text((58, 232), "Toko online modern untuk brand yang ingin naik kelas", font=F(FR, 22), fill="#6a505a")
draw.rounded_rectangle((57, 267, 284, 303), 18, fill="#412b36")
draw.text((76, 275), "DESKTOP + MOBILE READY", font=F(FB, 13), fill="#ffffff")
draw.rounded_rectangle((296, 267, 474, 303), 18, fill="#ffffff", outline=(201,79,114,150), width=2)
draw.text((321, 275), "CHECKOUT SIAP", font=F(FB, 13), fill="#c94f72")

# Desktop monitor shadow and frame.
draw.rounded_rectangle((45, 335, 700, 890), 32, fill=(47, 33, 42, 45))
draw.rounded_rectangle((38, 318, 693, 873), 28, fill="#332832")
draw.rounded_rectangle((58, 338, 673, 810), 16, fill="#ffffff")
draw.rectangle((58, 338, 673, 385), fill="#fff7f8")
draw.ellipse((76, 355, 88, 367), fill="#c94f72")
draw.text((102, 348), "Online Shop", font=F(FB, 16), fill="#412b36")
draw.rounded_rectangle((220, 350, 540, 372), 10, fill="#f7e3e8")
draw.text((235, 353), "Cari dress, blouse, tas...", font=F(FR, 11), fill="#927782")
draw.text((595, 350), "Cart", font=F(FB, 14), fill="#6a505a")

# Desktop hero.
draw.rounded_rectangle((78, 405, 653, 535), 18, fill="#f7d9e1")
draw.text((102, 430), "Koleksi Fashion Wanita", font=F(FR, 16), fill="#6a505a")
draw.text((102, 454), "Online Shop", font=F(FB, 30), fill="#412b36")
draw.text((102, 494), "Diskon sampai 30%", font=F(FB, 18), fill="#c94f72")
hero = Image.open(PHOTO / "dress-1.jpg").convert("RGB").resize((125, 125), Image.Resampling.LANCZOS)
img.paste(hero, (513, 408))

# Desktop product cards.
products = [("dress-1.jpg", "Satin Dress"), ("blouse-1.jpg", "Puff Blouse"), ("bag-1.jpg", "Mini Bag"), ("heels-1.jpg", "Block Heels")]
for i, (name, label) in enumerate(products):
    x = 78 + i * 142
    draw.rounded_rectangle((x, 565, x+125, 772), 12, fill="#ffffff", outline="#f0dce2", width=2)
    p = Image.open(PHOTO / name).convert("RGB").resize((111, 132), Image.Resampling.LANCZOS)
    img.paste(p, (x+7, 575))
    draw.text((x+9, 716), label, font=F(FB, 12), fill="#412b36")
    draw.text((x+9, 739), "Mulai Rp189rb", font=F(FR, 10), fill="#c94f72")
draw.rounded_rectangle((255, 830, 480, 858), 14, fill="#c94f72")
draw.text((310, 837), "DESKTOP VIEW", font=F(FB, 13), fill="#ffffff")

# Phone frame on the right.
draw.rounded_rectangle((735, 315, 967, 900), 42, fill=(47, 33, 42, 45))
draw.rounded_rectangle((725, 300, 957, 885), 38, fill="#30262f")
draw.rounded_rectangle((739, 327, 943, 858), 24, fill="#ffffff")
draw.rounded_rectangle((802, 312, 880, 332), 10, fill="#30262f")
draw.rectangle((739, 350, 943, 390), fill="#fff7f8")
draw.ellipse((754, 363, 765, 374), fill="#c94f72")
draw.text((781, 356), "Online Shop", font=F(FB, 14), fill="#412b36")
draw.text((862, 357), "☰", font=F(FB, 18), fill="#6a505a")
draw.rounded_rectangle((752, 410, 930, 526), 15, fill="#f7d9e1")
draw.text((765, 428), "Fashion untukmu", font=F(FB, 17), fill="#412b36")
draw.text((765, 459), "Diskon 30%", font=F(FB, 20), fill="#c94f72")
phone_img = Image.open(PHOTO / "dress-1.jpg").convert("RGB").resize((62, 92), Image.Resampling.LANCZOS)
img.paste(phone_img, (854, 420))
for i, (name, label) in enumerate(products[:3]):
    x = 752 + (i % 2) * 91
    y = 548 + (i // 2) * 135
    draw.rounded_rectangle((x, y, x+80, y+116), 9, fill="#ffffff", outline="#f0dce2", width=1)
    p = Image.open(PHOTO / name).convert("RGB").resize((68, 72), Image.Resampling.LANCZOS)
    img.paste(p, (x+6, y+6))
    draw.text((x+8, y+84), label.split()[0], font=F(FB, 8), fill="#412b36")
    draw.text((x+8, y+98), "Rp189rb", font=F(FR, 7), fill="#c94f72")
draw.rounded_rectangle((753, 803, 930, 835), 14, fill="#c94f72")
draw.text((806, 811), "MOBILE VIEW", font=F(FB, 12), fill="#ffffff")

# Bottom CTA.
draw.rounded_rectangle((55, 922, 945, 970), 24, fill="#412b36")
draw.ellipse((72, 936, 88, 952), fill="#e6b86a")
draw.text((150, 933), "Bikin brand terlihat premium — mulai websitemu hari ini!", font=F(FB, 21), fill="#ffffff")

img.save(OUT_PNG, optimize=True)
img.save(OUT_JPG, quality=95, optimize=True, progressive=True)
print(OUT_PNG)
