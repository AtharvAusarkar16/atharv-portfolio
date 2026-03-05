/**
 * script.js — Enhanced Professional Portfolio
 * Features: particle network, typing animation, scroll spy, reveal effects, back‑to‑top.
 */

(function() {
    "use strict";

    /* -------------------- CONFIG -------------------- */

    const CONFIG = {
        headerHeight: 70,
        activeClass: "active-link",
        revealThreshold: 0.2,
        particleCount: 80,
        particleColor: "#3b82f6",
        lineColor: "#2563eb",
        typingSpeed: 70,
        deleteSpeed: 40,
        pauseAfterLine: 1500
    };

    /* -------------------- DOM ELEMENTS -------------------- */

    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll("section[id]");
    const profileImg = document.querySelector(".profile-img");
    const typingEl = document.querySelector(".typing");
    const canvas = document.getElementById("particles");

    /* -------------------- UTILS -------------------- */

    const getScrollY = () => window.pageYOffset || document.documentElement.scrollTop;

    const debounce = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    /* -------------------- SMOOTH SCROLL (with offset) -------------------- */

    function smoothScrollToElement(element) {
        if (!element) return;
        const elementY = element.getBoundingClientRect().top + getScrollY();
        window.scrollTo({
            top: elementY - CONFIG.headerHeight,
            behavior: "smooth"
        });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            smoothScrollToElement(target);
            history.pushState(null, null, link.getAttribute("href"));
        });
    });

    // Scroll to hash on load
    window.addEventListener("load", () => {
        if (window.location.hash) {
            const el = document.querySelector(window.location.hash);
            if (el) setTimeout(() => smoothScrollToElement(el), 100);
        }
    });

    /* -------------------- ACTIVE NAV LINK (IntersectionObserver) -------------------- */

    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove(CONFIG.activeClass));
                const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (active) active.classList.add(CONFIG.activeClass);
            }
        });
    }, {
        rootMargin: `-${CONFIG.headerHeight}px 0px -100px 0px`,
        threshold: 0.3
    });

    sections.forEach(section => navObserver.observe(section));

    /* -------------------- SECTION REVEAL (fade + slide) -------------------- */

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: CONFIG.revealThreshold
    });

    document.querySelectorAll("section").forEach(sec => {
        sec.style.opacity = "0";
        sec.style.transform = "translateY(40px)";
        sec.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        revealObserver.observe(sec);
    });

    /* -------------------- TYPING EFFECT (with delete) -------------------- */

    if (typingEl) {
        const roles = [
            "AI & Machine Learning Engineer",
            "Data Scientist",
            "NLP Developer",
            "Building Intelligent Systems"
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentRole = roles[roleIndex];
            if (isDeleting) {
                typingEl.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingEl.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(typeEffect, CONFIG.pauseAfterLine);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(typeEffect, 200);
            } else {
                setTimeout(typeEffect, isDeleting ? CONFIG.deleteSpeed : CONFIG.typingSpeed);
            }
        }

        window.addEventListener("load", () => setTimeout(typeEffect, 500));
    }

    /* -------------------- PARTICLE BACKGROUND (with mouse interaction) -------------------- */

    if (canvas) {
        const ctx = canvas.getContext("2d");
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        function resizeCanvas() {
            width = window.innerWidth;
            height = 400; // fixed height, same as CSS
            canvas.width = width;
            canvas.height = height;
            initParticles();
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < CONFIG.particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    dx: (Math.random() - 0.5) * 0.6,
                    dy: (Math.random() - 0.5) * 0.6,
                    size: Math.random() * 2 + 1.5
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.dx *= -1;
                if (p.y < 0 || p.y > height) p.dy *= -1;

                // Mouse repulsion
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        p.x -= Math.cos(angle) * force * 1.5;
                        p.y -= Math.sin(angle) * force * 1.5;
                    }
                }

                // Keep inside bounds
                p.x = Math.min(width, Math.max(0, p.x));
                p.y = Math.min(height, Math.max(0, p.y));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = CONFIG.particleColor;
                ctx.globalAlpha = 0.6;
                ctx.fill();
            });

            // Draw connections
            ctx.strokeStyle = CONFIG.lineColor;
            ctx.lineWidth = 0.8;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.globalAlpha = 0.15 * (1 - dist / 100);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawParticles);
        }

        // Mouse tracking
        canvas.addEventListener("mousemove", e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener("resize", debounce(resizeCanvas, 100));
        resizeCanvas();
        drawParticles();
    }

    /* -------------------- BACK-TO-TOP BUTTON (injected) -------------------- */

    (function createBackToTop() {
        const btn = document.createElement("button");
        btn.innerHTML = "↑";
        btn.setAttribute("aria-label", "Back to top");
        btn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #1d4ed8;
            color: white;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s, transform 0.2s;
            z-index: 99;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        btn.onmouseover = () => (btn.style.transform = "scale(1.1)");
        btn.onmouseout = () => (btn.style.transform = "scale(1)");
        document.body.appendChild(btn);

        window.addEventListener("scroll", () => {
            btn.style.opacity = getScrollY() > 300 ? "1" : "0";
        });

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    })();

    /* -------------------- PROFILE IMAGE LOAD EFFECT -------------------- */

    if (profileImg) {
        profileImg.style.transform = "scale(1)";
        // If image fails, fallback already handled in HTML
    }

})();