/* =========================================================
   ANZEN 安全 — dashboard.js (dashboard.html)
   JavaScript by: Jyotsnarini
   1. Summary cards + CSS charts (live from saved data)
   2. Add / Edit property form with validation & messages
   3. Listings table: search, filter, status update, edit, delete
   4. Site-visit table: status tracking New → Closed
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  let properties = Store.getProperties();
  let bookings = Store.getBookings();

  const $ = (id) => document.getElementById(id);
  const form = $("propertyForm");
  const f = form.elements;

  /* ---------- Render everything ---------- */
  function renderAll(flashId) {
    renderKPIs();
    renderCharts();
    renderListings(flashId);
    renderBookings();
  }

  /* ---------- 1a. Summary cards ---------- */
  function renderKPIs() {
    const count = (s) => properties.filter((p) => p.status === s).length;
    const availableValue = properties.filter((p) => p.status === "Available").reduce((sum, p) => sum + Number(p.price), 0);
    const newVisits = bookings.filter((b) => b.status === "New").length;

    const cards = [
      { label: "Total Listings", value: properties.length, note: "Plots, villas & estates" },
      { label: "Available", value: count("Available"), note: "Ready to book", cls: "k-available" },
      { label: "Booked", value: count("Booked"), note: "Token received", cls: "k-booked" },
      { label: "Sold", value: count("Sold"), note: "Registry done", cls: "k-sold" },
      { label: "Available Value", value: fmtCr(availableValue), note: "Unsold inventory" },
      { label: "Site Visits", value: bookings.length, note: `${newVisits} new to call`, cls: "k-new" }
    ];
    $("kpiGrid").innerHTML = cards
      .map((c) => `<div class="kpi ${c.cls || ""}"><span>${c.label}</span><strong>${c.value}</strong><small>${c.note}</small></div>`)
      .join("");
  }

  /* ---------- 1b. Charts ---------- */
  function barRow(label, value, max) {
    const pct = max ? (value / max) * 100 : 0;
    return `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><b>${value}</b></div>`;
  }

  function renderCharts() {
    const total = properties.length || 1;
    const colours = { Available: "#4f9a5a", Booked: "#d39b2a", Sold: "#b4413b" };

    $("statusBar").innerHTML = PROPERTY_STATUSES.map((s) => {
      const pct = (properties.filter((p) => p.status === s).length / total) * 100;
      return `<span class="seg-${s.toLowerCase()}" style="width:${pct}%" title="${s}: ${pct.toFixed(0)}%"></span>`;
    }).join("");

    $("statusLegend").innerHTML = PROPERTY_STATUSES.map((s) => {
      const n = properties.filter((p) => p.status === s).length;
      return `<li><i style="background:${colours[s]}"></i>${s}<b>${n} (${((n / total) * 100).toFixed(0)}%)</b></li>`;
    }).join("");

    const blocks = ["A", "B", "C", "D"].map((b) => [b, properties.filter((p) => p.block === b).length]);
    const maxBlock = Math.max(1, ...blocks.map((x) => x[1]));
    $("blockBars").innerHTML = blocks.map(([b, n]) => barRow(`Block ${b}`, n, maxBlock)).join("");

    const stages = BOOKING_STATUSES.map((s) => [s, bookings.filter((b) => b.status === s).length]);
    const maxStage = Math.max(1, ...stages.map((x) => x[1]));
    $("pipeline").innerHTML = stages.map(([s, n]) => barRow(s, n, maxStage)).join("");
  }

  /* ---------- 2. Add / Edit form ---------- */
  const rules = {
    title: (v, id) => {
      v = v.trim();
      if (v.length < 3 || v.length > 60) return "Name must be 3–60 characters.";
      const duplicate = properties.some((p) => p.title.toLowerCase() === v.toLowerCase() && p.id !== id);
      return duplicate ? "A property with this name already exists." : "";
    },
    type: (v) => (!v ? "Please select a type." : ""),
    block: (v) => (!v ? "Please select a block." : ""),
    size: (v) => (!v ? "Enter the plot size." : !Number.isInteger(+v) || +v < 100 || +v > 1000 ? "Size must be a whole number between 100 and 1000." : ""),
    bhk: (v) => {
      if (v === "" || !Number.isInteger(+v) || +v < 0 || +v > 8) return "BHK must be between 0 and 8.";
      if (f.type.value === "Villa" && +v === 0) return "A villa needs at least 1 BHK.";
      if (f.type.value !== "Villa" && +v > 0) return "Plots and estates are open land — use 0.";
      return "";
    },
    price: (v) => (!v ? "Enter the price in crore." : isNaN(v) || +v < 0.5 || +v > 50 ? "Price must be between ₹0.5 Cr and ₹50 Cr." : ""),
    facing: (v) => (!v ? "Please select the facing." : ""),
    status: (v) => (!PROPERTY_STATUSES.includes(v) ? "Please select a status." : ""),
    img: (v) => (v && !/^https?:\/\/.+/i.test(v.trim()) ? "Image URL must start with http:// or https://" : ""),
    desc: (v) => (v.trim().length < 10 ? "Description must be at least 10 characters." : "")
  };

  function checkField(name) {
    const message = rules[name](f[name].value, f.id.value);
    const wrapper = f[name].closest(".field");
    wrapper.classList.toggle("invalid", !!message);
    wrapper.classList.toggle("valid", !message);
    wrapper.querySelector(".error-msg").textContent = message;
    return !message;
  }
  Object.keys(rules).forEach((name) => {
    f[name].addEventListener("blur", () => checkField(name));
    f[name].addEventListener("change", () => checkField(name));
  });
  f.type.addEventListener("change", () => { if (f.bhk.value !== "") checkField("bhk"); });

  function showFormAlert(type, html) {
    const box = $("formAlert");
    box.className = `form-alert show ${type}`;
    box.innerHTML = html;
  }

  function clearForm() {
    form.reset();
    f.id.value = "";
    form.querySelectorAll(".field").forEach((el) => el.classList.remove("valid", "invalid"));
    form.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
    form.classList.remove("editing");
    $("formTitle").textContent = "Add New Property";
    $("saveBtn").textContent = "+ Add Property";
    $("cancelEdit").hidden = true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errors = Object.keys(rules).map(checkField).filter((ok) => !ok).length;
    if (errors) {
      showFormAlert("error", `⚠ Please fix <strong>${errors}</strong> field${errors > 1 ? "s" : ""} before saving.`);
      toast("Property not saved — check the form.", "error");
      return;
    }

    const data = {
      title: f.title.value.trim(),
      type: f.type.value,
      block: f.block.value,
      size: Number(f.size.value),
      bhk: Number(f.bhk.value),
      price: Number(Number(f.price.value).toFixed(2)),
      facing: f.facing.value,
      status: f.status.value,
      img: f.img.value.trim(),
      desc: f.desc.value.trim()
    };

    let id = f.id.value;
    if (id) {
      // UPDATE an existing record
      properties = properties.map((p) => (p.id === id ? { ...p, ...data } : p));
      showFormAlert("success", `✓ <strong>${escapeHTML(data.title)}</strong> (${id}) was updated.`);
      toast(`${id} updated successfully`);
    } else {
      // ADD a new record
      id = Store.nextId("AZ", properties, 100);
      properties.push({ id, ...data });
      showFormAlert("success", `✓ <strong>${escapeHTML(data.title)}</strong> was added with ID <strong>${id}</strong>. It is now live on the Properties page.`);
      toast(`${id} added to listings`);
    }
    Store.saveProperties(properties);
    clearForm();
    renderAll(id);
  });

  $("cancelEdit").addEventListener("click", () => {
    clearForm();
    $("formAlert").className = "form-alert";
  });

  function startEdit(id) {
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    clearForm();
    ["title", "type", "block", "size", "bhk", "price", "facing", "status", "img", "desc"].forEach((k) => (f[k].value = p[k] ?? ""));
    f.id.value = p.id;
    form.classList.add("editing");
    $("formTitle").textContent = `Edit ${p.id}`;
    $("saveBtn").textContent = "✓ Update Property";
    $("cancelEdit").hidden = false;
    $("formAlert").className = "form-alert";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    f.title.focus({ preventScroll: true });
  }

  /* ---------- 3. Listings table ---------- */
  const statusSelect = (options, current, attr) =>
    `<select class="status-select s-${current.toLowerCase().replace(/\s+/g, "-")}" ${attr}>` +
    options.map((s) => `<option ${s === current ? "selected" : ""}>${s}</option>`).join("") +
    `</select>`;

  function renderListings(flashId) {
    const text = $("tableSearch").value.trim().toLowerCase();
    const status = $("tableStatus").value;
    const rows = properties.filter(
      (p) => (!status || p.status === status) && (!text || `${p.id} ${p.title} ${p.type} block ${p.block}`.toLowerCase().includes(text))
    );
    $("listingRows").innerHTML = rows.length
      ? rows.map((p) => `
        <tr data-id="${p.id}" class="${p.id === flashId ? "flash" : ""}">
          <td>${p.id}</td>
          <td><div class="cell-title">${escapeHTML(p.title)}</div><div class="cell-sub">${p.type}${p.bhk ? ` • ${p.bhk} BHK` : ""} • ${p.facing}</div></td>
          <td>${p.block}</td>
          <td>${p.size}</td>
          <td>${fmtCr(p.price)}</td>
          <td>${statusSelect(PROPERTY_STATUSES, p.status, `data-prop="${p.id}" aria-label="Status of ${p.id}"`)}</td>
          <td><div class="row-actions">
            <button class="icon-btn" data-edit="${p.id}">Edit</button>
            <button class="icon-btn danger" data-del="${p.id}">Delete</button>
          </div></td>
        </tr>`).join("")
      : `<tr class="empty-row"><td colspan="7">No listings match your search.</td></tr>`;
  }

  $("tableSearch").addEventListener("input", () => renderListings());
  $("tableStatus").addEventListener("change", () => renderListings());

  // Two-click delete: first click asks "Sure?", second click deletes (no browser popup needed)
  function confirmClick(btn, action) {
    if (btn.classList.contains("confirm")) return action();
    const old = btn.textContent;
    btn.classList.add("confirm");
    btn.textContent = "Sure?";
    setTimeout(() => { btn.classList.remove("confirm"); btn.textContent = old; }, 3000);
  }

  $("listingRows").addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");
    if (editBtn) startEdit(editBtn.dataset.edit);
    if (delBtn) {
      confirmClick(delBtn, () => {
        const id = delBtn.dataset.del;
        properties = properties.filter((p) => p.id !== id);
        Store.saveProperties(properties);
        if (f.id.value === id) clearForm();
        toast(`${id} deleted`);
        renderAll();
      });
    }
  });

  $("listingRows").addEventListener("change", (e) => {
    const sel = e.target.closest("[data-prop]");
    if (!sel) return;
    const id = sel.dataset.prop;
    properties = properties.map((p) => (p.id === id ? { ...p, status: sel.value } : p));
    Store.saveProperties(properties);
    toast(`${id} marked as ${sel.value}`);
    renderAll(id);
  });

  /* ---------- 4. Site-visit bookings ---------- */
  function renderBookings() {
    const filter = $("bookingFilter").value;
    const rows = bookings.filter((b) => !filter || b.status === filter).sort((a, b) => b.created.localeCompare(a.created));
    $("bookingRows").innerHTML = rows.length
      ? rows.map((b) => {
          const prop = properties.find((p) => p.id === b.propertyId);
          const step = BOOKING_STATUSES.indexOf(b.status);
          return `
          <tr>
            <td>${b.id}</td>
            <td><div class="cell-title">${escapeHTML(b.name)}</div><div class="cell-sub">${b.purpose}${b.chauffeur ? " • 🚗 Chauffeur" : ""}</div></td>
            <td><div>${b.phone}</div><div class="cell-sub">${escapeHTML(b.email)}</div></td>
            <td>${prop ? escapeHTML(prop.title) : b.propertyId}</td>
            <td><div>${new Date(b.date).toDateString()}</div><div class="cell-sub">${b.slot || ""}</div></td>
            <td><div class="mini-progress" title="Step ${step + 1} of 4">${BOOKING_STATUSES.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div></td>
            <td>${statusSelect(BOOKING_STATUSES, b.status, `data-booking="${b.id}" aria-label="Status of ${b.id}"`)}</td>
            <td><button class="icon-btn danger" data-del-booking="${b.id}">Delete</button></td>
          </tr>`;
        }).join("")
      : `<tr class="empty-row"><td colspan="8">No site-visit requests yet.</td></tr>`;
  }

  $("bookingFilter").addEventListener("change", renderBookings);

  $("bookingRows").addEventListener("change", (e) => {
    const sel = e.target.closest("[data-booking]");
    if (!sel) return;
    bookings = bookings.map((b) => (b.id === sel.dataset.booking ? { ...b, status: sel.value } : b));
    Store.saveBookings(bookings);
    toast(`${sel.dataset.booking} → ${sel.value}`);
    renderAll();
  });

  $("bookingRows").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del-booking]");
    if (!btn) return;
    confirmClick(btn, () => {
      bookings = bookings.filter((b) => b.id !== btn.dataset.delBooking);
      Store.saveBookings(bookings);
      toast(`${btn.dataset.delBooking} removed`);
      renderAll();
    });
  });

  /* ---------- Reset demo data ---------- */
  $("resetData").addEventListener("click", (e) => {
    confirmClick(e.currentTarget, () => {
      Store.reset();
      properties = Store.getProperties();
      bookings = Store.getBookings();
      clearForm();
      toast("Demo data restored");
      renderAll();
    });
  });

  renderAll();
});
