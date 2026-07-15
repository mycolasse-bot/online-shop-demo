(() => {
  "use strict";

  const SELLER_KEY = "fashion_seller_login";
  const THEME_KEY = "fashion_theme";
  const PRODUCTS_KEY = "fashion_products_v4";
  const ORDERS_KEY = "fashion_orders_v3";
  const STORE_KEY = "fashion_store_profile_v1";
  const SHIPPING_KEY = "fashion_shipping_v1";
  const PAYMENT_KEY = "fashion_payments_v1";
  const PROMO_KEY = "fashion_promo_v1";
  const HOME_SETTINGS_KEY = "fashion_home_settings_v1";
  const SETTINGS_KEY = "fashion_seller_settings_v1";
  const DEFAULT_PROMO = {
    eyebrow: "🔥 PROMO TERBATAS",
    title: "Headphone Wireless Premium",
    description: "Nikmati pengalaman mendengarkan musik tanpa batas dengan kualitas suara terbaik.",
    badge: "Rp199.000 • Diskon 33%",
    mainImage: "assets/sample-product-real.jpg"
  };
  const DEFAULT_HOME_SETTINGS = {
    shortcuts: ["🛡️ Garansi 100% Original", "🚚 Gratis Ongkir", "↩️ 14 Hari Pengembalian", "🎧 Layanan 24/7"],
    categoryTitle: "Kategori Populer",
    flashTitle: "🔥 Flash Sale",
    flashStartDate: "",
    flashEndDate: "",
    promoProductId: "",
    categoryProductIds: [],
    flashProductIds: [],
    flashSalePrices: []
  };
  const allowedThemes = ["red", "orange", "blue", "teal", "green", "blue-grey"];
  const DEFAULT_STORE_PROFILE = { name: "Online Shop", phone: "", email: "seller@namadomain.com", street: "", province: "", provinceCode: "", city: "", cityCode: "", district: "", districtCode: "", postal: "" };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

  const state = {
    products: loadProducts(),
    orders: readJson(ORDERS_KEY, []),
    shippingOptions: readJson(SHIPPING_KEY, window.StoreData?.shippingOptions || []),
    paymentMethods: readJson(PAYMENT_KEY, window.StoreData?.paymentMethods || []),
    storeProfile: { ...DEFAULT_STORE_PROFILE, ...readJson(STORE_KEY, {}) },
    promo: { ...DEFAULT_PROMO, ...readJson(PROMO_KEY, {}) },
    homeSettings: { ...DEFAULT_HOME_SETTINGS, ...readJson(HOME_SETTINGS_KEY, {}) },
    currentPage: "dashboard",
    orderFilter: "all",
    productFilter: "all",
    productQuery: "",
    storeAddressDraft: { step: "province", ...DEFAULT_STORE_PROFILE, ...readJson(STORE_KEY, {}) }
  };

  state.homeSettings.shortcuts = Array.isArray(state.homeSettings.shortcuts) && state.homeSettings.shortcuts.length
    ? state.homeSettings.shortcuts.slice(0, 4)
    : [...DEFAULT_HOME_SETTINGS.shortcuts];
  while (state.homeSettings.shortcuts.length < 4) state.homeSettings.shortcuts.push(DEFAULT_HOME_SETTINGS.shortcuts[state.homeSettings.shortcuts.length]);

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) { resolve(""); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Gagal membaca file"));
      reader.readAsDataURL(file);
    });
  }

  function slugify(value) {
    return String(value || "produk")
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `produk-${Date.now()}`;
  }

  function normalizeVariants(product) {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    return variants
      .map((variant) => ({ name: String(variant?.name || "").trim(), price: Math.max(0, Number(variant?.price || 0)) }))
      .filter((variant) => variant.name && Number.isFinite(variant.price));
  }

  function loadProducts() {
    const saved = readJson(PRODUCTS_KEY, null);
    const defaults = window.StoreData?.products || [];
    return (saved || defaults).map((product) => ({
      sold: 0,
      stock: 0,
      discount: 0,
      active: product.active !== false,
      ...product,
      variants: normalizeVariants(product),
      image: product.image || product.photos?.[0] || defaultImage(product)
    }));
  }

  function defaultImage(product = {}) {
    const photos = window.StoreData?.productPhotos || {};
    const text = `${product.id || ""} ${product.category || ""} ${product.title || ""}`.toLowerCase();
    let key = "dress";
    if (text.includes("blouse")) key = "blouse";
    else if (text.includes("outer")) key = "outer";
    else if (text.includes("tas") || text.includes("bag")) key = "bag";
    else if (text.includes("rok") || text.includes("skirt")) key = "skirt";
    else if (text.includes("sepatu") || text.includes("heel")) key = "heels";
    else if (text.includes("elektronik") || text.includes("earbud")) key = "elektronik";
    else if (text.includes("cantik") || text.includes("beauty")) key = "kecantikan";
    else if (text.includes("rumah") || text.includes("lamp")) key = "rumah";
    return photos[key]?.[0] || "../hero-fashion.svg";
  }

  function imageSrc(source) {
    const src = source || "../hero-fashion.svg";
    if (/^(data:|https?:|\.\.\/|\/)/.test(src)) return src;
    return `../${src.replace(/^\.\//, "")}`;
  }

  function orderStatus(order) {
    const text = String(order.status || "").toLowerCase();
    if (text.includes("batal") || text.includes("kembali") || text.includes("refund")) return "cancelled";
    if (text.includes("kirim") || text.includes("selesai") || text.includes("diproses")) return "processed";
    return "pending";
  }

  function orderTotal(order) {
    if (Number.isFinite(Number(order.total))) return Number(order.total);
    if (Number.isFinite(Number(order.grandTotal))) return Number(order.grandTotal);
    if (Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || item.quantity || 1), 0);
    }
    return 0;
  }

  function compactCurrency(value) {
    const number = Number(value || 0);
    if (number >= 1_000_000) return `Rp${(number / 1_000_000).toFixed(number >= 10_000_000 ? 0 : 1)}Jt`;
    if (number >= 1_000) return `Rp${(number / 1_000).toFixed(number >= 100_000 ? 0 : 1)}K`;
    return rupiah.format(number);
  }

  function cleanPrice(value) {
    const number = Number(String(value || "").replace(/[^0-9]/g, ""));
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function applyTheme(theme) {
    const safe = allowedThemes.includes(theme) ? theme : "red";
    document.body.dataset.theme = safe;
    localStorage.setItem(THEME_KEY, safe);
    $$('[data-theme-choice]').forEach((button) => button.classList.toggle("active", button.dataset.themeChoice === safe));
  }

  function showApp() {
    const loggedIn = localStorage.getItem(SELLER_KEY) === "true";
    $("#loginGate").hidden = loggedIn;
    $("#sellerApp").hidden = !loggedIn;
    if (loggedIn) renderAll();
  }

  function updateNavigationActive(page) {
    $$('.nav-item, .nav-children button').forEach((button) => {
      let isActive = false;

      if (button.classList.contains("nav-item")) {
        isActive = button.dataset.page === page;
      } else if (button.dataset.page === "orders") {
        isActive = page === "orders" && (button.dataset.orderFilter || "all") === state.orderFilter;
      } else if (button.dataset.page === "products") {
        const buttonFilter = button.dataset.productFilter || "all";
        const activeFilter = state.productFilter || "all";
        isActive = page === "products" && buttonFilter === activeFilter;
      } else if (button.dataset.page === "add-product") {
        isActive = page === "add-product";
      } else if (button.dataset.page === "promotions") {
        isActive = page === "promotions" && button === document.activeElement;
      }

      button.classList.toggle("active", isActive);
    });
  }

  function navigate(page, options = {}) {
    if (!$( `[data-page-panel="${page}"]` )) page = "dashboard";
    state.currentPage = page;
    state.orderFilter = options.orderFilter || "all";
    state.productFilter = options.productFilter || "all";

    $$('[data-page-panel]').forEach((panel) => panel.classList.toggle("active", panel.dataset.pagePanel === page));
    updateNavigationActive(page);
    document.body.classList.remove("sidebar-open");

    if (page === "orders") renderOrders();
    if (page === "products") renderProducts();
    if (page === "add-product" && !options.keepForm) resetProductForm();
    if (page === "reports") renderReports();
    if (page === "settings") renderStoreSettings();
    if (page === "shipping") renderShipping();
    if (page === "payments") renderPayments();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function metrics() {
    const pending = state.orders.filter((order) => orderStatus(order) === "pending").length;
    const processed = state.orders.filter((order) => orderStatus(order) === "processed").length;
    const cancelled = state.orders.filter((order) => orderStatus(order) === "cancelled").length;
    const inactive = state.products.filter((product) => product.active === false).length;
    const low = state.products.filter((product) => Number(product.stock || 0) <= 5).length;
    const sales = state.orders.reduce((sum, order) => sum + orderTotal(order), 0);
    const orderCount = state.orders.length;
    const visitors = Math.max(407, orderCount * 38 + 129);
    const clicks = Math.max(129, state.products.reduce((sum, product) => sum + Number(product.sold || 0), 0));
    return { pending, processed, cancelled, inactive, low, sales, orderCount, visitors, clicks };
  }

  function renderDashboard() {
    const m = metrics();
    $("#pendingCount").textContent = m.pending;
    $("#processedCount").textContent = m.processed;
    $("#cancelledCount").textContent = m.cancelled;
    $("#inactiveCount").textContent = m.inactive;
    $("#lowStockCount").textContent = m.low;
    $("#salesMetric").textContent = compactCurrency(m.sales);
    $("#visitorMetric").textContent = m.visitors.toLocaleString("id-ID");
    $("#clickMetric").textContent = m.clicks.toLocaleString("id-ID");
    $("#orderMetric").textContent = m.orderCount;
    $("#conversionMetric").textContent = `${m.visitors ? ((m.orderCount / m.visitors) * 100).toFixed(2) : "0.00"}%`;
    $("#fastSalesMetric").textContent = compactCurrency(m.sales * .71);
    $("#fastOrdersMetric").textContent = Math.round(m.orderCount * .75);
    $("#updatedLabel").textContent = `Diperbarui ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

    const best = [...state.products].sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0)).slice(0, 4);
    $("#bestProducts").innerHTML = best.length ? best.map((product) => `
      <div class="best-item">
        <img src="${safeText(imageSrc(product.image))}" alt="${safeText(product.title)}" />
        <span><b>${safeText(product.title)}</b><small>Stok ${Number(product.stock || 0)} · ${Number(product.sold || 0)} terjual</small></span>
        <strong>${compactCurrency(Number(product.price || 0))}</strong>
      </div>`).join("") : `<div class="empty-state">Belum ada produk.</div>`;

    const activities = [
      { icon: "!", title: `${m.pending} pesanan perlu diproses`, note: "Periksa dan atur pengiriman", page: "orders", filter: "pending" },
      { icon: "↓", title: `${m.low} produk stok menipis`, note: "Tambahkan stok agar tetap dapat dibeli", page: "products", filter: "low" },
      { icon: "%", title: "Optimalkan promo produk", note: "Gunakan diskon untuk meningkatkan konversi", page: "promotions" }
    ];
    $("#activityList").innerHTML = activities.map((item) => `
      <div class="activity-item"><span class="activity-icon">${item.icon}</span><div><b>${safeText(item.title)}</b><small>${safeText(item.note)}</small></div><button type="button" data-page="${item.page}" ${item.filter ? `data-${item.page === "orders" ? "order" : "product"}-filter="${item.filter}"` : ""}>Buka</button></div>
    `).join("");
  }

  function renderOrders() {
    $$('[data-order-tab]').forEach((button) => button.classList.toggle("active", button.dataset.orderTab === state.orderFilter));
    const orders = state.orders.filter((order) => state.orderFilter === "all" || orderStatus(order) === state.orderFilter);
    $("#orderEmpty").hidden = orders.length > 0;
    $("#orderTableBody").innerHTML = orders.map((order, visibleIndex) => {
      const realIndex = state.orders.indexOf(order);
      const status = orderStatus(order);
      const statusText = status === "processed" ? "Telah diproses" : status === "cancelled" ? "Dibatalkan" : "Perlu diproses";
      const customer = order.customer || order.name || order.buyerName || "Pembeli";
      const payment = order.payment || order.paymentMethod || "Belum ditentukan";
      return `
        <tr>
          <td><b>${safeText(order.id || `ORD-${visibleIndex + 1}`)}</b><br><small>${safeText(order.date || order.createdAt || "")}</small></td>
          <td>${safeText(customer)}</td>
          <td><b>${rupiah.format(orderTotal(order))}</b></td>
          <td>${safeText(payment)}</td>
          <td><span class="status-pill ${status}">${safeText(statusText)}</span></td>
          <td><div class="action-buttons"><button type="button" data-process-order="${realIndex}">Proses</button><button class="danger" type="button" data-cancel-order="${realIndex}">Batalkan</button></div></td>
        </tr>`;
    }).join("");
  }

  function filteredProducts() {
    return state.products.filter((product) => {
      const matchesQuery = !state.productQuery || `${product.title} ${product.category}`.toLowerCase().includes(state.productQuery.toLowerCase());
      const status = product.active === false ? "inactive" : Number(product.stock || 0) <= 5 ? "low" : "active";
      const matchesFilter = state.productFilter === "all" || state.productFilter === status;
      return matchesQuery && matchesFilter;
    });
  }

  function renderProducts() {
    $$('[data-product-filter]').forEach((button) => button.classList.toggle("active", button.dataset.productFilter === state.productFilter));
    $("#productSearch").value = state.productQuery;
    $("#productStatusFilter").value = state.productFilter;
    const products = filteredProducts();
    $("#productResultCount").textContent = `${products.length} produk`;
    $("#productEmpty").hidden = products.length > 0;
    $("#productTableBody").innerHTML = products.map((product) => {
      const variants = normalizeVariants(product);
      const variantText = variants.length ? `${variants.length} varian` : "Tanpa varian";
      return `
      <tr>
        <td><div class="product-cell"><img src="${safeText(imageSrc(product.image))}" alt="${safeText(product.title)}" /><span><b>${safeText(product.title)}</b><small>${safeText(product.category || "Tanpa kategori")} · ${variantText}</small></span></div></td>
        <td><b>${rupiah.format(Number(product.price || 0))}</b>${Number(product.discount || 0) ? `<br><small>Diskon ${Number(product.discount)}%</small>` : ""}</td>
        <td>${Number(product.stock || 0)} ${Number(product.stock || 0) <= 5 ? `<small class="down">Stok menipis</small>` : ""}</td>
        <td>${Number(product.sold || 0)}</td>
        <td><span class="status-pill ${product.active === false ? "inactive" : ""}">${product.active === false ? "Nonaktif" : "Aktif"}</span></td>
        <td><div class="action-buttons"><button type="button" data-edit-product="${safeText(product.id)}">Edit</button><button type="button" data-toggle-product="${safeText(product.id)}">${product.active === false ? "Aktifkan" : "Nonaktifkan"}</button><button class="danger" type="button" data-delete-product="${safeText(product.id)}">Hapus</button></div></td>
      </tr>`;
    }).join("");
  }

  function addVariantRow(name = "", price = "") {
    const row = document.createElement("div");
    row.className = "variant-row";
    row.innerHTML = `
      <label>Nama Varian<input name="variantName" placeholder="Contoh: Cream - Size M" value="${safeText(name)}" /></label>
      <label>Harga Varian (Rp)<input name="variantPrice" type="number" min="0" step="1000" placeholder="199000" value="${price !== "" ? safeText(price) : ""}" /></label>
      <button class="secondary-btn danger-light" type="button" data-remove-variant>Hapus</button>`;
    $("#variantRows").append(row);
  }

  function renderVariantRows(variants = []) {
    const box = $("#variantRows");
    box.innerHTML = "";
    if (!variants.length) {
      addVariantRow();
      return;
    }
    variants.forEach((variant) => addVariantRow(variant.name, Number(variant.price || 0)));
  }

  function getVariantRows() {
    const names = $$('input[name="variantName"]', $("#variantRows"));
    const prices = $$('input[name="variantPrice"]', $("#variantRows"));
    return names.map((input, index) => {
      const name = input.value.trim();
      const rawPrice = String(prices[index]?.value || "").trim();
      if (!name || rawPrice === "") return null;
      return { name, price: Math.max(0, Number(rawPrice)) };
    }).filter((variant) => variant && Number.isFinite(variant.price));
  }

  function resetProductForm() {
    const form = $("#productForm");
    form.reset();
    form.elements.id.value = "";
    form.elements.discount.value = 0;
    form.elements.stock.value = 1;
    $("#productFormTitle").textContent = "Tambah Produk Baru";
    renderImagePreview("");
    renderVariantRows([]);
  }

  function editProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    const form = $("#productForm");
    form.elements.id.value = product.id;
    form.elements.title.value = product.title || "";
    form.elements.category.value = product.category || "";
    form.elements.description.value = product.description || "";
    form.elements.price.value = Number(product.price || 0);
    form.elements.discount.value = Number(product.discount || 0);
    form.elements.stock.value = Number(product.stock || 0);
    form.elements.image.value = product.image || "";
    $("#productFormTitle").textContent = "Edit Produk";
    renderImagePreview(product.image || "");
    renderVariantRows(normalizeVariants(product));
    navigate("add-product", { keepForm: true });
  }

  function saveProduct(form) {
    const data = new FormData(form);
    const existingId = String(data.get("id") || "").trim();
    let id = existingId || slugify(data.get("title"));
    if (!existingId && state.products.some((product) => product.id === id)) id = `${id}-${Date.now()}`;
    const old = state.products.find((product) => product.id === existingId) || {};
    const product = {
      ...old,
      id,
      title: String(data.get("title") || "").trim(),
      category: String(data.get("category") || "").trim(),
      active: existingId ? old.active !== false : true,
      description: String(data.get("description") || "").trim(),
      price: Math.max(0, Number(data.get("price") || 0)),
      discount: Math.min(90, Math.max(0, Number(data.get("discount") || 0))),
      stock: Math.max(0, Number(data.get("stock") || 0)),
      sold: Number(old.sold || 0),
      rating: Number(old.rating || 4.8),
      variants: getVariantRows(),
      image: String(data.get("image") || "").trim() || old.image || defaultImage({ id, category: data.get("category"), title: data.get("title") })
    };
    const index = state.products.findIndex((item) => item.id === existingId);
    if (index >= 0) state.products[index] = product;
    else state.products.unshift(product);
    writeJson(PRODUCTS_KEY, state.products);
    notify(existingId ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
    navigate("products");
    renderAll();
  }

  function renderImagePreview(value) {
    const preview = $("#imagePreview");
    if (!value) { preview.innerHTML = "<span>Pratinjau gambar</span>"; return; }
    preview.innerHTML = `<img src="${safeText(imageSrc(value))}" alt="Pratinjau produk" />`;
  }

  function productOptionHtml(selectedId = "") {
    return `<option value="">Pilih produk</option>` + state.products.map((product) => `
      <option value="${safeText(product.id)}" ${String(product.id) === String(selectedId || "") ? "selected" : ""}>${safeText(product.title)}</option>
    `).join("");
  }

  function renderSellerProductSelects() {
    const form = $("#settingsForm");
    if (!form) return;
    const settings = { ...DEFAULT_HOME_SETTINGS, ...readJson(HOME_SETTINGS_KEY, state.homeSettings) };
    const flashIds = Array.isArray(settings.flashProductIds) ? settings.flashProductIds : [];
    const selectMap = {
      promoProductLink: settings.promoProductId || "",
      flashProduct1: flashIds[0] || "",
      flashProduct2: flashIds[1] || "",
      flashProduct3: flashIds[2] || ""
    };
    Object.entries(selectMap).forEach(([name, selected]) => {
      if (form.elements[name]) form.elements[name].innerHTML = productOptionHtml(selected);
    });
  }

  function renderBannerPromoPreview() {
    const box = $("#bannerPromoPreview");
    if (!box) return;
    const image = state.promo.mainImage || DEFAULT_PROMO.mainImage;
    const linked = state.products.find((product) => product.id === state.homeSettings.promoProductId);
    box.innerHTML = image ? `
      <img src="${safeText(imageSrc(image))}" alt="Banner promo" />
      <span>${linked ? `Link produk: ${safeText(linked.title)}` : "Belum ada link produk"}</span>
    ` : "Banner promo belum diupload.";
  }

  function renderReports() {
    const m = metrics();
    $("#reportRevenue").textContent = rupiah.format(m.sales);
    $("#reportOrders").textContent = m.orderCount;
    $("#reportProducts").textContent = state.products.filter((product) => product.active !== false).length;
    const base = Math.max(15, Math.round(m.sales / 100000));
    const values = [42, 58, 47, 72, 64, 83, 91].map((value, index) => Math.max(8, Math.min(100, value + Math.round(base / (index + 3)))));
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    $("#barChart").innerHTML = values.map((value, index) => `<div class="bar-column"><i style="height:${value}%" title="${value}%"></i><span>${days[index]}</span></div>`).join("");
  }

  function storeAddressText(profile = state.storeProfile) {
    const parts = [profile.street, profile.district, profile.city, profile.province, profile.postal].filter(Boolean);
    return parts.join(", ");
  }

  function storeAddressFullText(profile = state.storeAddressDraft) {
    return [
      profile.name || state.storeProfile.name || "Online Shop",
      profile.phone || state.storeProfile.phone || "",
      storeAddressText(profile)
    ].filter(Boolean).join("\n");
  }

  function clearStoreAddressDraft() {
    Object.assign(state.storeAddressDraft, {
      street: "", province: "", provinceCode: "", city: "", cityCode: "", district: "", districtCode: "", postal: "", step: "province"
    });
    const form = $("#settingsForm");
    if (form) form.elements.storeStreet.value = "";
    const textarea = $("#storeModalStreet");
    if (textarea) textarea.value = "";
    updateStoreAddressSearch();
  }

  function renderStorePreview() {
    const preview = $("#storeAddressPreview");
    if (!preview) return;
    const text = storeAddressText(state.storeAddressDraft);
    if (!text) {
      preview.classList.add("empty");
      preview.innerHTML = "Alamat toko belum diisi.";
      return;
    }
    preview.classList.remove("empty");
    preview.innerHTML = `
      <strong>${safeText(state.storeAddressDraft.city || state.storeAddressDraft.province || "Alamat Toko")}</strong>
      <span>${safeText(text)}</span>
      ${state.storeAddressDraft.phone ? `<small>${safeText(state.storeAddressDraft.phone)}</small>` : ""}
      <div class="address-card-actions">
        <button type="button" data-view-store-address>Lihat</button>
        <button type="button" data-edit-store-address>Edit</button>
        <button class="danger" type="button" data-delete-store-address>Hapus</button>
      </div>`;
  }

  function closeAddressDetailPopup() {
    const modal = $("#addressDetailPopup");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function viewStoreAddress() {
    if (!storeAddressText(state.storeAddressDraft)) return;
    const modal = $("#addressDetailPopup");
    const content = $("#addressDetailContent");
    if (!modal || !content) return;
    const parts = storeAddressFullText(state.storeAddressDraft).split("\n").filter(Boolean);
    content.innerHTML = parts.map((line) => `<p>${safeText(line)}</p>`).join("");
    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function deleteStoreAddress() {
    if (!storeAddressText(state.storeAddressDraft)) return;
    if (!window.confirm("Hapus alamat toko ini?")) return;
    clearStoreAddressDraft();
    const updated = {
      ...state.storeProfile,
      street: "", province: "", provinceCode: "", city: "", cityCode: "", district: "", districtCode: "", postal: ""
    };
    state.storeProfile = updated;
    writeJson(STORE_KEY, updated);
    writeJson(SETTINGS_KEY, { storeName: updated.name, storeEmail: updated.email, storeAddress: "" });
    renderStoreSettings();
    notify("Alamat toko dihapus.");
  }

  function renderStoreSettings() {
    const form = $("#settingsForm");
    if (!form) return;
    state.storeProfile = { ...DEFAULT_STORE_PROFILE, ...readJson(STORE_KEY, state.storeProfile) };
    state.storeAddressDraft = { ...state.storeAddressDraft, ...state.storeProfile };
    form.elements.storeName.value = state.storeProfile.name || "Online Shop";
    form.elements.storePhone.value = state.storeProfile.phone || "";
    form.elements.storeEmail.value = state.storeProfile.email || "seller@namadomain.com";
    form.elements.storeStreet.value = state.storeProfile.street || "";
    if (form.elements.promoEyebrow) {
      const promo = { ...DEFAULT_PROMO, ...readJson(PROMO_KEY, state.promo) };
      const home = { ...DEFAULT_HOME_SETTINGS, ...readJson(HOME_SETTINGS_KEY, state.homeSettings) };
      const shortcuts = Array.isArray(home.shortcuts) ? home.shortcuts : DEFAULT_HOME_SETTINGS.shortcuts;
      state.promo = promo;
      state.homeSettings = { ...home, shortcuts: shortcuts.slice(0, 4) };
      while (state.homeSettings.shortcuts.length < 4) state.homeSettings.shortcuts.push(DEFAULT_HOME_SETTINGS.shortcuts[state.homeSettings.shortcuts.length]);
      form.elements.promoEyebrow.value = promo.eyebrow || DEFAULT_PROMO.eyebrow;
      form.elements.promoTitle.value = promo.title || DEFAULT_PROMO.title;
      form.elements.promoDescription.value = promo.description || DEFAULT_PROMO.description;
      form.elements.promoBadge.value = promo.badge || DEFAULT_PROMO.badge;
      if (form.elements.promoMainImage) form.elements.promoMainImage.value = promo.mainImage || DEFAULT_PROMO.mainImage;
      form.elements.shortcut1.value = state.homeSettings.shortcuts[0] || DEFAULT_HOME_SETTINGS.shortcuts[0];
      form.elements.shortcut2.value = state.homeSettings.shortcuts[1] || DEFAULT_HOME_SETTINGS.shortcuts[1];
      form.elements.shortcut3.value = state.homeSettings.shortcuts[2] || DEFAULT_HOME_SETTINGS.shortcuts[2];
      form.elements.shortcut4.value = state.homeSettings.shortcuts[3] || DEFAULT_HOME_SETTINGS.shortcuts[3];
      if (form.elements.categoryTitle) form.elements.categoryTitle.value = state.homeSettings.categoryTitle || DEFAULT_HOME_SETTINGS.categoryTitle;
      if (form.elements.flashTitle) form.elements.flashTitle.value = state.homeSettings.flashTitle || DEFAULT_HOME_SETTINGS.flashTitle;
      if (form.elements.flashStartDate) form.elements.flashStartDate.value = state.homeSettings.flashStartDate || "";
      if (form.elements.flashEndDate) form.elements.flashEndDate.value = state.homeSettings.flashEndDate || "";
      const flashPrices = Array.isArray(state.homeSettings.flashSalePrices) ? state.homeSettings.flashSalePrices : [];
      if (form.elements.flashPrice1) form.elements.flashPrice1.value = flashPrices[0] || "";
      if (form.elements.flashPrice2) form.elements.flashPrice2.value = flashPrices[1] || "";
      if (form.elements.flashPrice3) form.elements.flashPrice3.value = flashPrices[2] || "";
      renderSellerProductSelects();
      renderBannerPromoPreview();
    }
    renderStorePreview();
    updateStoreAddressSearch();
  }

  function selectedRegionList() {
    const data = window.REGION_DATA || {};
    const step = state.storeAddressDraft.step || "province";
    if (step === "province") return data.provinces || [];
    if (step === "city") return data.cities?.[state.storeAddressDraft.provinceCode] || [];
    if (step === "district") return data.districts?.[state.storeAddressDraft.cityCode] || [];
    if (step === "postal") return data.postals?.[state.storeAddressDraft.districtCode] || [];
    return [];
  }

  function updateStoreAddressSearch() {
    const input = $("#storeAddressSearch");
    if (!input) return;
    const parts = [state.storeAddressDraft.province, state.storeAddressDraft.city, state.storeAddressDraft.district, state.storeAddressDraft.postal].filter(Boolean);
    input.value = parts.join(", ");
  }

  function setStoreAddressStep(step) {
    const order = ["province", "city", "district", "postal"];
    const nextStep = order.includes(step) ? step : "province";
    state.storeAddressDraft.step = nextStep;
    $$('[data-store-address-tab]').forEach((tab) => tab.classList.toggle("active", tab.dataset.storeAddressTab === nextStep));
    renderStoreAddressOptions();
  }

  function renderStoreAddressOptions() {
    const box = $("#storeAddressOptions");
    if (!box) return;
    const list = selectedRegionList();
    const selectedByStep = {
      province: state.storeAddressDraft.provinceCode,
      city: state.storeAddressDraft.cityCode,
      district: state.storeAddressDraft.districtCode,
      postal: state.storeAddressDraft.postal
    };
    const selectedCode = selectedByStep[state.storeAddressDraft.step || "province"];
    if (!list.length) {
      box.innerHTML = `<div class="address-empty">Pilih data sebelumnya terlebih dahulu.</div>`;
      return;
    }
    box.innerHTML = list.map((item) => {
      const code = item.code || item.name;
      const selected = String(selectedCode || "") === String(code || item.name);
      return `<button class="address-option ${selected ? "selected" : ""}" type="button" data-store-address-value="${safeText(item.name)}" data-store-address-code="${safeText(code)}">${safeText(item.name)}</button>`;
    }).join("");
  }

  function selectStoreAddressValue(value, code) {
    const step = state.storeAddressDraft.step || "province";
    if (step === "province") {
      Object.assign(state.storeAddressDraft, { province: value, provinceCode: code, city: "", cityCode: "", district: "", districtCode: "", postal: "", step: "city" });
    } else if (step === "city") {
      Object.assign(state.storeAddressDraft, { city: value, cityCode: code, district: "", districtCode: "", postal: "", step: "district" });
    } else if (step === "district") {
      Object.assign(state.storeAddressDraft, { district: value, districtCode: code, postal: "", step: "postal" });
    } else if (step === "postal") {
      Object.assign(state.storeAddressDraft, { postal: value, step: "postal" });
    }
    updateStoreAddressSearch();
    setStoreAddressStep(state.storeAddressDraft.step);
  }

  function openStoreAddressModal() {
    state.storeAddressDraft.street = $("#settingsForm")?.elements.storeStreet.value || state.storeAddressDraft.street || "";
    const textarea = $("#storeModalStreet");
    if (textarea) textarea.value = state.storeAddressDraft.street || "";
    setStoreAddressStep(state.storeAddressDraft.province ? "city" : "province");
    updateStoreAddressSearch();
    $("#storeAddressModal").hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeStoreAddressModal() {
    $("#storeAddressModal").hidden = true;
    document.body.classList.remove("modal-open");
  }

  function confirmStoreAddressModal() {
    state.storeAddressDraft.street = $("#storeModalStreet").value.trim();
    const form = $("#settingsForm");
    if (form) form.elements.storeStreet.value = state.storeAddressDraft.street;
    renderStorePreview();
    closeStoreAddressModal();
  }

  function renderShipping() {
    const list = $("#shippingList");
    if (!list) return;
    list.innerHTML = state.shippingOptions.length ? state.shippingOptions.map((item, index) => `
      <article class="module-item">
        <div><strong>${safeText(item.name)}</strong><span>${rupiah.format(Number(item.price || 0))}${item.estimate ? ` · ${safeText(item.estimate)}` : ""}</span></div>
        <div class="action-buttons"><button type="button" data-shipping-edit="${index}">Edit</button><button class="danger" type="button" data-shipping-delete="${index}">Hapus</button></div>
      </article>`).join("") : `<div class="empty-state">Belum ada harga ongkir.</div>`;
  }

  function renderPayments() {
    const list = $("#paymentMethodList");
    if (!list) return;
    list.innerHTML = state.paymentMethods.length ? state.paymentMethods.map((item, index) => `
      <article class="module-item">
        <div><strong>${safeText(item.name)}</strong><span>${safeText(item.type || "Metode")} · ${safeText(item.account || "-")} · ${safeText(item.holder || "-")}</span>${item.note ? `<small>${safeText(item.note)}</small>` : ""}</div>
        <div class="action-buttons"><button type="button" data-payment-edit="${index}">Edit</button><button class="danger" type="button" data-payment-delete="${index}">Hapus</button></div>
      </article>`).join("") : `<div class="empty-state">Belum ada metode pembayaran.</div>`;
  }

  function renderAll() {
    state.products = loadProducts();
    state.orders = readJson(ORDERS_KEY, []);
    state.shippingOptions = readJson(SHIPPING_KEY, state.shippingOptions);
    state.paymentMethods = readJson(PAYMENT_KEY, state.paymentMethods);
    renderDashboard();
    renderOrders();
    renderProducts();
    renderReports();
    renderShipping();
    renderPayments();
    renderStoreSettings();
  }

  document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");
    const groupTitle = event.target.closest(".nav-group-title");
    const orderTab = event.target.closest("[data-order-tab]");
    const editButton = event.target.closest("[data-edit-product]");
    const toggleButton = event.target.closest("[data-toggle-product]");
    const deleteButton = event.target.closest("[data-delete-product]");
    const processButton = event.target.closest("[data-process-order]");
    const cancelButton = event.target.closest("[data-cancel-order]");
    const themeButton = event.target.closest("[data-theme-choice]");
    const removeVariant = event.target.closest("[data-remove-variant]");
    const storeAddressOpen = event.target.closest("#storeAddressOpen");
    const storeAddressClose = event.target.closest("#storeAddressClose");
    const storeAddressOk = event.target.closest("#storeAddressOk");
    const storeAddressTab = event.target.closest("[data-store-address-tab]");
    const storeAddressOption = event.target.closest("[data-store-address-value]");
    const shippingEdit = event.target.closest("[data-shipping-edit]");
    const shippingDelete = event.target.closest("[data-shipping-delete]");
    const paymentEdit = event.target.closest("[data-payment-edit]");
    const paymentDelete = event.target.closest("[data-payment-delete]");
    const viewStoreAddressButton = event.target.closest("[data-view-store-address]");
    const editStoreAddressButton = event.target.closest("[data-edit-store-address]");
    const deleteStoreAddressButton = event.target.closest("[data-delete-store-address]");
    const addressDetailClose = event.target.closest("#addressDetailClose");
    const addressDetailEdit = event.target.closest("#addressDetailEdit");
    const addressDetailDelete = event.target.closest("#addressDetailDelete");

    if (groupTitle) groupTitle.closest(".nav-group").classList.toggle("open");
    if (pageButton) navigate(pageButton.dataset.page, { orderFilter: pageButton.dataset.orderFilter, productFilter: pageButton.dataset.productFilter });
    if (orderTab) { state.orderFilter = orderTab.dataset.orderTab; updateNavigationActive("orders"); renderOrders(); }
    if (editButton) editProduct(editButton.dataset.editProduct);
    if (toggleButton) {
      const product = state.products.find((item) => item.id === toggleButton.dataset.toggleProduct);
      if (product) { product.active = product.active === false; writeJson(PRODUCTS_KEY, state.products); renderAll(); notify("Status produk diperbarui."); }
    }
    if (deleteButton) {
      const product = state.products.find((item) => item.id === deleteButton.dataset.deleteProduct);
      if (product && window.confirm(`Hapus produk “${product.title}”?`)) {
        state.products = state.products.filter((item) => item.id !== product.id);
        writeJson(PRODUCTS_KEY, state.products);
        renderAll(); notify("Produk dihapus.");
      }
    }
    if (processButton) {
      const order = state.orders[Number(processButton.dataset.processOrder)];
      if (order) { order.status = "Telah diproses"; writeJson(ORDERS_KEY, state.orders); renderAll(); notify("Pesanan diproses."); }
    }
    if (cancelButton) {
      const order = state.orders[Number(cancelButton.dataset.cancelOrder)];
      if (order) { order.status = "Dibatalkan"; writeJson(ORDERS_KEY, state.orders); renderAll(); notify("Pesanan dibatalkan."); }
    }
    if (themeButton) { applyTheme(themeButton.dataset.themeChoice); notify("Thema diperbarui."); }
    if (event.target.id === "addVariantRow") addVariantRow();
    if (removeVariant) {
      const row = removeVariant.closest(".variant-row");
      row?.remove();
      if (!$("#variantRows")?.children.length) addVariantRow();
    }
    if (storeAddressOpen) openStoreAddressModal();
    if (storeAddressClose) closeStoreAddressModal();
    if (storeAddressOk) confirmStoreAddressModal();
    if (event.target === $("#storeAddressModal")) closeStoreAddressModal();
    if (storeAddressTab) setStoreAddressStep(storeAddressTab.dataset.storeAddressTab);
    if (storeAddressOption) selectStoreAddressValue(storeAddressOption.dataset.storeAddressValue, storeAddressOption.dataset.storeAddressCode || "");
    if (viewStoreAddressButton) viewStoreAddress();
    if (editStoreAddressButton) openStoreAddressModal();
    if (deleteStoreAddressButton) deleteStoreAddress();
    if (addressDetailClose || event.target === $("#addressDetailPopup")) closeAddressDetailPopup();
    if (addressDetailEdit) { closeAddressDetailPopup(); openStoreAddressModal(); }
    if (addressDetailDelete) { closeAddressDetailPopup(); deleteStoreAddress(); }
    if (shippingEdit) {
      const item = state.shippingOptions[Number(shippingEdit.dataset.shippingEdit)];
      const form = $("#shippingForm");
      if (item && form) {
        form.elements.index.value = shippingEdit.dataset.shippingEdit;
        form.elements.name.value = item.name || "";
        form.elements.price.value = Number(item.price || 0);
        form.elements.estimate.value = item.estimate || "";
      }
    }
    if (shippingDelete) {
      state.shippingOptions.splice(Number(shippingDelete.dataset.shippingDelete), 1);
      writeJson(SHIPPING_KEY, state.shippingOptions);
      renderShipping();
      notify("Harga ongkir dihapus.");
    }
    if (paymentEdit) {
      const item = state.paymentMethods[Number(paymentEdit.dataset.paymentEdit)];
      const form = $("#paymentMethodForm");
      if (item && form) {
        form.elements.index.value = paymentEdit.dataset.paymentEdit;
        form.elements.name.value = item.name || "";
        form.elements.type.value = item.type || "Transfer Bank";
        form.elements.account.value = item.account || "";
        form.elements.holder.value = item.holder || "";
        form.elements.note.value = item.note || "";
      }
    }
    if (paymentDelete) {
      state.paymentMethods.splice(Number(paymentDelete.dataset.paymentDelete), 1);
      writeJson(PAYMENT_KEY, state.paymentMethods);
      renderPayments();
      notify("Metode pembayaran dihapus.");
    }
  });

  $("#sellerLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const valid = data.get("username") === "seller" && data.get("password") === "seller123";
    $("#loginError").hidden = valid;
    if (valid) { localStorage.setItem(SELLER_KEY, "true"); showApp(); notify("Berhasil masuk ke Seller Center."); }
  });

  $("#logoutButton").addEventListener("click", () => {
    localStorage.removeItem(SELLER_KEY);
    $("#profileDropdown").hidden = true;
    showApp();
  });

  $("#profileButton").addEventListener("click", () => { $("#profileDropdown").hidden = !$("#profileDropdown").hidden; });
  $("#menuButton").addEventListener("click", () => document.body.classList.toggle("sidebar-open"));

  $("#productSearch").addEventListener("input", (event) => { state.productQuery = event.target.value; renderProducts(); });
  $("#productStatusFilter").addEventListener("change", (event) => { state.productFilter = event.target.value; updateNavigationActive("products"); renderProducts(); });
  $("#globalSearch").addEventListener("input", (event) => {
    state.productQuery = event.target.value;
    if (event.target.value.trim()) navigate("products");
    else if (state.currentPage === "products") renderProducts();
  });

  $("#productForm").addEventListener("submit", (event) => { event.preventDefault(); saveProduct(event.currentTarget); });
  $("#productForm").elements.image.addEventListener("input", (event) => renderImagePreview(event.target.value));
  $("#settingsForm")?.elements.promoUploadImage?.addEventListener("change", async (event) => {
    try {
      const dataUrl = await fileToDataUrl(event.target.files?.[0]);
      if (dataUrl) {
        state.promo.mainImage = dataUrl;
        $("#settingsForm").elements.promoMainImage.value = dataUrl;
        renderBannerPromoPreview();
      }
    } catch (error) {
      notify("Gambar banner gagal dibaca.");
    }
  });
  $("#settingsForm")?.addEventListener("change", (event) => {
    if (event.target.matches("[name='promoProductLink']")) {
      state.homeSettings = { ...state.homeSettings, promoProductId: event.target.value };
      renderBannerPromoPreview();
    }
  });

  $("#settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    state.storeAddressDraft.street = form.elements.storeStreet.value || state.storeAddressDraft.street || "";
    const profile = {
      ...DEFAULT_STORE_PROFILE,
      name: form.elements.storeName.value.trim() || "Online Shop",
      phone: form.elements.storePhone.value.trim(),
      email: form.elements.storeEmail.value.trim(),
      street: state.storeAddressDraft.street || "",
      province: state.storeAddressDraft.province || "",
      provinceCode: state.storeAddressDraft.provinceCode || "",
      city: state.storeAddressDraft.city || "",
      cityCode: state.storeAddressDraft.cityCode || "",
      district: state.storeAddressDraft.district || "",
      districtCode: state.storeAddressDraft.districtCode || "",
      postal: state.storeAddressDraft.postal || ""
    };
    state.storeProfile = profile;
    state.storeAddressDraft = { ...state.storeAddressDraft, ...profile };
    let uploadedPromoImage = "";
    try {
      uploadedPromoImage = await fileToDataUrl(form.elements.promoUploadImage?.files?.[0]);
    } catch (error) {
      notify("Gambar banner gagal dibaca.");
      return;
    }
    const promo = {
      eyebrow: form.elements.promoEyebrow?.value.trim() || DEFAULT_PROMO.eyebrow,
      title: form.elements.promoTitle?.value.trim() || DEFAULT_PROMO.title,
      description: form.elements.promoDescription?.value.trim() || DEFAULT_PROMO.description,
      badge: form.elements.promoBadge?.value.trim() || DEFAULT_PROMO.badge,
      mainImage: uploadedPromoImage || form.elements.promoMainImage?.value.trim() || state.promo.mainImage || DEFAULT_PROMO.mainImage
    };
    const flashSlots = [1, 2, 3].map((number) => ({
      productId: form.elements[`flashProduct${number}`]?.value || "",
      salePrice: cleanPrice(form.elements[`flashPrice${number}`]?.value)
    })).filter((slot) => slot.productId);
    const homeSettings = {
      shortcuts: [
        form.elements.shortcut1?.value.trim() || DEFAULT_HOME_SETTINGS.shortcuts[0],
        form.elements.shortcut2?.value.trim() || DEFAULT_HOME_SETTINGS.shortcuts[1],
        form.elements.shortcut3?.value.trim() || DEFAULT_HOME_SETTINGS.shortcuts[2],
        form.elements.shortcut4?.value.trim() || DEFAULT_HOME_SETTINGS.shortcuts[3]
      ],
      categoryTitle: form.elements.categoryTitle?.value.trim() || DEFAULT_HOME_SETTINGS.categoryTitle,
      flashTitle: form.elements.flashTitle?.value.trim() || DEFAULT_HOME_SETTINGS.flashTitle,
      flashStartDate: form.elements.flashStartDate?.value || "",
      flashEndDate: form.elements.flashEndDate?.value || "",
      promoProductId: form.elements.promoProductLink?.value || "",
      categoryProductIds: [],
      flashProductIds: flashSlots.map((slot) => slot.productId),
      flashSalePrices: flashSlots.map((slot) => slot.salePrice)
    };
    state.promo = promo;
    state.homeSettings = homeSettings;
    writeJson(STORE_KEY, profile);
    writeJson(PROMO_KEY, promo);
    writeJson(HOME_SETTINGS_KEY, homeSettings);
    writeJson(SETTINGS_KEY, { storeName: profile.name, storeEmail: profile.email, storeAddress: storeAddressText(profile) });
    renderStoreSettings();
    notify("Pengaturan toko disimpan.");
  });

  $("#shippingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const item = { name: String(data.get("name") || "").trim(), price: Math.max(0, Number(data.get("price") || 0)), estimate: String(data.get("estimate") || "").trim() };
    if (!item.name) return;
    const index = String(data.get("index") || "");
    if (index === "") state.shippingOptions.push(item);
    else state.shippingOptions[Number(index)] = item;
    writeJson(SHIPPING_KEY, state.shippingOptions);
    form.reset();
    form.elements.index.value = "";
    renderShipping();
    notify("Harga ongkir disimpan.");
  });

  $("#shippingForm").addEventListener("reset", () => setTimeout(() => { $("#shippingForm").elements.index.value = ""; }, 0));

  $("#paymentMethodForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const item = {
      name: String(data.get("name") || "").trim(),
      type: String(data.get("type") || "Transfer Bank").trim(),
      account: String(data.get("account") || "").trim(),
      holder: String(data.get("holder") || "").trim(),
      note: String(data.get("note") || "").trim()
    };
    if (!item.name) return;
    const index = String(data.get("index") || "");
    if (index === "") state.paymentMethods.push(item);
    else state.paymentMethods[Number(index)] = item;
    writeJson(PAYMENT_KEY, state.paymentMethods);
    form.reset();
    form.elements.index.value = "";
    renderPayments();
    notify("Metode pembayaran disimpan.");
  });

  $("#paymentMethodForm").addEventListener("reset", () => setTimeout(() => { $("#paymentMethodForm").elements.index.value = ""; }, 0));

  $("#storeModalStreet")?.addEventListener("input", (event) => { state.storeAddressDraft.street = event.target.value; });

  function notify(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  applyTheme(localStorage.getItem(THEME_KEY) || "red");
  renderVariantRows([]);
  renderStoreSettings();
  showApp();
})();
