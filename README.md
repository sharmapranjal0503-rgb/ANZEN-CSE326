# ANZEN 安全 — Real Estate Listing Website

> **"Where Every Corner Feels Like a Safe Space"**

**ANZEN** (安全) is Japanese for **"safety"**. ANZEN is a responsive real estate listing website for a fictional Indo-Japanese gated township in Sector 80, Greater Faridabad. It organises property information (plots, villas, estates) and lets users search, filter, book site visits and track their status. A sales dashboard lets staff add, update and manage listings.

Built with **HTML5, CSS3 and vanilla JavaScript**. No frameworks, no backend. Data is saved in the browser using `localStorage`.

**Course:** CSE326 — Internet Programming Laboratory, Lovely Professional University

---

## 👥 Team & Roles

| Member | Role | Files Owned |
|---|---|---|
| **Akshita** | HTML (structure & semantics) | `index.html`, `properties.html`, `contact.html`, `dashboard.html` |
| **Pranjal** | CSS (design, theme & responsiveness) | `css/global.css`, `css/home.css`, `css/properties.css`, `css/contact.css`, `css/dashboard.css` |
| **Jyotsnarini** | JavaScript (functionality & data) | `js/store.js`, `js/home.js`, `js/properties.js`, `js/contact.js`, `js/dashboard.js` |

---

## ✅ Project Requirements → Where They Are

| Requirement | How ANZEN meets it | Page / File |
|---|---|---|
| **Responsive web interface** | CSS Grid + Flexbox, media queries at 1150 / 960 / 780 / 560 px, hamburger menu on mobile | All pages, `css/*.css` |
| **Structured forms for adding/updating records** | *Add / Edit Property* form (add new listing, edit existing one) + *Site Visit Booking* form | `dashboard.html`, `contact.html` |
| **Search, filtering & categories** | Category tabs (Plots / Villas / Estates), keyword search, filters for block, size, facing, budget and status, plus sorting | `properties.html`, `js/properties.js` |
| **Status / progress tracking** | Property status: **Available → Booked → Sold**. Visit status: **New → Contacted → Visit Done → Closed**, with a progress tracker | `dashboard.html`, `contact.html#track` |
| **Dashboard / summary view** | Summary cards (total, available, booked, sold, value, visits) and CSS charts (status share, listings by block, visit pipeline) | `dashboard.html`, `js/dashboard.js` |
| **Input validation & clear success/error messages** | Field-by-field checks with red/green borders, error text under each field, form-level alert and toast pop-ups | `js/contact.js`, `js/dashboard.js` |

---

## 📄 Pages

1. **Home (`index.html`)**: hero with tagline, quick search bar, live "available homes" counter, *The Anzen Promise* safety section, design philosophy, featured listings, expanding Tokyo Clubhouse gallery.
2. **Properties & Plans (`properties.html`)**: category tabs, search and filters, property cards, details popup with 30:40:30 payment split, master layout / floor plan switcher, pricing table, EMI calculator.
3. **Location & Visit (`contact.html`)**: connectivity accordions, live Google Map, full-screen lightbox gallery, site visit booking form, booking status tracker.
4. **Dashboard (`dashboard.html`)**: summary cards, charts, add/edit property form, listings table (search, filter, change status, edit, delete), site visit requests table (update status, delete).

---

## 🧰 Concepts Used

**HTML5:** semantic tags (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`), forms with `fieldset` / `legend`, input types (`email`, `tel`, `date`, `number`, `range`, `url`, `search`), `<dialog>`, `<details>` / `<summary>`, `<table>` with `caption` / `thead` / `tbody` / `tfoot`, `<iframe>` map, `<output>`, ARIA labels.

**CSS3:** custom properties (variables), Flexbox, CSS Grid with `grid-template-areas`, media queries, transitions & keyframe animations, `:target` lightbox, radio-button tab switcher (`:checked ~`), `:has()`, `::backdrop`, gradients, sticky header.

**JavaScript (ES6):** DOM manipulation, event handling & delegation, `localStorage` with JSON, array methods (`filter`, `map`, `reduce`, `sort`), template literals, regular expressions for validation, `URLSearchParams`, `<dialog>.showModal()`, EMI formula.

---

## 📁 Folder Structure

```
anzen/
├── index.html          # Home
├── properties.html     # Listings, plans, pricing, EMI
├── contact.html        # Map, gallery, booking, tracking
├── dashboard.html      # Add/edit listings, status tracking
├── css/
│   ├── global.css      # Shared theme (all pages)
│   ├── home.css
│   ├── properties.css
│   ├── contact.css
│   └── dashboard.css
├── js/
│   ├── store.js        # Shared data + helpers (all pages)
│   ├── home.js
│   ├── properties.js
│   ├── contact.js
│   └── dashboard.js
└── README.md
```

---

## ▶️ How to Run

1. Download or clone this repository.
2. Open **`index.html`** in any modern browser (Chrome, Edge or Firefox).
3. That's it. No installation needed.

> An internet connection is needed only for fonts, photos and the Google Map. Everything else works offline.
> To restore the original sample data, open **Dashboard → "Reset Demo Data"** (click twice to confirm).

---

## ⬆️ How to Upload to GitHub (no Git needed)

1. Log in to GitHub → click **+** (top right) → **New repository**.
2. Name it `anzen-real-estate`, choose **Public**, and click **Create repository**.
3. On the next page click **"uploading an existing file"**.
4. Unzip the project and **drag all files and folders** (`index.html`, `css`, `js`, `README.md`, etc.) into the upload box.
5. Write a commit message such as `Initial commit: ANZEN real estate website` → **Commit changes**.
6. *(Optional, live website)* Go to **Settings → Pages → Branch: `main` / root → Save**. In a minute the site goes live at `https://<username>.github.io/anzen-real-estate/`.

---

## 🎤 Viva Guide — Who Explains What

**Akshita (HTML)**
- Why semantic tags matter (SEO, accessibility, readable structure)
- Booking form: `fieldset`, `legend`, `label for=`, input types, `novalidate`
- `<dialog>` popup, `<details>` accordions, the pricing `<table>`, the map `<iframe>`
- How `id`s and `class`es connect HTML to CSS and JS (e.g. `id="bookingForm"` is used in `contact.js`)

**Pranjal (CSS)**
- Theme colours stored in `:root` variables (`--gold`, `--navy`, …)
- Responsive layout: Grid / Flexbox + media queries, plus the hamburger menu
- **Pure-CSS tricks:** clubhouse gallery (`flex: 1` → `flex: 3.6` on hover), lightbox using `:target`, plan switcher using hidden radios + `:checked ~`
- `.invalid` / `.valid` classes that JS adds to show red/green borders

**Jyotsnarini (JavaScript)**
- `store.js`: how `localStorage` saves data as JSON so changes persist after refresh
- Search & filter logic (`filter` + `sort`) and reading URL parameters from the home search
- Validation rules (regex for name, phone `^[6-9]\d{9}$`, email) and how error/success messages are shown
- Add vs. update in the dashboard (hidden `id` field), status change, two-click delete
- EMI formula: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)`

---

## ⚠️ Disclaimer

This is an academic project. ANZEN, its blocks, property names, prices, phone numbers and other details are **fictional** and created only for demonstration. Photos are loaded from Unsplash; if one fails to load, an ANZEN placeholder is shown.
