// ===============================
// ROYAL PET — SITE CONTENT
// ===============================

const CONTENT_VERSION = Date.now();

async function loadJSON(file) {
  const response = await fetch(`${file}?v=${CONTENT_VERSION}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Не вдалося завантажити ${file}`);
  return response.json();
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imagePath(value) {
  if (!value) return "";
  return value.startsWith("/uploads/") ? `.${value}` : value;
}

function setLabelText(input, text) {
  if (!input || text == null) return;
  const label = input.closest("label");
  if (!label) return;
  const textNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = `\n          ${text}\n          `;
}

function setInputPlaceholder(name, text) {
  const input = document.querySelector(`[name="${name}"]`);
  if (input && text != null) input.placeholder = text;
}

async function loadSiteSettings() {
  try {
    const data = await loadJSON("content/site.json");
    document.title = `${data.name || "Royal Pet"} — грумінг-студія`;
    document.querySelectorAll("[data-site-name]").forEach(el => el.textContent = data.name || "");
    document.querySelectorAll("[data-site-location]").forEach(el => el.textContent = data.location || "");
    document.querySelectorAll("[data-site-address]").forEach(el => el.textContent = data.address || "");
    document.querySelectorAll("[data-site-phone]").forEach(el => {
      el.textContent = data.phone || "";
      el.href = `tel:${(data.phone || "").replace(/[^\d+]/g, "")}`;
    });
    document.querySelectorAll("[data-site-instagram]").forEach(el => el.href = data.instagram || "#");
    document.querySelectorAll("[data-site-telegram]").forEach(el => el.href = data.telegram || "#");
    document.querySelectorAll("[data-site-facebook]").forEach(el => el.href = data.facebook || "#");
    document.querySelectorAll("[data-site-tiktok]").forEach(el => el.href = data.tiktok || "#");
    if (data.primary_color) {
      document.documentElement.style.setProperty("--sage-dark", data.primary_color);
      document.documentElement.style.setProperty("--primary", data.primary_color);
    }
    if (data.accent_color) {
      document.documentElement.style.setProperty("--coral", data.accent_color);
      document.documentElement.style.setProperty("--accent", data.accent_color);
    }
  } catch (error) { console.error("Помилка site.json:", error); }
}

async function loadHome() {
  try {
    const data = await loadJSON("content/home.json");
    document.querySelectorAll("[data-home-title]").forEach(el => el.textContent = data.title || "");
    document.querySelectorAll("[data-home-subtitle]").forEach(el => el.textContent = data.subtitle || "");
    document.querySelectorAll("[data-home-description]").forEach(el => el.textContent = data.description || "");

    document.querySelectorAll("[data-home-button]").forEach(el => {
      el.textContent = data.button_text || "";
      el.href = data.button_link || "#";
    });
    const secondaryButton = document.querySelector("[data-home-secondary-button]");
    if (secondaryButton) {
      secondaryButton.textContent = `${data.secondary_button_text || "Переглянути послуги"} →`;
      secondaryButton.href = data.secondary_button_link || "#services";
    }
    if (data.hero_image) {
      const heroImage = document.querySelector(".hero-photo img");
      if (heroImage) heroImage.src = imagePath(data.hero_image);
    }

    const about = document.querySelector(".about");
    if (about) {
      const label = about.querySelector(".eyebrow");
      const title = about.querySelector("h2");
      if (label && data.about_label) label.textContent = data.about_label;
      if (title && data.about_title) title.textContent = data.about_title;
    }
    const services = document.querySelector("#services");
    if (services) {
      const label = services.querySelector(".section-heading .eyebrow");
      const title = services.querySelector("h2");
      const text = services.querySelector(".section-heading > p");
      if (label && data.services_label) label.textContent = data.services_label;
      if (title && data.services_title) title.textContent = data.services_title;
      if (text && data.services_text) text.textContent = data.services_text;
    }
    const gallery = document.querySelector("#gallery");
    if (gallery) {
      const label = gallery.querySelector(".section-heading .eyebrow");
      const title = gallery.querySelector("h2");
      if (label && data.gallery_label) label.textContent = data.gallery_label;
      if (title && data.gallery_title) title.textContent = data.gallery_title;
    }
    const reviews = document.querySelector("#reviews");
    if (reviews) {
      const label = reviews.querySelector(".eyebrow");
      const title = reviews.querySelector("h2");
      if (label && data.reviews_label) label.textContent = data.reviews_label;
      if (title && data.reviews_title) title.textContent = data.reviews_title;
    }
    const booking = document.querySelector("#booking");
    if (booking) {
      const label = booking.querySelector(".booking-intro .eyebrow");
      const title = booking.querySelector("h2");
      const text = booking.querySelector(".booking-intro > p:not(.note)");
      const note = booking.querySelector(".booking-intro > p.note");
      if (label && data.booking_label) label.textContent = data.booking_label;
      if (title && data.booking_title) title.textContent = data.booking_title;
      if (text && data.booking_text) text.textContent = data.booking_text;
      if (note && data.booking_note != null) note.textContent = data.booking_note;

      const form = booking.querySelector("#booking-form");
      if (form) {
        const fields = [
          ["pet_name", "form_pet_name_label", "form_pet_name_placeholder"],
          ["age", "form_age_label", "form_age_placeholder"],
          ["breed", "form_breed_label", "form_breed_placeholder"],
          ["owner_contact", "form_owner_label", "form_owner_placeholder"],
          ["last_grooming", "form_last_grooming_label", "form_last_grooming_placeholder"],
          ["preferred_time", "form_preferred_time_label", null],
          ["additional_services", "form_additional_label", "form_additional_placeholder"],
          ["comment", "form_comment_label", "form_comment_placeholder"]
        ];
        fields.forEach(([name, labelKey, placeholderKey]) => {
          const input = form.querySelector(`[name="${name}"]`);
          if (input) {
            setLabelText(input, data[labelKey]);
            if (placeholderKey) setInputPlaceholder(name, data[placeholderKey]);
          }
        });
        const fieldset = form.querySelector("fieldset.full");
        if (fieldset) {
          const legend = fieldset.querySelector("legend");
          if (legend && data.form_home_care_label) legend.textContent = data.form_home_care_label;
          const options = [data.form_home_care_option1, data.form_home_care_option2, data.form_home_care_option3];
          form.querySelectorAll('input[name="home_care"]').forEach((input, index) => {
            if (options[index]) {
              input.value = options[index];
              setLabelText(input, options[index]);
            }
          });
        }
        const submit = form.querySelector('button[type="submit"]');
        if (submit && data.form_submit) submit.textContent = data.form_submit;
      }
    }
    const contacts = document.querySelector("#contacts");
    if (contacts) {
      const label = contacts.querySelector(".eyebrow");
      const title = contacts.querySelector("h2");
      if (label && data.contacts_label) label.textContent = data.contacts_label;
      if (title && data.contacts_title) title.textContent = data.contacts_title;
    }
    const hours = document.querySelector("section[aria-labelledby=\"hours-title\"]");
    if (hours) {
      const label = hours.querySelector(".eyebrow");
      const title = hours.querySelector("h2");
      if (label && data.hours_label) label.textContent = data.hours_label;
      if (title && data.hours_title) title.textContent = data.hours_title;
    }
  } catch (error) { console.error("Помилка home.json:", error); }
}

async function loadAbout() {
  try {
    const data = await loadJSON("content/about.json");
    const section = document.querySelector(".about");
    if (!section) return;
    const title = section.querySelector("h2");
    const text = section.querySelector(".section-text");
    if (title && data.title) title.textContent = data.title;
    if (text && data.text) text.textContent = data.text;
    if (data.image) {
      let existing = section.querySelector(".about-image");
      if (!existing) {
        existing = document.createElement("img");
        existing.className = "about-image";
        existing.loading = "lazy";
        existing.alt = data.title || "Royal Pet";
        const intro = section.querySelector(".section-text");
        if (intro) intro.parentNode.insertBefore(existing, intro);
      }
      existing.src = imagePath(data.image);
    }
    if (Array.isArray(data.benefits)) {
      const benefits = section.querySelector(".benefits");
      if (benefits) {
        benefits.innerHTML = "";
        data.benefits.forEach((item, index) => {
          const article = document.createElement("article");
          article.innerHTML = `<div class="icon">${["✂", "♧", "♡"][index % 3]}</div><h3>${escapeHTML(item.title || "")}</h3><p>${escapeHTML(item.text || "")}</p>`;
          benefits.appendChild(article);
        });
      }
    }
  } catch (error) { console.error("Помилка about.json:", error); }
}

async function loadServices() {
  try {
    const data = await loadJSON("content/services.json");
    const container = document.querySelector("[data-services]");
    if (!container || !Array.isArray(data.items)) return;
    container.innerHTML = "";
    data.items.filter(item => item.active !== false).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)).forEach(item => {
      const card = document.createElement("article");
      card.className = "service-card";
      const image = imagePath(item.image);
      card.innerHTML = `${image ? `<div class="service-card-image"><img src="${escapeHTML(image)}" alt="${escapeHTML(item.title || "Послуга Royal Pet")}" loading="lazy"></div>` : ""}<div class="service-card-content"><div class="service-card-top"><h3>${escapeHTML(item.title || "")}</h3><strong>${escapeHTML(item.price || "")}</strong></div>${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}<div class="service-card-meta">${item.duration ? `<span class="service-duration">⏱️ ${escapeHTML(item.duration)}</span>` : ""}${item.category ? `<span class="service-category">${escapeHTML(item.category)}</span>` : ""}</div></div>`;
      container.appendChild(card);
    });
  } catch (error) { console.error("Помилка services.json:", error); }
}

