/* ===== CONFIG: change the restaurant details here only ===== */
const CONFIG = {
  name: "Kaka Vatij Restro & Bar",
  whatsapp: "9779800000000", // country code + number, no "+" or spaces (REPLACE)
  phone: "+977 980-0000000", // (REPLACE)
  address: "Aapgachi, Itahari, Sunsari, Nepal",
  hours: [ // (REPLACE with the real hours)
    ["Sunday to Friday", "11:00 am to 10:00 pm"],
    ["Saturday", "11:00 am to 11:00 pm"]
  ],
  social: { facebook: "https://facebook.com/", instagram: "https://instagram.com/" },
  mapUrl: "https://www.google.com/maps?q=Kaka+Vatij+Restro+Bar+Itahari&output=embed",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Kaka+Vatij+Restro+Bar+Itahari"
};

/* ===== MENU: SAMPLE dishes and prices. Replace with the real menu. ===== */
const MENU = [
  { cat: "Starters", name: "Chicken Momo", desc: "Steamed or fried, with spicy tomato achar", price: 220, sig: true },
  { cat: "Starters", name: "Chicken Chilli", desc: "Crisp chicken, peppers and onion", price: 360 },
  { cat: "Starters", name: "French Fries", desc: "Salted, with a creamy dip", price: 180 },
  { cat: "Mains", name: "Chicken Sekuwa", desc: "Charcoal grilled, with spiced onion salad", price: 420, sig: true },
  { cat: "Mains", name: "Butter Chicken with Naan", desc: "Slow simmered, mild and rich", price: 480 },
  { cat: "Mains", name: "Veg Fried Rice", desc: "Wok tossed vegetables and fragrant rice", price: 260 },
  { cat: "Drinks", name: "Masala Tea", desc: "Hot, sweet and spiced", price: 60 },
  { cat: "Drinks", name: "Fresh Lime Soda", desc: "Sweet, salted or mixed", price: 120 },
  { cat: "Drinks", name: "Cold Coffee", desc: "Blended with ice and milk", price: 200 },
  { cat: "Drinks", name: "Virgin Mojito", desc: "Mint, lime and soda", price: 280 },
  { cat: "Desserts", name: "Brownie with Ice Cream", desc: "Warm brownie, vanilla scoop", price: 250 },
  { cat: "Desserts", name: "Gulab Jamun", desc: "Two pieces in warm syrup", price: 150 }
];

/* ===== REVIEWS: SAMPLE text. Replace with real guest reviews. ===== */
const REVIEWS = [
  { text: "A calm corner of Itahari. We stayed far longer than we planned.", who: "A guest" },
  { text: "The food came out warm, the staff were kind, and nobody hurried us.", who: "A guest" },
  { text: "Our favourite place for a quiet dinner with friends.", who: "A guest" }
];

