/**
 * script.js — Atharv Ausarkar Portfolio
 * Features: smooth scroll, active nav link, mobile menu, back-to-top,
 *           safe fade-in, copy email, print styles.
 */

(function () {
  "use strict";

  /* -------------------- CONFIG -------------------- */
  const CONFIG = {
    headerHeight: 70,
    activeClass: "active-link",
    backToTopThreshold: 300,
    fadeThreshold: 0.12
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -------------------- DOM -------------------- */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll("section[id]");
  const toggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navlinks");
  const navRoot = document.querySelector(".navbar");

  /* -------------------- UTILS -------------------- */
  const getScrollY = () =>
    window.pageYOffset || document.documentElement.scrollTop;

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /* -------------------- SMOOTH SCROLL -------------------- */
  function smoothScrollToElement(el) {
    if (!el) return;
    const y = el.getBoundingClientRect().top + getScrollY() - CONFIG.headerHeight;
    window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (href === "#" || href === "resume.pdf") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      smoothScrollToElement(target);
      history.pushState(null, "", href);
      if (navMenu) navMenu.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("load", () => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => smoothScrollToElement(el), 100);
    }
  });

  /* -------------------- ACTIVE NAV LINK -------------------- */
  if (typeof window.IntersectionObserver === "function") {
    const navObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navLinks.forEach(l => l.classList.remove(CONFIG.activeClass));
          const active = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (active) active.classList.add(CONFIG.activeClass);
        });
      },
      {
        rootMargin: `-${CONFIG.headerHeight}px 0px -40% 0px`,
        threshold: 0
      }
    );
    sections.forEach(s => navObserver.observe(s));
  }

  /* -------------------- MOBILE MENU -------------------- */
  if (toggle && navMenu) {
    toggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", e => {
      if (!navMenu.classList.contains("open")) return;
      if (navRoot && navRoot.contains(e.target)) return;
      navMenu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* -------------------- SAFE FADE-IN ON SCROLL -------------------- */
  if (!prefersReducedMotion && typeof window.IntersectionObserver === "function") {
    const fadeTargets = document.querySelectorAll(
      "section > .card, section > .project, section > .cert-card, section > .skill-groups > div, .achievements li"
    );

    fadeTargets.forEach(el => el.classList.add("fade-init"));

    const fadeObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("fade-in");
          obs.unobserve(entry.target);
        });
      },
      { threshold: CONFIG.fadeThreshold, rootMargin: "0px 0px -40px 0px" }
    );

    fadeTargets.forEach(el => fadeObserver.observe(el));
  }

  /* -------------------- COPY EMAIL -------------------- */
  (function setupCopyEmail() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    if (!emailLinks.length) return;

    emailLinks.forEach(link => {
      link.addEventListener("click", () => {
        const email = link.getAttribute("href").replace("mailto:", "").split("?")[0];
        if (!navigator.clipboard || !email) return;

        navigator.clipboard.writeText(email).then(() => {
          showToast("Email copied: " + email);
        }).catch(() => {});
      });
    });

    function showToast(msg) {
      const existing = document.getElementById("toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.id = "toast";
      toast.textContent = msg;
      toast.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #111827;
        color: #fff;
        padding: .65rem 1.1rem;
        border-radius: 8px;
        font-size: .9rem;
        opacity: 0;
        transition: opacity .2s ease, transform .2s ease;
        z-index: 9999;
        pointer-events: none;
        max-width: 90vw;
        text-align: center;
      `;
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => toast.remove(), 250);
      }, 2000);
    }
  })();

  /* -------------------- BACK-TO-TOP -------------------- */
  (function createBackToTop() {
    const btn = document.createElement("button");
    btn.innerHTML = "↑";
    btn.setAttribute("aria-label", "Back to top");
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #2563eb;
      color: #fff;
      border: none;
      font-size: 1.3rem;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      pointer-events: none;
      transition: opacity .25s ease, transform .2s ease;
      z-index: 99;
    `;
    btn.onmouseenter = () => (btn.style.transform = "translateY(-2px)");
    btn.onmouseleave = () => (btn.style.transform = "translateY(0)");
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
    );
    document.body.appendChild(btn);

    const onScroll = () => {
      const show = getScrollY() > CONFIG.backToTopThreshold;
      btn.style.opacity = show ? "1" : "0";
      btn.style.pointerEvents = show ? "auto" : "none";
    };
    window.addEventListener("scroll", debounce(onScroll, 80), { passive: true });
    onScroll();
  })();

  /* -------------------- PRINT STYLESHEET -------------------- */
  (function injectPrintStyles() {
    const css = `
      @media print {
        .navbar, .nav-toggle, .nav-links, footer .no-print,
        button[aria-label="Back to top"], #toast {
          display: none !important;
        }
        body {
          background: #fff !important;
          color: #000 !important;
          font-size: 11pt;
          line-height: 1.4;
        }
        section {
          padding: 0.5rem 0 !important;
          max-width: 100% !important;
          page-break-inside: avoid;
        }
        h1 { font-size: 20pt !important; }
        h2 { font-size: 14pt !important; margin-bottom: .5rem !important; }
        h3 { font-size: 11pt !important; }
        a { color: #000 !important; text-decoration: underline; }
        a[href^="http"]::after {
          content: " (" attr(href) ")";
          font-size: 9pt;
          color: #555;
        }
        .card, .project, .cert-card {
          border: 1px solid #ccc !important;
          box-shadow: none !important;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .skill-groups { grid-template-columns: repeat(3, 1fr) !important; }
        .skill-groups li {
          background: #f0f0f0 !important;
          border: 1px solid #ddd;
        }
        .hero-cta .btn { display: none !important; }
        .hero-cta a[href="resume.pdf"] { display: none !important; }
        .fade-init { opacity: 1 !important; transform: none !important; }
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  })();

  /* -------------------- YEAR IN FOOTER -------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
