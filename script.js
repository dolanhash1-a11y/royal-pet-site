const button = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
button.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('booking-form').addEventListener('submit', event => {
  event.preventDefault();
  document.getElementById('form-message').textContent = 'Дякуємо! Ми отримали вашу заявку та скоро зв’яжемося з вами.';
  event.currentTarget.reset();
});
