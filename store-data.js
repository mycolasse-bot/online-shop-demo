window.StoreData = (() => {
  const productPhotos = {
    dress: [
      "assets/photos/dress-1.jpg",
      "assets/photos/dress-2.jpg",
      "assets/photos/dress-3.jpg",
      "assets/photos/dress-4.jpg",
      "assets/photos/dress-5.jpg",
      "assets/photos/dress-6.jpg"
    ],
    blouse: [
      "assets/photos/blouse-1.jpg",
      "assets/photos/blouse-2.jpg",
      "assets/photos/blouse-3.jpg",
      "assets/photos/blouse-4.jpg",
      "assets/photos/blouse-5.jpg",
      "assets/photos/blouse-6.jpg"
    ],
    outer: [
      "assets/photos/outer-1.jpg",
      "assets/photos/outer-2.jpg",
      "assets/photos/outer-3.jpg",
      "assets/photos/outer-4.jpg",
      "assets/photos/outer-5.jpg",
      "assets/photos/outer-6.jpg"
    ],
    bag: [
      "assets/photos/bag-1.jpg",
      "assets/photos/bag-2.jpg",
      "assets/photos/bag-3.jpg",
      "assets/photos/bag-4.jpg",
      "assets/photos/bag-5.jpg",
      "assets/photos/bag-6.jpg"
    ],
    skirt: [
      "assets/photos/skirt-1.jpg",
      "assets/photos/skirt-2.jpg",
      "assets/photos/skirt-3.jpg",
      "assets/photos/skirt-4.jpg",
      "assets/photos/skirt-5.jpg",
      "assets/photos/skirt-6.jpg"
    ],
    heels: [
      "assets/photos/heels-1.jpg",
      "assets/photos/heels-2.jpg",
      "assets/photos/heels-3.jpg",
      "assets/photos/heels-4.jpg",
      "assets/photos/heels-5.jpg",
      "assets/photos/heels-6.jpg"
    ],
    elektronik: [
      "assets/photos/electronics-real.png",
      "assets/photos/electronics-2.png",
      "assets/photos/electronics-3.png",
      "assets/photos/electronics-4.png",
      "assets/photos/electronics-5.png"
    ],
    kecantikan: [
      "assets/photos/beauty-real.png",
      "assets/photos/beauty-2.png",
      "assets/photos/beauty-3.png",
      "assets/photos/beauty-4.png",
      "assets/photos/beauty-5.png"
    ],
    rumah: [
      "assets/photos/home-real.png",
      "assets/photos/home-2.png",
      "assets/photos/home-3.png",
      "assets/photos/home-4.png",
      "assets/photos/home-5.png"
    ]
  };

  const categories = [
    { id: "elektronik", name: "Elektronik", image: productPhotos.elektronik[0] },
    { id: "fashion", name: "Fashion", image: productPhotos.dress[0] },
    { id: "kecantikan", name: "Kecantikan", image: productPhotos.kecantikan[0] },
    { id: "rumah", name: "Rumah Tangga", image: productPhotos.rumah[0] }
  ];

  const products = [
    {
      id: "dress",
      title: "Luna Satin Midi Dress",
      category: "Dress",
      price: 329000,
      discount: 25,
      sold: 128,
      stock: 34,
      rating: 4.9,
      material: "Satin premium, halus, ringan",
      color: "Dusty rose",
      weight: "450 gram",
      description:
        "Dress satin midi dengan potongan ramping, lembut di kulit, dan jatuh rapi untuk dinner, pesta kecil, atau acara kantor.",
      detail:
        "Bagian neckline dibuat clean dengan tali ramping. Tekstur satin memberi kilau lembut tanpa terlihat berlebihan. Cocok dipadukan dengan heels nude dan mini bag."
    },
    {
      id: "blouse",
      title: "Mira Puff Sleeve Blouse",
      category: "Blouse",
      price: 189000,
      discount: 15,
      sold: 214,
      stock: 56,
      rating: 4.8,
      material: "Katun rayon, adem",
      color: "Ivory",
      weight: "280 gram",
      description:
        "Blouse lengan puff dengan kancing depan dan siluet feminin untuk tampilan kantor, kuliah, dan casual harian.",
      detail:
        "Bahan terasa ringan dan tidak kaku. Detail kancing depan memudahkan styling, sementara lengan puff memberi volume manis tanpa membuat bahu terlihat berat."
    },
    {
      id: "outer",
      title: "Nara Linen Relaxed Outer",
      category: "Outer",
      price: 249000,
      discount: 0,
      sold: 97,
      stock: 29,
      rating: 4.7,
      material: "Linen blend bertekstur",
      color: "Natural beige",
      weight: "520 gram",
      description:
        "Outer linen dengan potongan longgar, mudah dipakai sebagai layer untuk inner polos, dress, atau celana high waist.",
      detail:
        "Kain linen blend memberi tekstur natural dan tetap nyaman untuk cuaca tropis. Model relaxed cocok untuk tampilan rapi tanpa terasa formal berlebihan."
    },
    {
      id: "bag",
      title: "Clara Mini Shoulder Bag",
      category: "Tas Wanita",
      price: 279000,
      discount: 30,
      sold: 186,
      stock: 41,
      rating: 4.9,
      material: "Kulit sintetis premium",
      color: "Cream",
      weight: "600 gram",
      description:
        "Tas bahu compact dengan tekstur premium, cukup untuk ponsel, dompet kecil, kunci, dan makeup touch-up.",
      detail:
        "Handle dibuat ramping dengan aksen metal gold. Bentuknya minimalis sehingga mudah masuk ke outfit formal maupun casual."
    },
    {
      id: "skirt",
      title: "Ayla Pleated Midi Skirt",
      category: "Rok",
      price: 219000,
      discount: 10,
      sold: 143,
      stock: 48,
      rating: 4.8,
      material: "Poly pleated lembut",
      color: "Taupe",
      weight: "390 gram",
      description:
        "Rok plisket midi dengan jatuh rapi, pinggang nyaman, dan warna netral untuk kantor, kampus, atau jalan santai.",
      detail:
        "Lipatan plisket stabil dan mudah dirawat. Panjang midi memberi kesan elegan, sementara warna taupe gampang dipadukan dengan blouse terang."
    },
    {
      id: "heels",
      title: "Selene Nude Block Heels",
      category: "Sepatu Wanita",
      price: 299000,
      discount: 20,
      sold: 165,
      stock: 37,
      rating: 4.9,
      material: "Suede sintetis, sol empuk",
      color: "Nude beige",
      weight: "720 gram",
      description:
        "Heels hak kotak yang stabil dengan bantalan empuk, memberi tinggi tanpa mengorbankan kenyamanan.",
      detail:
        "Hak kotak lebih stabil untuk aktivitas lama. Warna nude membuat kaki terlihat jenjang dan cocok untuk dress, rok, maupun celana bahan."
    },
    {
      id: "earbuds",
      title: "TWS Bluetooth Earbuds Pro",
      category: "Elektronik",
      price: 89000,
      discount: 31,
      sold: 342,
      stock: 80,
      rating: 4.8,
      material: "ABS premium, charging case",
      color: "Hitam",
      weight: "180 gram",
      description: "Earbuds nirkabel ringkas dengan suara jernih, mikrofon panggilan, dan charging case praktis.",
      detail: "Cocok untuk kerja, olahraga, dan perjalanan. Pairing cepat dengan perangkat Android maupun iOS."
    },
    {
      id: "beauty-kit",
      title: "Glow Daily Skincare Set",
      category: "Kecantikan",
      price: 159000,
      discount: 20,
      sold: 188,
      stock: 45,
      rating: 4.9,
      material: "Formula ringan untuk pemakaian harian",
      color: "Universal",
      weight: "420 gram",
      description: "Paket skincare harian untuk membersihkan, melembapkan, dan menjaga kulit tetap glowing.",
      detail: "Isi paket praktis untuk rutinitas pagi dan malam dengan tekstur ringan yang nyaman."
    },
    {
      id: "home-lamp",
      title: "Luma Minimal Table Lamp",
      category: "Rumah Tangga",
      price: 129000,
      discount: 15,
      sold: 76,
      stock: 28,
      rating: 4.7,
      material: "Metal matte dan LED hemat energi",
      color: "Cream",
      weight: "700 gram",
      description: "Lampu meja minimalis untuk meja kerja, kamar tidur, dan sudut baca yang hangat.",
      detail: "Desain compact dengan cahaya lembut dan tombol praktis untuk penggunaan sehari-hari."
    },
    {
      id: "smartwatch",
      title: "Velo Fit Smartwatch AMOLED",
      category: "Elektronik",
      price: 349000,
      discount: 18,
      sold: 231,
      stock: 42,
      rating: 4.8,
      material: "Aluminium alloy dan strap silikon",
      color: "Midnight black",
      weight: "48 gram",
      description: "Smartwatch ringan dengan layar AMOLED, pemantau detak jantung, notifikasi, dan mode olahraga harian.",
      detail: "Baterai tahan hingga 7 hari, tahan percikan air, dan kompatibel dengan Android maupun iOS."
    },
    {
      id: "serum",
      title: "LumiGlow Niacinamide Serum 30ml",
      category: "Kecantikan",
      price: 119000,
      discount: 12,
      sold: 516,
      stock: 70,
      rating: 4.9,
      material: "Niacinamide 10% dan hyaluronic acid",
      color: "Clear",
      weight: "120 gram",
      description: "Serum ringan untuk membantu mencerahkan tampilan kulit dan menjaga kelembapan sehari-hari.",
      detail: "Tekstur cepat meresap, nyaman untuk rutinitas pagi dan malam. Gunakan 2–3 tetes setelah membersihkan wajah."
    },
    {
      id: "storage",
      title: "RapiBox Storage Organizer Set",
      category: "Rumah Tangga",
      price: 89000,
      discount: 10,
      sold: 318,
      stock: 64,
      rating: 4.7,
      material: "Plastik PP tebal bebas BPA",
      color: "Cream",
      weight: "800 gram",
      description: "Set tiga kotak organizer serbaguna untuk merapikan meja, kamar, dapur, dan lemari.",
      detail: "Mudah dibersihkan, bisa ditumpuk, dan dilengkapi tutup snap-lock agar isi tetap terlindungi."
    }
  ].map((product) => ({
    ...product,
    category: ["Dress", "Blouse", "Outer", "Tas Wanita", "Rok", "Sepatu Wanita"].includes(product.category) ? "Fashion" : product.category,
    photos: productPhotos[product.id] || productPhotos[product.category === "Elektronik" ? "elektronik" : product.category === "Kecantikan" ? "kecantikan" : product.category === "Rumah Tangga" ? "rumah" : "dress"],
    image: (productPhotos[product.id] || productPhotos[product.category === "Elektronik" ? "elektronik" : product.category === "Kecantikan" ? "kecantikan" : product.category === "Rumah Tangga" ? "rumah" : "dress"])[0]
  }));

  const paymentMethods = [
    {
      name: "Transfer Bank BCA",
      type: "Nomor Rekening",
      account: "1234567890",
      holder: "Online Shop"
    },
    {
      name: "Transfer Bank Mandiri",
      type: "Nomor Rekening",
      account: "1410012345678",
      holder: "Online Shop"
    },
    {
      name: "Transfer Bank BRI",
      type: "Nomor Rekening",
      account: "002301012345678",
      holder: "Online Shop"
    },
    {
      name: "Transfer Bank BNI",
      type: "Nomor Rekening",
      account: "0098765432",
      holder: "Online Shop"
    },
    {
      name: "QRIS",
      type: "Kode QRIS",
      account: "QRIS-AURELIA-MODE",
      holder: "Online Shop",
      note: "Scan QRIS melalui aplikasi bank atau dompet digital."
    },
    {
      name: "ShopeePay",
      type: "Nomor ShopeePay",
      account: "085926992333",
      holder: "Online Shop"
    },
    {
      name: "GoPay",
      type: "Nomor GoPay",
      account: "085926992333",
      holder: "Online Shop"
    },
    {
      name: "OVO",
      type: "Nomor OVO",
      account: "085926992333",
      holder: "Online Shop"
    },
    {
      name: "DANA",
      type: "Nomor DANA",
      account: "085926992333",
      holder: "Online Shop"
    },
    {
      name: "COD",
      type: "Bayar di Tempat",
      account: "Tidak perlu transfer",
      holder: "Pembayaran saat paket diterima"
    }
  ];

  const shippingOptions = [
    { name: "JNE Reguler", price: 18000 },
    { name: "SiCepat BEST", price: 22000 },
    { name: "J&T Express", price: 20000 },
    { name: "AnterAja", price: 17000 }
  ];

  return {
    categories,
    paymentMethods,
    productPhotos,
    products,
    shippingOptions
  };
})();
