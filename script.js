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
  const card = document.createElement("div");
  card.className = "portfolio-card";

  const img = document.createElement("img");
  img.src = item.image.startsWith("/uploads/")
  ? "." + item.image
  : item.image;
  img.alt = item.title || "Робота Royal Pet";
  img.loading = "lazy";

  card.appendChild(img);

  if (item.title) {
    const title = document.createElement("h3");
    title.textContent = item.title;
    card.appendChild(title);
  }

  if (item.description) {
    const description = document.createElement("p");
    description.textContent = item.description;
    card.appendChild(description);
  }

  gallery.appendChild(card);
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
// CONTACTS
// ===============================

async function loadContacts() {
  try {
    const data = await loadJSON("content/contacts.json");

    document.querySelectorAll("[data-contact-title]").forEach(el => {
      el.textContent = data.title || "";
    });

    document.querySelectorAll("[data-contact-text]").forEach(el => {
      el.textContent = data.text || "";
    });

    document.querySelectorAll("[data-contact-phone2]").forEach(el => {
      if (data.phone2) {
        el.textContent = data.phone2;
        el.href = `tel:${data.phone2.replace(/[^\d+]/g, "")}`;
      } else {
        el.style.display = "none";
      }
    });

    document.querySelectorAll("[data-contact-email]").forEach(el => {
      if (data.email) {
        el.textContent = data.email;
        el.href = `mailto:${data.email}`;
      } else {
        el.style.display = "none";
      }
    });

  } catch (error) {
    console.error("Помилка contacts.json:", error);
  }
}


// ===============================
// SOCIAL NETWORKS
// ===============================

async function loadSocial() {
  try {
    const data = await loadJSON("content/social.json");

    document.querySelectorAll("[data-social-instagram]").forEach(el => {
      el.href = data.instagram || "#";
    });

    document.querySelectorAll("[data-social-telegram]").forEach(el => {
      el.href = data.telegram || "#";
    });

    document.querySelectorAll("[data-social-facebook]").forEach(el => {
      el.href = data.facebook || "#";
    });

    document.querySelectorAll("[data-social-tiktok]").forEach(el => {
      el.href = data.tiktok || "#";
    });

  } catch (error) {
    console.error("Помилка social.json:", error);
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

// BOOKING FORM
async function initBookingForm() {
  const form = document.getElementById("booking-form");
  const message = document.getElementById("form-message");

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Відправляємо...";
    }

    const formData = new FormData(form);

    const data = {
      pet_name: formData.get("pet_name") || "",
      age: formData.get("age") || "",
      breed: formData.get("breed") || "",
      owner_contact: formData.get("owner_contact") || "",
      last_grooming: formData.get("last_grooming") || "",
      preferred_date: formData.get("preferred_date") || "",
      comment: formData.get("comment") || ""
    };

    try {
      const response = await fetch(
        "https://royal-pet-telegram.YOUR-SUBDOMAIN.workers.dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Помилка відправлення");
      }

      if (message) {
        message.textContent =
          "✅ Дякуємо! Заявку отримано. Ми скоро зв’яжемося з вами.";
      }

      form.reset();

    } catch (error) {
      console.error(error);

      if (message) {
        message.textContent =
          "❌ Не вдалося відправити заявку. Спробуйте ще раз або зателефонуйте нам.";
      }

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Записатися";
      }
    }
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

  await loadContacts();

  await loadSocial();

  await loadHours();

  initMenu();

  initBookingForm();

  initYear();

}

initSite();
