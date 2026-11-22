/* =========================================================
   ANZEN 安全 — store.js
   JavaScript by: Jyotsnarini
   ---------------------------------------------------------
   Shared data layer used by EVERY page.
   - Saves property listings & site-visit bookings in
     localStorage (data stays even after refresh, no backend)
   - Common helpers: price format, toast messages,
     mobile menu, image fallback
   ========================================================= */

const KEYS = { props: "anzen_properties", bookings: "anzen_bookings" };

// Builds an online photo URL (Unsplash). If a photo fails, a fallback is shown.
const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

/* ---------- Default listings (loaded the first time) ---------- */
const SEED_PROPERTIES = [
  { id: "AZ-101", title: "Sakura Freehold Plot", block: "A", type: "Plot", size: 180, bhk: 0, price: 2.25, facing: "East", status: "Available", img: IMG("1500382017468-9049fed747ef"), desc: "Corner plot on the 24m Sakura Boulevard with morning sun and a guarded entry 60m away." },
  { id: "AZ-102", title: "Sakura Garden Plot", block: "A", type: "Plot", size: 200, bhk: 0, price: 2.48, facing: "North", status: "Booked", img: IMG("1441974231531-c6227db76b6e"), desc: "Faces the lit bamboo walkway, 2 minutes from the clubhouse." },
  { id: "AZ-103", title: "Nara Park Facing Plot", block: "A", type: "Plot", size: 250, bhk: 0, price: 3.12, facing: "East", status: "Available", img: IMG("1470770841072-f978cf4d019e"), desc: "Direct view of the central Miyawaki forest park with CCTV-covered jogging track." },
  { id: "AZ-201", title: "Ginza Boulevard Plot", block: "B", type: "Plot", size: 350, bhk: 0, price: 4.38, facing: "West", status: "Available", img: IMG("1540959733332-eab4deabeeaf"), desc: "Wide frontage on the main boulevard, ideal for a large family home." },
  { id: "AZ-202", title: "Osaka Imperial Crown Plot", block: "B", type: "Plot", size: 500, bhk: 0, price: 6.15, facing: "North-East", status: "Sold", img: IMG("1503899036084-c55cdd92da26"), desc: "The largest plot in the township — 50ft x 90ft, 100% freehold." },
  { id: "AZ-301", title: "Hakone Forest Villa", block: "C", type: "Villa", size: 450, bhk: 5, price: 6.80, facing: "North", status: "Available", img: IMG("1613490493576-7fde63acd811"), desc: "Flagship 5 BHK with a private rooftop onsen pool and panic-alarm smart home." },
  { id: "AZ-302", title: "Miyawaki Forest Estate", block: "C", type: "Estate", size: 420, bhk: 0, price: 5.25, facing: "East", status: "Available", img: IMG("1564013799919-ab600027ffc6"), desc: "Estate plot wrapped by 30,000+ native trees and the koi water trail." },
  { id: "AZ-303", title: "Hakone Lake Villa", block: "C", type: "Villa", size: 400, bhk: 5, price: 6.25, facing: "East", status: "Sold", img: IMG("1512917774080-9991f1c4c750"), desc: "Opens onto the koi water body and reflexology trail." },
  { id: "AZ-401", title: "Kyoto Courtyard Villa", block: "D", type: "Villa", size: 250, bhk: 4, price: 4.95, facing: "East", status: "Available", img: IMG("1600596542815-ffad4c1539a9"), desc: "Turnkey 4 BHK with private lift, double-height shoji lounge and 3 covered EV bays." },
  { id: "AZ-402", title: "Kyoto Zen Villa", block: "D", type: "Villa", size: 280, bhk: 4, price: 5.40, facing: "South", status: "Booked", img: IMG("1600585154340-be6161a56a0c"), desc: "Zen dry-rock garden, video door phone and smart locks on every entry." }
];

const SEED_BOOKINGS = [
  { id: "BK-1001", name: "Aarav Singhania", phone: "9876543210", email: "aarav@example.com", propertyId: "AZ-401", date: "2026-11-22", slot: "11:00 AM", budget: 5, purpose: "Self-use", chauffeur: true, status: "Contacted", created: "2026-11-12" },
  { id: "BK-1002", name: "Meera Kapoor", phone: "9811122233", email: "meera@example.com", propertyId: "AZ-103", date: "2026-11-20", slot: "04:00 PM", budget: 3.5, purpose: "Investment", chauffeur: false, status: "New", created: "2026-11-14" }
];

