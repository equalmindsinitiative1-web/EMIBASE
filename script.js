// ===== Equal Minds Initiative — site script =====

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ----- Mobile menu -----
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  toggle.classList.toggle("open", isOpen);
  toggle.setAttribute("aria-expanded", isOpen);
});

// Close the menu after tapping a link
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  })
);

// Header shadow on scroll
const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
});

// ----- Scroll reveal animation -----
const revealEls = document.querySelectorAll(".card, .two-col, .stat, .donate-box, .form");
revealEls.forEach((el) => el.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// ----- Animated impact counters -----
function animateCount(el) {
  const target = Number(el.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString() + (progress === 1 ? "+" : "");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat-num").forEach((el) => counterObserver.observe(el));

// ----- Donation picker -----
const amountBtns = document.querySelectorAll(".amount");
const customAmount = document.getElementById("customAmount");
const donateBtn = document.getElementById("donateBtn");
const donateImpact = document.getElementById("donateImpact");
let selectedAmount = 25;

const impactText = {
  10: "$10 buys notebooks and pencils for a student.",
  25: "$25 provides a full school supply kit for one student.",
  50: "$50 funds a month of weekly tutoring materials.",
  100: "$100 sponsors a student's supplies for the whole school year.",
};

function setAmount(amount) {
  selectedAmount = amount;
  donateBtn.textContent = amount > 0 ? `Donate $${amount}` : "Donate";
  donateImpact.textContent =
    impactText[amount] || "Every dollar goes directly toward helping a student learn.";
}

amountBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    amountBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    customAmount.value = "";
    setAmount(Number(btn.dataset.amount));
  })
);

customAmount.addEventListener("input", () => {
  amountBtns.forEach((b) => b.classList.remove("active"));
  setAmount(Math.max(0, Math.floor(Number(customAmount.value))));
});

donateBtn.addEventListener("click", () => {
  if (!selectedAmount) {
    alert("Please choose or enter a donation amount.");
    return;
  }
  // TODO: replace with your real donation link, e.g.
  // window.location.href = `https://your-donation-page.com?amount=${selectedAmount}`;
  alert(`Thank you for choosing to give $${selectedAmount} to Equal Minds Initiative! 💛`);
});

// ----- "Get involved" links pre-fill the contact form -----
const interestSelect = document.getElementById("interest");
document.querySelectorAll("[data-interest]").forEach((link) =>
  link.addEventListener("click", () => {
    interestSelect.value = link.dataset.interest;
  })
);

// ----- Contact form validation -----
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll("[required]").forEach((field) => {
    const ok = field.value.trim() !== "" && field.checkValidity();
    field.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    statusEl.textContent = "Please fill in all fields with a valid email.";
    statusEl.className = "form-status error";
    return;
  }

  // TODO: send the data somewhere (Formspree, Google Forms, your own backend, etc.)
  const name = form.name.value.trim().split(" ")[0];
  statusEl.textContent = `Thanks, ${name}! We'll be in touch soon.`;
  statusEl.className = "form-status success";
  form.reset();
});