async function loadPortfolio() {
  try {
    const data = await loadJSON("content/portfolio.json");
    const gallery = document.querySelector(".gallery");
    if (!gallery || !Array.isArray(data.items)) return;
    gallery.innerHTML = "";
    data.items.forEach(item => {
      if (item.image) {
        const card = document.createElement("div");
        card.className = "portfolio-card";
        const img = document.createElement("img");
        img.src = imagePath(item.image);
        img.alt = item.title || "Робота Royal Pet";
        img.loading = "lazy";
        card.appendChild(img);
        if (item.title) { const title = document.createElement("h3"); title.textContent = item.title; card.appendChild(title); }
        if (item.description) { const description = document.createElement("p"); description.textContent = item.description; card.appendChild(description); }
        gallery.appendChild(card);
      }
      if (item.video_url) {
        const link = document.createElement("a");
        link.href = item.video_url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.className = "portfolio-video"; link.textContent = item.title || "Переглянути відео"; gallery.appendChild(link);
      }
    });
  } catch (error) { console.error("Помилка portfolio.json:", error); }
}

async function loadReviews() {
  try {
    const data = await loadJSON("content/reviews.json");
    const container = document.querySelector("[data-reviews]");
    if (!container || !Array.isArray(data.items)) return;
    container.innerHTML = "";
    data.items.filter(item => !item.status || item.status === "published").forEach(item => {
      const card = document.createElement("article");
      card.className = "review-card";
      const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
      card.innerHTML = `<div class="review-stars">${"★".repeat(rating)}</div>${item.image ? `<img class="review-avatar" src="${escapeHTML(imagePath(item.image))}" alt="${escapeHTML(item.name || "Клієнт")}" loading="lazy">` : ""}<p>${escapeHTML(item.text || "")}</p><strong>${escapeHTML(item.name || "")}</strong>${item.date ? `<small class="review-date">${escapeHTML(item.date)}</small>` : ""}`;
      container.appendChild(card);
    });
  } catch (error) { console.error("Помилка reviews.json:", error); }
}