/* ===== Site code ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Fill contact details from CONFIG
const tel = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
$$("[data-address]").forEach(e => e.textContent = CONFIG.address);
$$("[data-phone]").forEach(e => { e.textContent = CONFIG.phone; e.href = tel; });
$$("[data-wa]").forEach(e => e.href = "https://wa.me/" + CONFIG.whatsapp);
$$("[data-directions]").forEach(e => e.href = CONFIG.directionsUrl);
$$("[data-social]").forEach(e => e.href = CONFIG.social[e.dataset.social]);
$("#hours").innerHTML = CONFIG.hours.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join("");
$("#map").src = CONFIG.mapUrl;
$("#yr").textContent = new Date().getFullYear();

// Restaurant structured data for search engines
const ld = document.createElement("script");
ld.type = "application/ld+json";
ld.textContent = JSON.stringify({
  "@context": "https://schema.org", "@type": "Restaurant", name: CONFIG.name, telephone: CONFIG.phone,
  address: { "@type": "PostalAddress", streetAddress: CONFIG.address, addressCountry: "NP" },
  hasMap: CONFIG.directionsUrl, sameAs: Object.values(CONFIG.social)
});
document.head.appendChild(ld);

// Navigation
const burger = $(".burger"), links = $("#nav-links"), dd = $(".dd"), ddb = $(".dd-btn");
const setNav = o => { links.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); };
const setDd = o => { dd.classList.toggle("open", o); ddb.setAttribute("aria-expanded", o); };
burger.onclick = () => setNav(!links.classList.contains("open"));
ddb.onclick = () => setDd(!dd.classList.contains("open"));
links.addEventListener("click", e => { if (e.target.closest("a")) { setNav(false); setDd(false); } });
document.addEventListener("keydown", e => { if (e.key === "Escape") { setNav(false); setDd(false); } });

// Menu with category filters
const itemsEl = $("#items"), filtersEl = $("#filters");
function renderMenu(cat) {
  itemsEl.innerHTML = MENU.filter(m => cat === "All" || m.cat === cat).map(m =>
    `<article class="item"><div class="row"><h3>${m.name}</h3>${m.sig ? '<span class="tag">Signature</span>' : ""}<span class="dots"></span><span class="price">Rs. ${m.price}</span></div><p>${m.desc}</p></article>`
  ).join("");
}
["All", ...new Set(MENU.map(m => m.cat))].forEach((c, i) => {
  const b = document.createElement("button");
  b.textContent = c;
  b.setAttribute("aria-pressed", i === 0);
  b.onclick = () => {
    $$("button", filtersEl).forEach(x => x.setAttribute("aria-pressed", x === b));
    renderMenu(c);
  };
  filtersEl.appendChild(b);
});
renderMenu("All");

// Reservation form: validate, then open WhatsApp with the message filled in
const form = $("#rform"), status = $("#status"), btn = $("button[type=submit]", form);
const el = k => form.elements[k];
el("date").min = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const rules = {
  name: v => v.trim().length >= 2 || "Please enter your name.",
  phone: v => /^\+?[\d\s-]{7,15}$/.test(v.trim()) || "Enter a valid phone number.",
  guests: v => (v >= 1 && v <= 30) || "Guests must be between 1 and 30.",
  date: v => (v && v >= el("date").min) || "Choose today or a later date.",
  time: v => !!v || "Choose a time."
};
form.addEventListener("submit", e => {
  e.preventDefault();
  let ok = true;
  for (const k in rules) {
    const res = rules[k](el(k).value);
    el(k).parentElement.querySelector(".err").textContent = res === true ? "" : res;
    el(k).setAttribute("aria-invalid", res !== true);
    if (res !== true) ok = false;
  }
  if (!ok) { status.textContent = "Please fix the highlighted fields."; return; }
  if (/0{6,}/.test(CONFIG.whatsapp)) { status.textContent = "The restaurant's WhatsApp number has not been set yet."; return; }
  const v = k => el(k).value.trim();
  const msg = [
    `Hello ${CONFIG.name}, I would like to request a table.`, "",
    `Name: ${v("name")}`, `Phone: ${v("phone")}`, `Guests: ${v("guests")}`,
    `Date: ${v("date")}`, `Time: ${v("time")}`,
    v("notes") ? `Requests: ${v("notes")}` : "", "",
    "Please confirm if this is available. Thank you."
  ].filter((l, i, a) => l || a[i - 1] !== "").join("\n");
  btn.disabled = true;
  btn.textContent = "Opening WhatsApp...";
  status.textContent = "Opening WhatsApp. Your table is not booked until the restaurant confirms availability there.";
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  setTimeout(() => { btn.disabled = false; btn.textContent = "Send request on WhatsApp"; }, 2500);
});

// Gallery: shows only the photos that exist in assets/gallery-1.jpg ... gallery-6.jpg
let photoList = [], cur = 0;
const lb = $("#lb"), lbImg = $("img", lb);
const showPhoto = i => { cur = (i + photoList.length) % photoList.length; lbImg.src = photoList[cur]; lbImg.alt = `Kaka Vatij photo ${cur + 1}`; };
$("#lbp").onclick = () => showPhoto(cur - 1);
$("#lbn").onclick = () => showPhoto(cur + 1);
$("#lbx").onclick = () => lb.close();
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
const found = []; let left = 6;
for (let i = 0; i < 6; i++) {
  const im = new Image();
  const done = good => {
    if (good) found[i] = im.src;
    if (--left) return;
    photoList = found.filter(Boolean);
    if (!photoList.length) { $("#gnote").hidden = false; return; }
    $("#grid").innerHTML = photoList.map((s, n) =>
      `<button data-i="${n}" aria-label="Open photo ${n + 1}"><img src="${s}" alt="Kaka Vatij photo ${n + 1}" loading="lazy"></button>`).join("");
  };
  im.onload = () => done(true);
  im.onerror = () => done(false);
  im.src = `assets/gallery-${i + 1}.jpg`;
}
$("#grid").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) { showPhoto(+b.dataset.i); lb.showModal(); }
});

// Reviews slider
let r = 0;
const rq = $("#rev blockquote"), rw = $("#rev figcaption"), rc = $("#rc");
const showReview = i => {
  r = (i + REVIEWS.length) % REVIEWS.length;
  rq.textContent = REVIEWS[r].text; rw.textContent = REVIEWS[r].who;
  rc.textContent = `${r + 1} of ${REVIEWS.length}`;
};
$("#rp").onclick = () => showReview(r - 1);
$("#rn").onclick = () => showReview(r + 1);
showReview(0);

// Back to top
const topBtn = $(".top");
addEventListener("scroll", () => topBtn.classList.toggle("show", scrollY > 600), { passive: true });
topBtn.onclick = () => scrollTo({ top: 0 });