const PROPERTY_STATUSES = ["Available", "Booked", "Sold"];
const BOOKING_STATUSES = ["New", "Contacted", "Visit Done", "Closed"];

/* ---------- localStorage helpers ---------- */
function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage blocked → use seed */ }
  save(key, seed);
  return JSON.parse(JSON.stringify(seed));
}
function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

/* ---------- Store: the one object every page uses ---------- */
const Store = {
  getProperties: () => load(KEYS.props, SEED_PROPERTIES),
  saveProperties: (list) => save(KEYS.props, list),
  getProperty: (id) => Store.getProperties().find((p) => p.id === id),

  getBookings: () => load(KEYS.bookings, SEED_BOOKINGS),
  saveBookings: (list) => save(KEYS.bookings, list),

  // Creates the next ID, e.g. AZ-403 or BK-1003
  nextId(prefix, list, start) {
    const nums = list.map((x) => parseInt(x.id.split("-")[1], 10)).filter((n) => !isNaN(n));
    return `${prefix}-${(nums.length ? Math.max(...nums) : start) + 1}`;
  },
  reset() {
    save(KEYS.props, SEED_PROPERTIES);
    save(KEYS.bookings, SEED_BOOKINGS);
  }
};

/* ---------- Small helpers ---------- */
const fmtCr = (n) => `₹${Number(n).toFixed(2)} Cr`;
const badgeClass = (s) => "badge badge-" + String(s).toLowerCase().replace(/\s+/g, "-");
const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------- Property card HTML (used on Home + Properties pages) ---------- */
function cardHTML(p) {
  const sizeTxt = `${p.size} Sq. Yds.`;
  const bhkTxt = p.bhk ? ` • ${p.bhk} BHK` : "";
  const canBook = p.status !== "Sold";
  return `
    <article class="p-card" data-id="${p.id}">
      <div class="thumb">
        <img src="${escapeHTML(p.img || FALLBACK_IMG)}" alt="${escapeHTML(p.title)}" loading="lazy" />
        <span class="${badgeClass(p.status)}">${p.status}</span>
        <span class="tag">Block ${p.block} • ${p.type}</span>
      </div>
      <div class="body">
        <h3>${escapeHTML(p.title)}</h3>
        <div class="meta"><span>📐 ${sizeTxt}${bhkTxt}</span><span>🧭 ${p.facing} Facing</span><span>🆔 ${p.id}</span></div>
        <p class="price">${fmtCr(p.price)}*</p>
        <div class="actions">
          <button class="btn btn-dark btn-sm view-btn" data-id="${p.id}">View Details</button>
          ${canBook
            ? `<a class="btn btn-gold btn-sm" href="contact.html?property=${p.id}#book">Book Visit</a>`
            : `<span class="btn btn-sm sold-out">Sold Out</span>`}
        </div>
      </div>
    </article>`;
}

/* ---------- Toast (small success / error popup) ---------- */
function toast(msg, type = "success") {
  let box = document.getElementById("toast-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-box";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = (type === "success" ? "✓  " : "✕  ") + msg;
  box.appendChild(t);
  setTimeout(() => t.classList.add("hide"), 3200);
  setTimeout(() => t.remove(), 3700);
}

/* ---------- Image fallback: if an online photo fails, show a themed placeholder ---------- */
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 260'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1d2638'/><stop offset='1' stop-color='#3b3324'/></linearGradient></defs><rect width='400' height='260' fill='url(#g)'/><circle cx='200' cy='118' r='46' fill='none' stroke='#d4a85a' stroke-width='2'/><text x='200' y='134' font-family='serif' font-size='40' fill='#d4a85a' text-anchor='middle'>安全</text><text x='200' y='200' font-family='serif' font-size='18' letter-spacing='6' fill='#e9c98b' text-anchor='middle'>ANZEN</text></svg>"
  );
document.addEventListener(
  "error",
  (e) => {
    const el = e.target;
    if (el.tagName === "IMG" && el.src !== FALLBACK_IMG) el.src = FALLBACK_IMG;
  },
  true
);

/* ---------- Runs on every page ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu (hamburger)
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "✕" : "☰";
    });
  }
  // Highlight the current page in the menu
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
  // Footer year
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
});
