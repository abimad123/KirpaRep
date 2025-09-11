const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll('.nav-dropdown .dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const parent = toggle.parentElement;
    parent.classList.toggle('open');
  });
});

const dropdownToggle = document.querySelector('.dropdown-toggle');

dropdownToggle.addEventListener('click', function () {
  this.classList.toggle('active');
});
