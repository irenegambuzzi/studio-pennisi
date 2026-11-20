document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const subject =
        document.getElementById("subject").value.trim() ||
        "Richiesta di informazioni - Sito Web";
      const message = document.getElementById("message").value.trim();
      const privacyChecked = document.getElementById("privacy").checked;

      // Validazioni
      if (!name || !email || !phone || !message) {
        showToast("⚠️ Compila tutti i campi obbligatori.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("📧 Inserisci un indirizzo email valido.");
        return;
      }

      if (!privacyChecked) {
        showToast("🔒 Devi accettare la privacy policy.");
        return;
      }

      // Corpo email codificato
      const body = encodeURIComponent(
        `Nome: ${name}\nEmail: ${email}\nTelefono: ${phone}\n\nMessaggio:\n${message}`
      );

      // Invia con mailto
      window.location.href = `mailto:avvocato@studiolegalepennisi.com?subject=${encodeURIComponent(
        subject
      )}&body=${body}`;

      // Reset form e feedback
      form.reset();
      showToast("✅ Grazie! Si aprirà il tuo client email per completare l’invio.");
    });
  }

  // Mostra banner cookie se non accettato
  checkCookieConsent();

  // Anno corrente nel footer (nell'HTML resta 2026 come fallback)
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menù mobile (hamburger)
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("site-nav");

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Chiudi il menù" : "Apri il menù");
    navMenu.classList.toggle("is-open", open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("is-open") &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        setMenu(false);
      }
    });

    window.matchMedia("(min-width: 1101px)").addEventListener("change", (e) => {
      if (e.matches) setMenu(false);
    });
  }

  // Ombra leggera sotto l'header quando la pagina scorre
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Comparsa delle sezioni al passaggio
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Scorrimento alle sezioni (senza animazione se l'utente la riduce)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
      // Porta il focus della tastiera sulla sezione raggiunta
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
});

/* Cookie functions */
function checkCookieConsent() {
  const consent = localStorage.getItem("cookie-consent");
  if (consent === "accepted") {
    activateScripts();
  } else if (consent === "rejected") {
    // Non facciamo nulla, gli script restano bloccati
  } else {
    // Nessuna scelta effettuata, mostra banner
    const banner = document.getElementById("cookieBanner");
    if (banner) banner.style.display = "block";
  }
}

function handleCookies(choice) {
  const banner = document.getElementById("cookieBanner");
  if (banner) banner.style.display = "none";

  if (choice === 'all') {
    localStorage.setItem("cookie-consent", "accepted");
    activateScripts();
    showToast("🍪 Cookie accettati. Grazie!");
  } else {
    localStorage.setItem("cookie-consent", "rejected");
    showToast("🍪 Hai rifiutato i cookie non essenziali.");
  }
}

function activateScripts() {
  // Trova tutti gli script con data-cookiecategory="analytics" e li attiva
  const scripts = document.querySelectorAll('script[data-cookiecategory="analytics"]');

  scripts.forEach(script => {
    // Crea un nuovo elemento script
    const newScript = document.createElement('script');

    // Copia gli attributi (tranne type che diventa default JS)
    if (script.src) newScript.src = script.src;
    if (script.innerHTML) newScript.innerHTML = script.innerHTML;
    newScript.async = true;

    // Sostituisce il vecchio script o lo appende
    script.parentNode.insertBefore(newScript, script);
    script.remove(); // Rimuove il placeholder
  });
}

/* Toast */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
