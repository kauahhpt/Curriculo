const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  setupScrollProgress();
  setupHeaderState();
  setupSpotlights();
  setupActiveNavigation();
  setupHeroParallax();
  setupCounters();
  setupRevealAnimations();
});

function setupScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress__bar");
  if (!progressBar) {
    return;
  }

  const updateProgress = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupSpotlights() {
  const cards = document.querySelectorAll("[data-spotlight]");

  cards.forEach((card) => {
    const resetPointer = () => {
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "50%");
    };

    resetPointer();

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--pointer-x", `${x}%`);
      card.style.setProperty("--pointer-y", `${y}%`);
    });

    card.addEventListener("pointerleave", resetPointer);
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) {
    return;
  }

  const renderValue = (element, value) => {
    const target = Number(element.dataset.counter) || 0;
    const suffix = element.dataset.suffix || "";
    const prefix = element.dataset.prefix || "";
    const pad = Number(element.dataset.pad) || 0;
    const roundedValue = Math.min(Math.round(value), target);
    const formatted =
      pad > 0 ? String(roundedValue).padStart(pad, "0") : String(roundedValue);

    element.textContent = `${prefix}${formatted}${suffix}`;
  };

  if (prefersReducedMotion) {
    counters.forEach((counter) => renderValue(counter, Number(counter.dataset.counter) || 0));
    return;
  }

  const animateCounter = (element) => {
    const target = Number(element.dataset.counter) || 0;

    if (window.gsap) {
      const state = { value: 0 };
      window.gsap.to(state, {
        value: target,
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => renderValue(element, state.value),
        onComplete: () => renderValue(element, target),
      });
      return;
    }

    const startTime = performance.now();
    const duration = 1300;

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderValue(element, target * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        renderValue(element, target);
      }
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.55,
    }
  );

  counters.forEach((counter) => {
    renderValue(counter, 0);
    observer.observe(counter);
  });
}

function setupActiveNavigation() {
  const links = document.querySelectorAll(".site-nav a");
  const sections = Array.from(document.querySelectorAll("section[id]")).filter((section) =>
    document.querySelector(`.site-nav a[href="#${section.id}"]`)
  );

  if (!links.length || !sections.length) {
    return;
  }

  links[0].classList.add("is-active");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        links.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    {
      rootMargin: "-35% 0px -50% 0px",
      threshold: 0.1,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupHeroParallax() {
  if (prefersReducedMotion) {
    return;
  }

  const hero = document.querySelector(".hero");
  const layers = document.querySelectorAll("[data-depth]");

  if (!hero || !layers.length) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    layers.forEach((layer) => {
      const depth = Number(layer.getAttribute("data-depth")) || 0;
      const moveX = (x / rect.width) * depth;
      const moveY = (y / rect.height) * depth;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });

  hero.addEventListener("pointerleave", () => {
    layers.forEach((layer) => {
      layer.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) {
    return;
  }

  if (prefersReducedMotion) {
    revealItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    return;
  }

  document.documentElement.classList.add("motion-ready");

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    const heroCopyItems = document.querySelectorAll(".hero-copy > *");
    if (heroCopyItems.length) {
      window.gsap.from(heroCopyItems, {
        y: 30,
        opacity: 0,
        duration: 0.95,
        stagger: 0.11,
        ease: "power3.out",
      });
    }

    const heroVisual = document.querySelector(".hero-visual");
    if (heroVisual) {
      window.gsap.from(heroVisual, {
        x: 42,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.15,
      });
    }

    revealItems.forEach((item) => {
      const direction = item.dataset.reveal;
      const movement =
        direction === "left" ? 42 : direction === "right" ? -42 : 28;
      const animationProps =
        direction === "left" || direction === "right"
          ? { x: movement, opacity: 0 }
          : { y: movement, opacity: 0 };

      window.gsap.fromTo(
        item,
        animationProps,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            once: true,
          },
        }
      );
    });

    window.gsap.to(".hero-halo--one", {
      y: -16,
      x: 10,
      duration: 5.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    window.gsap.to(".hero-halo--two", {
      y: 18,
      x: -12,
      duration: 6.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    window.gsap.to(".floating-card--top", {
      y: -10,
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    window.gsap.to(".floating-card--bottom", {
      y: 12,
      duration: 5.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.style.opacity = "1";
        entry.target.style.transform = "translate3d(0, 0, 0)";
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}
