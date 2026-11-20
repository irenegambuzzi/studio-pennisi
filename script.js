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

  // Bottoni "Preferenze cookie": riaprono il banner
  document.querySelectorAll(".js-cookie-prefs").forEach((btn) => {
    btn.addEventListener("click", openCookieBanner);
  });

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Comparsa delle sezioni al passaggio (parte dopo l'intro, se c'è)
  function startReveal() {
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
  }

  runIntro(startReveal);

  // Effetti legati allo scroll: la Giustizia che si "stampa" e il percorso del primo appuntamento
  const areasSection = document.getElementById("areas");
  const stepsGrid = document.querySelector(".steps-grid");
  const stepCards = stepsGrid ? stepsGrid.querySelectorAll(".step-card") : [];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  let ticking = false;

  function updateScrollEffects() {
    ticking = false;
    const vh = window.innerHeight;

    if (areasSection) {
      const r = areasSection.getBoundingClientRect();
      // 0 quando la sezione entra dal basso, oltre 1 quando è ben dentro lo schermo
      const ink = clamp((vh * 0.95 - r.top) / (vh * 0.85), 0, 1.25);
      areasSection.style.setProperty("--ink", ink.toFixed(3));
    }

    if (stepsGrid) {
      const r = stepsGrid.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.25), 0, 1);
      stepsGrid.style.setProperty("--p", p.toFixed(3));
      const vertical = window.innerWidth <= 900;
      const size = vertical ? stepsGrid.offsetHeight : stepsGrid.offsetWidth;
      stepCards.forEach((card) => {
        const offset = vertical ? card.offsetTop : card.offsetLeft;
        card.classList.toggle("is-lit", p * size >= offset + 30);
      });
    }
  }

  function requestScrollEffects() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollEffects);
    }
  }

  function setupScrollEffects() {
    if (reduceMotionQuery.matches) {
      // Movimento ridotto: tutto già visibile e "acceso", nessun effetto allo scroll
      if (areasSection) areasSection.style.removeProperty("--ink");
      if (stepsGrid) stepsGrid.style.removeProperty("--p");
      stepCards.forEach((card) => card.classList.add("is-lit"));
      window.removeEventListener("scroll", requestScrollEffects);
      window.removeEventListener("resize", requestScrollEffects);
      return;
    }
    window.addEventListener("scroll", requestScrollEffects, { passive: true });
    window.addEventListener("resize", requestScrollEffects);
    updateScrollEffects();
  }

  setupScrollEffects();
  reduceMotionQuery.addEventListener("change", setupScrollEffects);

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
const CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // la scelta vale 1 anno (come dice la cookie policy)

function checkCookieConsent() {
  // Scaduto l'anno (o scelta salvata prima di questa regola) il banner si ripresenta
  const savedAt = Number(localStorage.getItem("cookie-consent-date"));
  if (!savedAt || Date.now() - savedAt > CONSENT_MAX_AGE) {
    localStorage.removeItem("cookie-consent");
  }
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
  const previous = localStorage.getItem("cookie-consent");
  localStorage.setItem("cookie-consent-date", String(Date.now()));

  if (choice === 'all') {
    localStorage.setItem("cookie-consent", "accepted");
    activateScripts();
    showToast("🍪 Cookie accettati. Grazie!");
  } else {
    localStorage.setItem("cookie-consent", "rejected");
    if (previous === "accepted") {
      // Consenso revocato: ricarico la pagina così Analytics e il widget non restano attivi
      window.location.reload();
      return;
    }
    showToast("🍪 Hai rifiutato i cookie non essenziali.");
  }
}

// Riapre il banner per cambiare scelta (link "Preferenze cookie")
function openCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;
  banner.style.display = "block";
  const first = banner.querySelector("button");
  if (first) first.focus();
}

function activateScripts() {
  // Attiva gli script bloccati: Analytics (analytics) e widget recensioni (thirdparty)
  const scripts = document.querySelectorAll('script[data-cookiecategory]');

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

  // Il widget recensioni è attivo: nasconde l'avviso al suo posto
  document.documentElement.classList.add("consent-all");
}

/* Intro con il logo */
function runIntro(done) {
  const html = document.documentElement;
  const overlay = document.querySelector(".intro-overlay");
  if (!html.classList.contains("intro") || !overlay) {
    if (overlay) overlay.remove();
    done();
    return;
  }

  let finished = false;
  const skipEvents = ["click", "keydown", "wheel", "touchstart"];

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    skipEvents.forEach((ev) => window.removeEventListener(ev, finish));
    try { sessionStorage.setItem("intro-seen", "1"); } catch (e) {}
    overlay.classList.add("is-leaving");
    done();
    setTimeout(() => {
      html.classList.remove("intro");
      overlay.remove();
    }, 900);
  }

  // Dura circa 2,3 secondi; un clic, un tasto o lo scroll la saltano
  const timer = setTimeout(finish, 2300);
  skipEvents.forEach((ev) => window.addEventListener(ev, finish, { passive: true }));
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
