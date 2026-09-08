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

    // Назва
    document.querySelectorAll("[data-site-name]").forEach(el => {
      el.textContent = data.name || "";
    });

    // Місто / підзаголовок
    document.querySelectorAll("[data-site-location]").forEach(el => {
      el.textContent = data.location || "";
    });

    // Телефон
    document.querySelectorAll("[data-site-phone]").forEach(el => {
      el.textContent = data.phone || "";
      el.href = `tel:${(data.phone || "").replace(/[^\d+]/g, "")}`;
    });

    // Адреса
    document.querySelectorAll("[data-site-address]").forEach(el => {
      el.textContent = data.address || "";
    });

    // Instagram
    document.querySelectorAll("[data-site-instagram]").forEach(el => {
      el.href = data.instagram || "#";
    });

    // Telegram
    document.querySelectorAll("[data-site-telegram]").forEach(el => {
      el.href = data.telegram || "#";
    });

    // Кольори
    if (data.primary_color) {
      document.documentElement.style.setProperty(
        "--primary",
        data.primary_color
      );
    }

    if (data.accent_color) {
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

  await loadPortfolio();

  initMenu();

  initBookingForm();

  initYear();

}

initSite();
