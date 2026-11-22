/* =========================================================
   ANZEN 安全 — home.js (index.html)
   JavaScript by: Jyotsnarini
   1. Quick search → opens properties.html with filters in URL
   2. Live "available homes" counter
   3. Featured listings (first 3 Available properties)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const properties = Store.getProperties();

  /* 1. Quick search form */
  const form = document.getElementById("quickSearch");
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop normal form submit
    const params = new URLSearchParams();
    ["type", "size", "facing", "budget"].forEach((name) => {
      const value = form.elements[name].value;
      if (value) params.set(name, value);
    });
    window.location.href = "properties.html" + (params.toString() ? "?" + params : "");
  });

  /* 2. Live counter with a small count-up animation */
  const availableCount = properties.filter((p) => p.status === "Available").length;
  const statEl = document.getElementById("statAvailable");
  let n = 0;
  const timer = setInterval(() => {
    statEl.textContent = n;
    if (n >= availableCount) clearInterval(timer);
    n++;
  }, 80);

  /* 3. Featured listings */
  const grid = document.getElementById("featuredGrid");
  const featured = properties.filter((p) => p.status === "Available").slice(0, 3);
  grid.innerHTML = featured.length
    ? featured.map(cardHTML).join("")
    : `<p class="loading">All homes are currently booked. Please check back soon.</p>`;

  // "View Details" on home opens the properties page focused on that listing
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (btn) window.location.href = `properties.html?view=${btn.dataset.id}`;
  });
});
