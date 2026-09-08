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
// BOOKING FORM
<form
        id="booking-form"
        class="booking-form">

        <label>

          🐶 Ім’я улюбленця

          <input
            name="pet_name"
            required
            placeholder="Наприклад, Боня">

        </label>


        <label>

          🎂 Вік улюбленця

          <input
            name="age"
            required
            placeholder="Наприклад, 3 роки">

        </label>


        <label>

          Порода та розмір

          <input
            name="breed"
            placeholder="Наприклад, шпіц, малий">

        </label>


        <label>

          📲 Ім’я та номер телефону власника

          <input
            name="owner_contact"
            required
            placeholder="Олена, +380…">

        </label>


        <label>

          ✂️ Коли востаннє були на грумінгу?

          <input
            name="last_grooming"
            required
            placeholder="Наприклад, 2 місяці тому">

        </label>


        <label>

          Бажана дата й час

          <input
            type="datetime-local"
            name="preferred_time">

        </label>


        <label class="full">

          💬 Які додаткові послуги бажаєте додати?

          <textarea
            name="additional_services"
            rows="3"
            placeholder="Наприклад, чистка зубів, креативна стрижка"></textarea>

        </label>


        <fieldset class="full">

          <legend>
            🧴 Домашній догляд
          </legend>

          <label>

            <input
              type="radio"
              name="home_care"
              value="Хочу придбати домашній догляд"
              required>

            Хочу придбати домашній догляд

          </label>


          <label>

            <input
              type="radio"
              name="home_care"
              value="Вже маю свою косметику">

            Вже маю свою косметику

          </label>


          <label>

            <input
              type="radio"
              name="home_care"
              value="Поки не цікавить">

            Поки не цікавить

          </label>

        </fieldset>


        <label class="full">

          Коментар або особливості улюбленця

          <textarea
            name="comment"
            rows="3"
            placeholder="Побажання та особливості…"></textarea>

        </label>


        <button
          class="button full"
          type="submit">

          Надіслати заявку

        </button>


        <p
          class="form-message full"
          id="form-message"
          aria-live="polite">
        </p>

      </form>

    </section>


    <!-- =========================
         CONTACTS
    ========================== -->

    <section
      class="section contact"
      id="contacts"
      aria-labelledby="contacts-title">

      <div>

        <p class="eyebrow">
          Контакти
        </p>

        <h2 id="contacts-title">
          Завітайте до нас
        </h2>


        <p data-contact-text>
          Зв’яжіться з нами, щоб записати
          улюбленця на грумінг.
        </p>


        <p>

          <span data-site-address>
            м. Київ, вул. Прикладна, 10
          </span>

          <br>

          <span>
            Понеділок:
          </span>

          <span data-hours-monday>
            09:00–19:00
          </span>

        </p>


        <a
          data-site-phone
          href="tel:+380000000000">

          +38 (000) 000-00-00

        </a>

      </div>


      <div class="contact-actions">

        <a
          class="button"
          data-site-instagram
          href="#"
          target="_blank"
          rel="noreferrer">

          Написати в Instagram

        </a>


        <a
          class="outline-button"
          data-site-telegram
          href="#"
          target="_blank"
          rel="noreferrer">

          Написати в Telegram

        </a>

      </div>

    </section>


    <!-- =========================
         WORKING HOURS
    ========================== -->

    <section
      class="section"
      aria-labelledby="hours-title">

      <div class="section-heading">

        <div>

          <p class="eyebrow">
            Графік роботи
          </p>

          <h2 id="hours-title">
            Коли ми працюємо
          </h2>

        </div>

      </div>


      <div class="benefits">

        <article>
          <h3>Понеділок</h3>
          <p data-hours-monday>09:00–19:00</p>
        </article>

        <article>
          <h3>Вівторок</h3>
          <p data-hours-tuesday>09:00–19:00</p>
        </article>

        <article>
          <h3>Середа</h3>
          <p data-hours-wednesday>09:00–19:00</p>
        </article>

        <article>
          <h3>Четвер</h3>
          <p data-hours-thursday>09:00–19:00</p>
        </article>

        <article>
          <h3>П’ятниця</h3>
          <p data-hours-friday>09:00–19:00</p>
        </article>

        <article>
          <h3>Субота</h3>
          <p data-hours-saturday>10:00–18:00</p>
        </article>

        <article>
          <h3>Неділя</h3>
          <p data-hours-sunday>Вихідний</p>
        </article>

      </div>

    </section>

  </main>


  <!-- =========================
       FOOTER
  ========================== -->

  <footer>

    <a class="logo" href="#home">

      <span>✦</span>

      <span data-site-name>
        Royal Pet
      </span>

    </a>


    <p>
      Догляд, який ваш улюбленець відчує.
    </p>


    <p>

      ©️

      <span id="year"></span>

      <span data-site-name>
        Royal Pet
      </span>

    </p>

  </footer>


  <script src="script.js"></script>

</body>
</html>
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
