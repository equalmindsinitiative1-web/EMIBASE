// ===== Equal Minds Initiative — site script =====
// Security notes:
//  - All code is wrapped in a function so nothing leaks into the global scope.
//  - User input is only ever written with .textContent (never .innerHTML), so it can't inject HTML/scripts.
//  - The contact form validates + length-limits input, has a hidden spam trap, and a cooldown against spamming.
//  - Donations only ever redirect to the one trusted payment URL you set below.

(function () {
  "use strict";

  // ===== SETTINGS — edit these =====
  // Your real donation page (must start with https://). Leave "" until you have one.
  const DONATION_URL = "";
  const MAX_DONATION = 10000;
  const FORM_COOLDOWN_MS = 30 * 1000; // wait 30s between form submissions

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ----- Mobile menu -----
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  }

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  window.addEventListener(
    "scroll",
    () => header && header.classList.toggle("scrolled", window.scrollY > 10),
    { passive: true }
  );

  // ----- Scroll reveal animation -----
 // ----- Scroll reveal animation -----
const revealEls = document.querySelectorAll(
  "main .section .container > *, .cards > *, .stats > *"
);

if ("IntersectionObserver" in window) {
  revealEls.forEach((el, index) => {
    el.classList.add("reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}
  // ----- Animated impact counters -----
  function animateCount(el) {
    const target = Number.parseInt(el.dataset.target, 10);
    if (!Number.isFinite(target) || target < 0) return;
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target).toLocaleString() + (progress === 1 ? "+" : "");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statEls = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
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
    statEls.forEach((el) => counterObserver.observe(el));
  } else {
    statEls.forEach(animateCount);
  }

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

  // Only accept whole numbers between 1 and MAX_DONATION
  function cleanAmount(value) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.min(n, MAX_DONATION);
  }

  function setAmount(amount) {
    selectedAmount = cleanAmount(amount);
    donateBtn.textContent = selectedAmount ? `Donate $${selectedAmount}` : "Donate";
    donateImpact.textContent =
      impactText[selectedAmount] || "Every dollar goes directly toward helping a student learn.";
  }

  amountBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      amountBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      customAmount.value = "";
      setAmount(btn.dataset.amount);
    })
  );

  customAmount.addEventListener("input", () => {
    amountBtns.forEach((b) => b.classList.remove("active"));
    if (Number(customAmount.value) > MAX_DONATION) customAmount.value = String(MAX_DONATION);
    setAmount(customAmount.value);
  });

  donateBtn.addEventListener("click", () => {
    if (!selectedAmount) {
      alert("Please choose or enter a donation amount.");
      return;
    }
    // Only ever send people to your one trusted, HTTPS payment page.
    // Never collect card numbers on this site yourself — let PayPal/Stripe/etc. handle it.
    if (DONATION_URL.startsWith("https://")) {
      const url = new URL(DONATION_URL);
      url.searchParams.set("amount", String(selectedAmount));
      window.location.assign(url.toString());
    } else {
      alert(`Thank you for choosing to give $${selectedAmount} to Equal Minds Initiative! Online donations are coming soon.`);
    }
  });

  // ----- "Get involved" links pre-fill the contact form -----
  const interestSelect = document.getElementById("interest");
  const allowedInterests = Array.from(interestSelect.options).map((o) => o.value);
  document.querySelectorAll("[data-interest]").forEach((link) =>
    link.addEventListener("click", () => {
      // Only accept values that are actually in the dropdown
      if (allowedInterests.includes(link.dataset.interest)) interestSelect.value = link.dataset.interest;
    })
  );

  // ----- Contact form: validation + spam protection -----
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
  let lastSubmit = 0;

  const rules = {
    name: (v) => v.length >= 2 && v.length <= 100 && !/[<>]/.test(v),
    email: (v) => v.length <= 254 && EMAIL_RE.test(v),
    message: (v) => v.length >= 10 && v.length <= 2000,
  };

  function showStatus(text, type) {
    statusEl.textContent = text; // textContent = safe, never renders HTML
    statusEl.className = `form-status ${type}`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Spam trap: real people never see this field, bots fill it in.
    if (form.website && form.website.value) {
      showStatus("Thanks! We'll be in touch soon.", "success");
      form.reset();
      return;
    }

    // Cooldown so the form can't be spammed
    const now = Date.now();
    if (now - lastSubmit < FORM_COOLDOWN_MS) {
      showStatus("Please wait a moment before sending another message.", "error");
      return;
    }

    let valid = true;
    const data = {};
    Object.keys(rules).forEach((field) => {
      const input = form.elements[field];
      const value = input.value.trim();
      const ok = rules[field](value);
      input.classList.toggle("invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) valid = false;
      data[field] = value;
    });
    data.interest = allowedInterests.includes(interestSelect.value) ? interestSelect.value : "General question";

    if (!valid) {
      showStatus("Please enter your name, a valid email, and a message (at least 10 characters).", "error");
      return;
    }

   lastSubmit = now;

try {
  const response = await fetch("https://formspree.io/f/xjywdgay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Submission failed");
  }

  const firstName = data.name.split(/\s+/)[0];

  showStatus(
    `Thanks, ${firstName}! We'll be in touch soon.`,
    "success"
  );

  form.reset();

} catch (error) {
  showStatus(
    "Unable to send your message. Please try again.",
    "error"
  );
  });
})();
