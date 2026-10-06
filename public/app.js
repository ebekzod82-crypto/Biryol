const $ = (id) => document.getElementById(id);
let cart = JSON.parse(localStorage.getItem("biryol_cart") || "[]");

const api = async (url, options = {}) => {
  const r = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Xatolik");
  return data;
};

const money = n => Number(n).toLocaleString("uz-UZ") + " so'm";

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

async function loadData(q = "") {
  try {
    const [businesses, items] = await Promise.all([
      api("/api/businesses" + (q ? "?q=" + encodeURIComponent(q) : "")),
      api("/api/items" + (q ? "?q=" + encodeURIComponent(q) : ""))
    ]);

    $("bizGrid").innerHTML = businesses.map(b => `
      <article class="card">
        <div class="photo">🏪</div>
        <div class="body">
          <div class="rating">⭐ ${b.rating || "Yangi"}</div>
          <h3>${b.name}</h3>
          <div class="meta">${b.category} · ${b.city}</div>
          <p class="meta">${b.description || ""}</p>
          <div class="actions">
            <button onclick="showBusiness('${b.id}')">Ko‘rish</button>
            <button class="light" onclick="callBusiness('${b.phone || ""}')">☎️</button>
          </div>
        </div>
      </article>
    `).join("") || "<p>Bizneslar topilmadi.</p>";

    $("itemGrid").innerHTML = items.map(x => `
      <article class="item">
        <div class="pic">${x.type === "service" ? "🛠️" : "🍯"}</div>
        <h3>${x.name}</h3>
        <div class="price">${money(x.price)}</div>
        <div class="meta">${x.unit}</div>
        <button onclick="addCart('${x.id}','${x.name}',${x.price})">Savatga</button>
      </article>
    `).join("") || "<p>Mahsulotlar topilmadi.</p>";
  } catch (e) {
    toast(e.message);
  }
}

function search() {
  const q = $("q").value.trim();
  loadData(q);
  $("businesses").scrollIntoView({ behavior: "smooth" });
}

$("q")?.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

function showBusiness(id) {
  location.hash = "business-" + id;
  toast("Biznes tanlandi");
}

function callBusiness(phone) {
  if (phone) location.href = "tel:" + phone.replace(/\s/g, "");
}

function renderProfile() {
  $("modal").style.display = "flex";
}

function closeAuth() {
  $("modal").style.display = "none";
}

async function register() {
  try {
    const data = await api("/api/register", {
      method: "POST",
      body: JSON.stringify({
        phone: $("phone").value.trim(),
        password: $("password").value
      })
    });
    $("authMsg").textContent = "Ro‘yxatdan o‘tildi.";
    localStorage.setItem("biryol_user", JSON.stringify(data));
  } catch (e) {
    $("authMsg").textContent = e.message;
  }
}

async function login() {
  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        phone: $("phone").value.trim(),
        password: $("password").value
      })
    });
    localStorage.setItem("biryol_user", JSON.stringify(data));
    $("authMsg").textContent = "Muvaffaqiyatli kirdingiz.";
  } catch (e) {
    $("authMsg").textContent = e.message;
  }
}

function addCart(id, name, price) {
  cart.push({ id, name, price });
  localStorage.setItem("biryol_cart", JSON.stringify(cart));
  updateCart();
  toast("Savatga qo‘shildi");
}

function updateCart() {
  const el = $("cartCount");
  if (el) el.textContent = cart.length;
}

function showCart() {
  if (!cart.length) {
    toast("Savat bo‘sh");
    return;
  }

  const total = cart.reduce((s, x) => s + x.price, 0);
  const names = cart.map(x => x.name).join(", ");

  alert(
    "Savat:\n\n" +
    names +
    "\n\nJami: " +
    money(total)
  );
}

function showMap() {
  document.querySelector(".map")?.scrollIntoView({ behavior: "smooth" });
}

window.search = search;
window.renderProfile = renderProfile;
window.closeAuth = closeAuth;
window.register = register;
window.login = login;
window.showCart = showCart;
window.showMap = showMap;
window.showBusiness = showBusiness;
window.callBusiness = callBusiness;
window.addCart = addCart;

loadData();
updateCart();
