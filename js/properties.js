/* =========================================================
   ANZEN 安全 — properties.js (properties.html)
   JavaScript by: Jyotsnarini
   1. Search + category tabs + filters + sorting
   2. Reads filters from the URL (sent by the home page search)
   3. Property details popup (<dialog>) with 30:40:30 plan
   4. Home loan EMI calculator
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const properties = Store.getProperties();

  const form = document.getElementById("filterForm");
  const grid = document.getElementById("propertyGrid");
  const countEl = document.getElementById("resultCount");
  const emptyEl = document.getElementById("noResults");
  const tabs = document.querySelectorAll(".cat-tab");
  let activeType = ""; // set by category tabs

  /* ---------- 1. Read URL parameters (e.g. ?type=Villa&budget=5) ---------- */
  const params = new URLSearchParams(location.search);
  ["size", "facing", "budget", "status", "block"].forEach((name) => {
    if (params.get(name) && form.elements[name]) form.elements[name].value = params.get(name);
  });
  if (params.get("q")) form.elements.search.value = params.get("q");
  if (params.get("type")) setActiveTab(params.get("type"));

  /* ---------- 2. Filtering + sorting ---------- */
  function applyFilters() {
    const f = form.elements;
    const text = f.search.value.trim().toLowerCase();
    const [minSize, maxSize] = f.size.value ? f.size.value.split("-").map(Number) : [0, Infinity];
    const budget = f.budget.value ? Number(f.budget.value) : Infinity;

    let list = properties.filter((p) => {
      const haystack = `${p.title} ${p.id} ${p.desc} ${p.type} block ${p.block}`.toLowerCase();
      return (
        (!text || haystack.includes(text)) &&
        (!activeType || p.type === activeType) &&
        (!f.block.value || p.block === f.block.value) &&
        (!f.facing.value || p.facing.includes(f.facing.value)) &&
        (!f.status.value || p.status === f.status.value) &&
        p.size >= minSize && p.size <= maxSize &&
        p.price <= budget
      );
    });

    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "size-asc": (a, b) => a.size - b.size,
      "size-desc": (a, b) => b.size - a.size
    };
    if (sorters[f.sort.value]) list.sort(sorters[f.sort.value]);

    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length > 0;
    countEl.innerHTML = `Showing <strong>${list.length}</strong> of ${properties.length} properties` +
      ` • <strong>${list.filter((p) => p.status === "Available").length}</strong> available`;
  }

  function setActiveTab(type) {
    activeType = type;
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.type === type));
  }

  form.addEventListener("input", applyFilters);
  form.addEventListener("change", applyFilters);
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("reset", () => {
    setActiveTab("");
    setTimeout(applyFilters, 0); // wait until the browser has cleared the fields
  });
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.type);
      applyFilters();
    })
  );

  applyFilters();

  /* ---------- 3. Property details popup ---------- */
  const modal = document.getElementById("propertyModal");
  const modalBody = document.getElementById("modalBody");

  function openModal(id) {
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    const lakh = (pct) => `₹${(p.price * pct).toFixed(2)} Cr`;
    modalBody.innerHTML = `
      <img class="modal-img" src="${escapeHTML(p.img || FALLBACK_IMG)}" alt="${escapeHTML(p.title)}" />
      <div class="modal-info">
        <span class="${badgeClass(p.status)}" style="align-self:flex-start">${p.status}</span>
        <h2 id="modalTitle">${escapeHTML(p.title)}</h2>
        <p>${escapeHTML(p.desc || "")}</p>
        <dl class="detail-list">
          <div><dt>Listing ID</dt><dd>${p.id}</dd></div>
          <div><dt>Type</dt><dd>${p.type}</dd></div>
          <div><dt>Block</dt><dd>Block ${p.block}</dd></div>
          <div><dt>Plot Area</dt><dd>${p.size} Sq. Yds.</dd></div>
          <div><dt>Configuration</dt><dd>${p.bhk ? p.bhk + " BHK" : "Open Plot"}</dd></div>
          <div><dt>Facing</dt><dd>${p.facing}</dd></div>
        </dl>
        <p class="price">${fmtCr(p.price)}*</p>
        <div class="pay-plan" aria-label="30 40 30 payment plan">
          <div class="pay-step"><strong>${lakh(0.3)}</strong>30% Booking</div>
          <div class="pay-step"><strong>${lakh(0.4)}</strong>40% Infra</div>
          <div class="pay-step"><strong>${lakh(0.3)}</strong>30% Possession</div>
        </div>
        ${p.status === "Sold"
          ? `<p class="badge badge-sold">This property is sold. Explore similar listings above.</p>`
          : `<a class="btn btn-gold" href="contact.html?property=${p.id}#book">Book a Site Visit →</a>`}
      </div>`;
    modal.showModal();
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (btn) openModal(btn.dataset.id);
  });
  document.getElementById("modalClose").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); }); // click outside closes

  if (params.get("view")) openModal(params.get("view")); // opened from the home page

  /* ---------- 4. EMI calculator ---------- */
  const emi = {
    property: document.getElementById("emiProperty"),
    loan: document.getElementById("emiLoan"),
    rate: document.getElementById("emiRate"),
    years: document.getElementById("emiYears")
  };
  emi.property.innerHTML = properties
    .map((p) => `<option value="${p.price}">${escapeHTML(p.title)} — ${fmtCr(p.price)}</option>`)
    .join("");

  function calcEMI() {
    const price = Number(emi.property.value) * 1e7;           // crore → rupees
    const principal = price * (Number(emi.loan.value) / 100);
    const r = Number(emi.rate.value) / 12 / 100;              // monthly rate
    const n = Number(emi.years.value) * 12;                    // months
    const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;

    document.getElementById("emiLoanOut").textContent = emi.loan.value;
    document.getElementById("emiRateOut").textContent = Number(emi.rate.value).toFixed(1);
    document.getElementById("emiYearsOut").textContent = emi.years.value;
    document.getElementById("emiResult").textContent = "₹" + Math.round(monthly).toLocaleString("en-IN");
    document.getElementById("emiBreakup").textContent =
      `Loan ₹${(principal / 1e7).toFixed(2)} Cr • Total interest ₹${((total - principal) / 1e7).toFixed(2)} Cr`;
  }
  Object.values(emi).forEach((el) => el.addEventListener("input", calcEMI));
  calcEMI();
});
