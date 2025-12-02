// script.js

// Smooth scroll for any element with [data-scroll-target]
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-scroll-target]");
  if (!trigger) return;

  const targetSelector = trigger.getAttribute("data-scroll-target");
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  event.preventDefault();
  const rect = target.getBoundingClientRect();
  const offset = window.scrollY + rect.top - 72; // account for sticky nav
  window.scrollTo({ top: offset, behavior: "smooth" });
});

// Intersection observer to animate .fade-up elements
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

// Auto-update dates:
// 1. Current year in footer and anywhere else with [data-year]
const currentYear = new Date().getFullYear();
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = currentYear;
});

// 2. "Updated today" style label using [data-date-today]
const today = new Date();
const todayFormatted = today.toLocaleDateString(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

document.querySelectorAll("[data-date-today]").forEach((el) => {
  el.textContent = todayFormatted;
});

// SUBMIT PAGE: simple fake-submit handling
const submitForm = document.querySelector("[data-submission-form]");
if (submitForm) {
  const msg = document.querySelector("[data-submission-message]");

  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!msg) return;

    msg.textContent =
      "Thank you for trusting us with your work. We'll read it with unreasonable care.";
    msg.style.opacity = "1";
    msg.style.transform = "translateY(0)";

    submitForm.reset();
  });
}