async function loadContacts() {
  try {
    const data = await loadJSON("content/contacts.json");
    const section = document.querySelector("#contacts");
    if (!section) return;
    const title = section.querySelector("h2");
    const text = section.querySelector("[data-contact-text]");
    if (title) title.textContent = data.title || "";
    if (text) text.textContent = data.text || "";
    const addressLabel = section.querySelector("[data-contact-address-label]");
    if (addressLabel) addressLabel.textContent = `${data.address_label || "Адреса"}:`;
    const hoursLabel = section.querySelector("[data-contact-hours-label]");
    if (hoursLabel) hoursLabel.textContent = `${data.hours_label || "Графік"}:`;
    const phoneLabel = section.querySelector("[data-contact-phone-label]");
    if (phoneLabel) phoneLabel.textContent = `${data.phone_label || "Телефон"}:`;
    const dayLabel = section.querySelector("[data-contact-hours-day]");
    if (dayLabel) dayLabel.textContent = "Понеділок:";
    const actions = section.querySelector(".contact-actions");
    const instagram = actions?.querySelector("[data-site-instagram]");
    const telegram = actions?.querySelector("[data-site-telegram]");
    if (instagram && data.instagram_text) instagram.textContent = data.instagram_text;
    if (telegram && data.telegram_text) telegram.textContent = data.telegram_text;

    let extras = section.querySelector(".contact-extra");
    if (!extras) {
      extras = document.createElement("div");
      extras.className = "contact-extra";
      const primaryPhone = section.querySelector("[data-site-phone]");
      if (primaryPhone?.parentElement) primaryPhone.parentElement.appendChild(extras);
    }
    extras.innerHTML = "";
    if (data.phone2) {
      const link = document.createElement("a");
      link.href = `tel:${data.phone2.replace(/[^\d+]/g, "")}`;
      link.textContent = `${data.phone_label || "Телефон"}: ${data.phone2}`;
      extras.appendChild(link);
    }
    if (data.email) {
      const link = document.createElement("a");
      link.href = `mailto:${data.email}`;
      link.textContent = `${data.email_label || "Email"}: ${data.email}`;
      extras.appendChild(link);
    }
  } catch (error) { console.error("Помилка contacts.json:", error); }
}

