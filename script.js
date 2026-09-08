// ===============================
// ROYAL PET — SITE CONTENT
// ===============================

const CONTENT_VERSION = Date.now();

async function loadJSON(file) {
  const response = await fetch(`${file}?v=${CONTENT_VERSION}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Не вдалося завантажити ${file}`);
  }

  return response.json();
}

// ===============================
// SETTINGS
// ===============================

async function loadSiteSettings() {
  try {
    const data = await loadJSON("content/site.json");

    document.title = `${data.name || "Royal Pet"} — грумінг-студія`;

    document.querySelectorAll("[data-site-name]").forEach(el => {
      el.textContent = data.name || "";
    });

    document.querySelectorAll("[data-site-location]").forEach(el => {
      el.textContent = data.location || "";
    });

    document.querySelectorAll("[data-site-phone]").forEach(el => {
      el.textContent = data.phone || "";
      el.href = `tel:${(data.phone || "").replace(/[^\d+]/g, "")}`;
    });

    document.querySelectorAll("[data-site-address]").forEach(el => {
      el.textContent = data.address || "";
    });

    document.querySelectorAll("[data-site-instagram]").forEach(el => {
      el.href = data.instagram || "#";
    });

    document.querySelectorAll("[data-site-telegram]").forEach(el => {
      el.href = data.telegram || "#";
    });

    if (data.primary_color) {
      document.documentElement.style.setProperty(
        "--sage-dark",
        data.primary_color
      );

      document.documentElement.style.setProperty(
        "--primary",
        data.primary_color
      );
    }

    if (data.accent_color) {
      document.documentElement.style.setProperty(
        "--coral",
        data.accent_color
      );

      document.documentElement.style.setProperty(
        "--accent",
        data.accent_color
      );
    }

  } catch (error) {
    console.error("Помилка site.json:", error);
  }
}

// ===============================
// HOME
// ===============================

async function loadHome() {
  try {
    const data = await loadJSON("content/home.json");

    document.querySelectorAll("[data-home-title]").forEach(el => {
      el.textContent = data.title || "";
    });

    document.querySelectorAll("[data-home-subtitle]").forEach(el => {
      el.textContent = data.subtitle || "";
    });

    document.querySelectorAll("[data-home-description]").forEach(el => {
      el.textContent = data.description || "";
    });

    document.querySelectorAll("[data-home-button]").forEach(el => {
      el.textContent = data.button_text || "";
      el.href = data.button_link || "#";
    });

  } catch (error) {
    console.error("Помилка home.json:", error);
  }
}

// ===============================
// SERVICES
// ===============================

async function loadServices() {
  try {
    const data = await loadJSON("content/services.json");

    const container = document.querySelector("[data-services]");

    if (!container || !data.items) return;

    container.innerHTML = "";

    data.items.forEach(item => {

      const card = document.createElement("article");
      card.className = "service-card";

      card.innerHTML = `
        <div class="service-card-top">
          <h3>${escapeHTML(item.title || "")}</h3>
          <strong>${escapeHTML(item.price || "")}</strong>
        </div>

        ${
          item.description
            ? `<p>${escapeHTML(item.description)}</p>`
            : ""
        }
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Помилка services.json:", error);
  }
}

// ===============================
// PORTFOLIO
// ===============================

async function loadPortfolio() {
  try {
    const data = await loadJSON("content/portfolio.json");

    const gallery = document.querySelector(".gallery");

    if (!gallery || !data.items) return;

    gallery.innerHTML = "";

    data.items.forEach(item => {

      if (item.image) {
        const img = document.createElement("img");

        img.src = item.image;
        img.alt = item.title || "Робота Royal Pet";
        img.loading = "lazy";

        gallery.appendChild(img);
      }

      if (item.video_url) {
        const link = document.createElement("a");

        link.href = item.video_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "portfolio-video";

        link.textContent = item.title || "Переглянути відео";

        gallery.appendChild(link);
      }

    });

  } catch (error) {
    console.error("Помилка portfolio.json:", error);
  }
}

// ===============================
// REVIEWS
// ===============================

async function loadReviews() {
  try {
    const data = await loadJSON("content/reviews.json");

    const container = document.querySelector("[data-reviews]");

    if (!container || !data.items) return;

    container.innerHTML = "";

    data.items.forEach(item => {

      const card = document.createElement("article");
      card.className = "review-card";

      const rating = Math.max(
        1,
        Math.min(5, Number(item.rating) || 5)
      );

      card.innerHTML = `
        <div class="review-stars">
          ${"★".repeat(rating)}
        </div>

        <p>${escapeHTML(item.text || "")}</p>

        <strong>${escapeHTML(item.name || "")}</strong>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Помилка reviews.json:", error);
  }
}

// ===============================
// HOURS
// ===============================

async function loadHours() {
  try {
    const data = await loadJSON("content/hours.json");

    document.querySelectorAll("[data-hours-monday]").forEach(el => {
      el.textContent = data.monday || "";
    });

    document.querySelectorAll("[data-hours-tuesday]").forEach(el => {
      el.textContent = data.tuesday || "";
    });

    document.querySelectorAll("[data-hours-wednesday]").forEach(el => {
      el.textContent = data.wednesday || "";
    });

    document.querySelectorAll("[data-hours-thursday]").forEach(el => {
      el.textContent = data.thursday || "";
    });

    document.querySelectorAll("[data-hours-friday]").forEach(el => {
      el.textContent = data.friday || "";
    });

    document.querySelectorAll("[data-hours-saturday]").forEach(el => {
      el.textContent = data.saturday || "";
    });

    document.querySelectorAll("[data-hours-sunday]").forEach(el => {
      el.textContent = data.sunday || "";
    });

  } catch (error) {
    console.error("Помилка hours.json:", error);
  }
}

// ===============================
// HTML SAFETY
// ===============================

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===============================
// MOBILE MENU
// ===============================

function initMenu() {

  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");

  if (!button || !nav) return;

  button.addEventListener("click", () => {

    const open = nav.classList.toggle("open");

    button.setAttribute(
      "aria-expanded",
      open
    );

  });

  document.querySelectorAll(".nav a").forEach(link => {

    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });

  });
}

// ===============================
// BOOKING FORM
// ===============================

function initBookingForm() {

  const form = document.getElementById("booking-form");
  const message = document.getElementById("form-message");

  if (!form) return;

  form.addEventListener("submit", event => {

    event.preventDefault();

    if (message) {
      message.textContent =
        "Дякуємо! Ми отримали вашу заявку та скоро зв’яжемося з вами.";
    }

    form.reset();

  });

}

// ===============================
// YEAR
// ===============================

function initYear() {

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

}

// ===============================
// START
// ===============================

async function initSite() {

  await loadSiteSettings();

  await loadHome();

  await loadServices();

  await loadPortfolio();

  await loadReviews();

  await loadHours();

  initMenu();

  initBookingForm();

  initYear();

}

initSite();
