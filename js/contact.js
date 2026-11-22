/* =========================================================
   ANZEN 安全 — contact.js (contact.html)
   JavaScript by: Jyotsnarini
   1. Fills the property dropdown (Sold homes are hidden)
   2. Site-visit form: field-by-field validation with clear
      error messages + success message with Booking ID
   3. Saves bookings → they appear on the Dashboard
   4. Booking status tracker (New → Contacted → Visit Done → Closed)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  const alertBox = document.getElementById("bookingAlert");
  const f = form.elements;
  const params = new URLSearchParams(location.search);

  /* ---------- 1. Property dropdown ---------- */
  const bookable = Store.getProperties().filter((p) => p.status !== "Sold");
  f.property.innerHTML =
    `<option value="">-- Choose Plot / Villa --</option>` +
    bookable
      .map((p) => `<option value="${p.id}">${escapeHTML(p.title)} (${p.size} Sq. Yds.) — ${fmtCr(p.price)}${p.status === "Booked" ? " • Booked" : ""}</option>`)
      .join("");
  if (params.get("property")) f.property.value = params.get("property");

  // Visit date: only today → next 90 days
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  f.date.min = todayISO();
  f.date.max = maxDate.toISOString().slice(0, 10);

  // Budget slider shows its value live
  const budgetOut = document.getElementById("bBudgetOut");
  f.budget.addEventListener("input", () => (budgetOut.textContent = fmtCr(f.budget.value)));

  // Phone: allow digits only
  f.phone.addEventListener("input", () => (f.phone.value = f.phone.value.replace(/\D/g, "").slice(0, 10)));

  /* ---------- 2. Validation rules (return "" when valid, or an error message) ---------- */
  const rules = {
    name: (v) =>
      !v.trim() ? "Please enter your full name." :
      !/^[A-Za-z][A-Za-z .'-]{2,49}$/.test(v.trim()) ? "Name should have only letters and at least 3 characters." : "",
    phone: (v) =>
      !v ? "Please enter your mobile number." :
      !/^[6-9]\d{9}$/.test(v) ? "Enter a valid 10-digit Indian mobile number starting with 6–9." : "",
    email: (v) =>
      !v.trim() ? "Please enter your email address." :
      !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? "Enter a valid email, e.g. name@example.com." : "",
    property: (v) => (!v ? "Please choose a plot or villa to visit." : ""),
    date: (v) =>
      !v ? "Please pick a visit date." :
      v < f.date.min ? "Visit date cannot be in the past." :
      v > f.date.max ? "Bookings are open only for the next 90 days." : "",
    slot: (v) => (!v ? "Please choose a time slot." : ""),
    purpose: (v) => (!v ? "Please select the purpose of purchase." : ""),
    terms: (_, el) => (!el.checked ? "Please accept so our team can contact you." : "")
  };

  // Shows/clears the message under one field and colours its border (CSS .invalid / .valid)
  function checkField(name) {
    const el = f[name];
    const value = name === "purpose" ? (form.querySelector('input[name="purpose"]:checked') || {}).value || "" : el.value;
    const message = rules[name](value, el);
    const firstInput = el.length && !el.options ? el[0] : el; // radio group → first radio
    const wrapper = firstInput.closest(".field");
    wrapper.classList.toggle("invalid", !!message);
    wrapper.classList.toggle("valid", !message && name !== "terms" && name !== "purpose");
    wrapper.querySelector(".error-msg").textContent = message;
    return !message;
  }

  // Live checking: after the user leaves a field, and while typing once it has an error
  Object.keys(rules).forEach((name) => {
    const els = f[name].length && !f[name].options ? [...f[name]] : [f[name]];
    els.forEach((el) => {
      el.addEventListener("blur", () => checkField(name));
      el.addEventListener("change", () => checkField(name));
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("invalid")) checkField(name); });
    });
  });

  function showAlert(type, html) {
    alertBox.className = `form-alert show ${type}`;
    alertBox.innerHTML = html;
  }

  /* ---------- 3. Submit ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map(checkField);
    const errors = results.filter((ok) => !ok).length;

    if (errors) {
      showAlert("error", `⚠ Please correct the <strong>${errors}</strong> highlighted field${errors > 1 ? "s" : ""} below.`);
      toast("Booking not submitted — check the form.", "error");
      form.querySelector(".field.invalid input, .field.invalid select")?.focus();
      return;
    }

    const bookings = Store.getBookings();
    const booking = {
      id: Store.nextId("BK", bookings, 1000),
      name: f.name.value.trim(),
      phone: f.phone.value,
      email: f.email.value.trim(),
      propertyId: f.property.value,
      date: f.date.value,
      slot: f.slot.value,
      budget: Number(f.budget.value),
      purpose: form.querySelector('input[name="purpose"]:checked').value,
      chauffeur: f.chauffeur.checked,
      status: "New",
      created: todayISO()
    };
    bookings.push(booking);
    Store.saveBookings(bookings);

    const prop = Store.getProperty(booking.propertyId);
    showAlert(
      "success",
      `✓ Thank you, <strong>${escapeHTML(booking.name)}</strong>! Your visit to <strong>${escapeHTML(prop.title)}</strong> on ` +
      `<strong>${new Date(booking.date).toDateString()}</strong> at ${booking.slot} is requested.<br/>` +
      `Your Booking ID is <strong>${booking.id}</strong> — use it below to track the status.`
    );
    toast(`Site visit booked! ID: ${booking.id}`);

    form.reset();
    budgetOut.textContent = fmtCr(f.budget.value);
    form.querySelectorAll(".field").forEach((el) => el.classList.remove("valid", "invalid"));
    document.getElementById("trackId").value = booking.id;
    showTracking(booking.id);
    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- 4. Booking status tracker ---------- */
  const trackForm = document.getElementById("trackForm");
  const trackResult = document.getElementById("trackResult");

  function showTracking(id) {
    const booking = Store.getBookings().find((b) => b.id === id.trim().toUpperCase());
    if (!booking) {
      trackResult.innerHTML = `<p class="track-error">✕ No booking found with ID "${escapeHTML(id)}". Please check and try again.</p>`;
      return;
    }
    const prop = Store.getProperty(booking.propertyId);
    const stepIndex = BOOKING_STATUSES.indexOf(booking.status);
    const pct = (stepIndex / (BOOKING_STATUSES.length - 1)) * 75; // bar spans 75% (between first and last dot)

    trackResult.innerHTML = `
      <div class="track-card">
        <span class="${badgeClass(booking.status)}">${booking.status}</span>
        <h3>${booking.id} — ${escapeHTML(booking.name)}</h3>
        <p class="meta-line">${prop ? escapeHTML(prop.title) : booking.propertyId} • ${new Date(booking.date).toDateString()} • ${booking.slot || ""}</p>
        <div class="progress">
          <span class="bar" style="width:${pct}%"></span>
          ${BOOKING_STATUSES.map((s, i) => `
            <div class="step ${i <= stepIndex ? "done" : ""} ${i === stepIndex ? "current" : ""}">
              <span class="dot">${i < stepIndex ? "✓" : i + 1}</span>${s}
            </div>`).join("")}
        </div>
      </div>`;
  }

  trackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("trackId").value;
    if (!id.trim()) {
      trackResult.innerHTML = `<p class="track-error">✕ Please enter a Booking ID, e.g. BK-1001.</p>`;
      return;
    }
    showTracking(id);
  });
});