async function loadSocial() {
  try {
    const data = await loadJSON("content/social.json");
    ["instagram", "telegram", "facebook", "tiktok"].forEach(network => document.querySelectorAll(`[data-social-${network}]`).forEach(el => el.href = data[network] || "#"));
  } catch (error) { console.error("Помилка social.json:", error); }
}

async function loadHours() {
  try {
    const data = await loadJSON("content/hours.json");
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach(day => document.querySelectorAll(`[data-hours-${day}]`).forEach(el => el.textContent = data[day] || ""));
  } catch (error) { console.error("Помилка hours.json:", error); }
}

async function loadMenu() {
  try {
    const data = await loadJSON("content/menu.json");
    const nav = document.querySelector(".nav");
    if (!nav || !Array.isArray(data.items)) return;
    const items = data.items.filter(item => item.active !== false).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    if (!items.length) return;
    nav.innerHTML = items.map(item => `<a class="${item.url === "#booking" ? "button button-small" : ""}" href="${escapeHTML(item.url || "#")}">${escapeHTML(item.title || "")}</a>`).join("");
    initMenu();
  } catch (error) { console.error("Помилка menu.json:", error); }
}

async function loadFooter() {
  try {
    const data = await loadJSON("content/footer.json");
    const footer = document.querySelector("footer");
    if (!footer) return;
    const site = await loadJSON("content/site.json").catch(() => ({}));
    const name = site.name || "Royal Pet";
    footer.querySelectorAll("[data-site-name]").forEach(el => el.textContent = name);
    const text = footer.querySelector("[data-footer-text]");
    const description = footer.querySelector("[data-footer-description]");
    const copyright = footer.querySelector("[data-footer-copyright]");
    if (text) text.textContent = data.text || "";
    if (description) description.textContent = data.description || "";
    if (copyright) copyright.textContent = data.copyright || `© ${new Date().getFullYear()} ${name}. Усі права захищені.`;
  } catch (error) { console.error("Помилка footer.json:", error); }
}

async function loadSEO() {
  try {
    const data = await loadJSON("content/seo.json");
    if (data.title) document.title = data.title;
    if (data.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
      meta.content = data.description;
    }
    if (data.keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) { meta = document.createElement("meta"); meta.name = "keywords"; document.head.appendChild(meta); }
      meta.content = data.keywords;
    }
    if (data.image) {
      let meta = document.querySelector('meta[property="og:image"]');
      if (!meta) { meta = document.createElement("meta"); meta.setAttribute("property", "og:image"); document.head.appendChild(meta); }
      meta.content = imagePath(data.image);
    }
  } catch (error) { console.error("Помилка seo.json:", error); }
}

async function initBookingForm() {
  const form = document.getElementById("booking-form");
  const message = document.getElementById("form-message");
  if (!form) return;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    let labels = {};
    try { labels = await loadJSON("content/home.json"); } catch (_) {}
    if (button) { button.disabled = true; button.textContent = labels.form_sending || "Відправляємо…"; }
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("https://royal-pet-telegram.dolanhash1.workers.dev", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Помилка відправлення");
      if (message) message.textContent = labels.form_success || "✅ Дякуємо! Заявку отримано. Ми скоро зв’яжемося з вами.";
      form.reset();
    } catch (error) {
      console.error("Помилка заявки:", error);
      if (message) message.textContent = labels.form_error || "❌ Не вдалося відправити заявку. Спробуйте ще раз або зателефонуйте нам.";
    } finally {
      if (button) { button.disabled = false; button.textContent = labels.form_submit || "Надіслати заявку"; }
    }
  });
}

function initMenu() {
  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");
  if (!button || !nav || button.dataset.menuReady === "true") return;
  button.dataset.menuReady = "true";
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));
}

function initYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

async function init() {
  await Promise.all([loadSiteSettings(), loadHome(), loadAbout(), loadServices(), loadPortfolio(), loadReviews(), loadContacts(), loadSocial(), loadHours(), loadMenu(), loadFooter(), loadSEO()]);
  initBookingForm();
  initMenu();
  initYear();
}

document.addEventListener("DOMContentLoaded", init);