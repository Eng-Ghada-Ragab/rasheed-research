/* =============================================================
   Rasheed Research Hub – Main Script
   Production-safe: Netlify / Safari ITP / incognito / minifiers
   ============================================================= */

/* ------------------------------------------------------------------
   1. GLOBAL DOM REFERENCES
   All variables live at module scope so every function can reach them.
   Nothing is wrapped in an IIFE that would hide them from sibling code.
------------------------------------------------------------------ */
if (window.__scriptLoaded) throw new Error("script already loaded");
window.__scriptLoaded = true;


// const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sectionElements = [...document.querySelectorAll("main section[id]")];
const revealElements = [...document.querySelectorAll(".reveal")];
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const readMoreLinks = [...document.querySelectorAll(".read-more")];
const blogModal = document.getElementById("blogModal");
const blogModalOverlay = document.querySelector(".blog-modal-overlay");
const blogModalContent = document.querySelector(".blog-modal-content");
const blogModalClose = document.querySelector(".blog-modal-close");
const blogModalSlider = document.querySelector(".blog-modal-slider");
const blogSliderPrev = document.querySelector(".blog-slider-prev");
const blogSliderNext = document.querySelector(".blog-slider-next");
const modalImage = document.getElementById("modalImage");
const modalDots = document.getElementById("modalDots");
const modalDate = document.getElementById("modalDate");
const modalCategory = document.getElementById("modalCategory");
const modalTitle = document.getElementById("modalTitle");
const modalSummary = document.getElementById("modalSummary");
const modalArticleLink = document.getElementById("modalArticleLink");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
// NOTE: promoBar is NOT listed here on purpose – initPromoBarCountdown()
// queries it internally so the function stays self-contained and testable.

/* ------------------------------------------------------------------
   2. SCROLLED HEADER
------------------------------------------------------------------ */
const setScrolledHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

setScrolledHeader();
window.addEventListener("scroll", setScrolledHeader, { passive: true });

/* ------------------------------------------------------------------
   3. MOBILE NAV MENU
------------------------------------------------------------------ */
const closeMenu = () => {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
};

const openMenu = () => {
  if (!navMenu || !navToggle) return;
  navMenu.classList.add("is-open");
  navToggle.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  body.classList.add("menu-open");
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("is-open")) return;
    if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) closeMenu();
  });
}

/* ------------------------------------------------------------------
   4. SMOOTH SCROLL FOR ANCHOR LINKS
------------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });

    if (history.replaceState) {
      history.replaceState(null, "", targetId);
    }

    closeMenu();
  });
});

/* ------------------------------------------------------------------
   5. ACTIVE NAV LINK ON SCROLL (IntersectionObserver)
------------------------------------------------------------------ */
if (sectionElements.length && navLinks.length) {
  const linkMap = new Map(
    navLinks.map((link) => [link.getAttribute("href").replace("#", ""), link])
  );

  const activateLink = (id) => {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const id = visible.target.id;
      if (linkMap.has(id)) activateLink(id);
    },
    {
      threshold: [0.2, 0.35, 0.55],
      rootMargin: "-25% 0px -45% 0px",
    }
  );

  sectionElements.forEach((section) => sectionObserver.observe(section));
}

/* ------------------------------------------------------------------
   6. SCROLL REVEAL (IntersectionObserver)
------------------------------------------------------------------ */
if (!prefersReducedMotion.matches && revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

/* ------------------------------------------------------------------
   7. SVG PLACEHOLDER HELPERS (image fallback)
------------------------------------------------------------------ */
const escapeSvgText = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const splitLabel = (label, maxLength = 18) => {
  const words = label.trim().split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const test = `${current} ${word}`.trim();
    if (test.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 3);
};

const buildPlaceholder = (label, variant = "default") => {
  const palettes = {
    default: { bg: "#fff7f7", panel: "#ffffff", accent: "#efc9c9", accentTwo: "#f2c66d", text: "#7a5c58" },
    hero: { bg: "#fff8f8", panel: "#fffdfd", accent: "#f6dada", accentTwo: "#f2c66d", text: "#7a5c58" },
    about: { bg: "#fffaf8", panel: "#ffffff", accent: "#f5ebdd", accentTwo: "#efc9c9", text: "#7a5c58" },
    logo: { bg: "#fff9f8", panel: "#ffffff", accent: "#efc9c9", accentTwo: "#f2c66d", text: "#4e3b39" },
  };

  const colors = palettes[variant] || palettes.default;
  const lines = splitLabel(label);
  const isLogo = variant === "logo";
  const textLines = lines
    .map((line, i) => `<tspan x="50%" dy="${i === 0 ? "0" : "40"}">${escapeSvgText(line)}</tspan>`)
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${escapeSvgText(label)}">
      <rect width="1200" height="800" fill="${colors.bg}"/>
      <circle cx="210" cy="170" r="110" fill="${colors.accent}" opacity="0.55"/>
      <circle cx="980" cy="160" r="86" fill="${colors.accentTwo}" opacity="0.28"/>
      <circle cx="1040" cy="700" r="160" fill="${colors.accent}" opacity="0.16"/>
      <rect x="150" y="120" width="900" height="560" rx="44" fill="${colors.panel}" stroke="#E8D6D3" stroke-width="4"/>
      <rect x="210" y="188" width="270" height="180" rx="28" fill="${colors.accent}" opacity="0.7"/>
      <rect x="520" y="188" width="230" height="28" rx="14" fill="${colors.accent}" opacity="0.58"/>
      <rect x="520" y="244" width="290" height="18" rx="9"  fill="${colors.accent}" opacity="0.28"/>
      <rect x="520" y="278" width="220" height="18" rx="9"  fill="${colors.accent}" opacity="0.22"/>
      <rect x="520" y="322" width="320" height="18" rx="9"  fill="${colors.accentTwo}" opacity="0.34"/>
      <rect x="210" y="414" width="630" height="24" rx="12" fill="${colors.accent}" opacity="0.2"/>
      <rect x="210" y="458" width="560" height="24" rx="12" fill="${colors.accent}" opacity="0.15"/>
      <rect x="210" y="502" width="470" height="24" rx="12" fill="${colors.accentTwo}" opacity="0.18"/>
      <text x="600" y="${isLogo ? 610 : 595}" fill="${colors.text}"
        font-family="Cairo, Tahoma, sans-serif"
        font-size="${isLogo ? 64 : 54}"
        font-weight="700"
        text-anchor="middle">${textLines}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const applyFallbackToImage = (img) => {
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = buildPlaceholder(
    img.dataset.placeholder || img.alt || "صورة توضيحية",
    img.dataset.variant || "default"
  );
};

document.querySelectorAll(".js-image-fallback").forEach((img) => {
  img.addEventListener("error", () => applyFallbackToImage(img), { once: true });
  if (img.complete && img.naturalWidth === 0) applyFallbackToImage(img);
});

/* ------------------------------------------------------------------
   8. PROMO BAR COUNTDOWN
   ─────────────────────────────────────────────────────────────────
   Bugs fixed vs original:
   ① localStorage wrapped in try/catch – Safari ITP / incognito / some
     Netlify edge functions throw a SecurityError on storage access,
     which previously crashed the whole script and stopped everything
     below (testimonials, forms, modal, etc.).
   ② promoBar hidden with CSS class initially to prevent FOUC (Flash Of
     Unstyled Content): the bar starts invisible via a tiny inline style
     injected before the DOM paints, then the script controls display.
   ③ Removed isNaN(savedEndDate) ambiguity – now uses a strict > 0
     numeric guard that works correctly whether localStorage returns
     null, "", "0", or a valid timestamp string.
   ④ Separated intervalId clearing so clearInterval is always called
     on hide even if the interval was never started.
   ⑤ Resize handler uses a named function so it can be cleaned up.
   ⑥ All previous commented-out duplicate versions removed.
------------------------------------------------------------------ */
const initPromoBarCountdown = () => {
  const promoBar = document.getElementById("promoBar");
  if (!promoBar) return;

  const hEl = document.getElementById("h");
  const mEl = document.getElementById("m");
  const sEl = document.getElementById("s");
  const root = document.documentElement;

  // If the countdown digits are missing the bar is broken – bail silently.
  if (!hEl || !mEl || !sEl) return;

  const STORAGE_KEY = "rrhPromoOfferEnd-v1";
  const DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
  const FALLBACK_H = 65;

  /* ── Safe localStorage helpers ── */
  const lsGet = (key) => {
    try { return window.localStorage.getItem(key); }
    catch (_) { return null; }
  };

  const lsSet = (key, value) => {
    try { window.localStorage.setItem(key, value); }
    catch (_) { /* storage unavailable – session-only countdown is fine */ }
  };

  const lsRemove = (key) => {
    try { window.localStorage.removeItem(key); }
    catch (_) { /* ignore */ }
  };

  /* ── Resolve end timestamp ── */
  let endDate = Number(lsGet(STORAGE_KEY));

  // endDate must be a positive integer in the future (or at least parseable).
  // Number(null) = 0, Number("") = 0, Number("abc") = NaN – all falsy / invalid.
  if (!(endDate > 0)) {
    endDate = Date.now() + DURATION_MS;
    lsSet(STORAGE_KEY, String(endDate));
  }

  /* ── CSS offset helper ── */
  const setOffset = (visible) => {
    root.style.setProperty(
      "--promo-bar-height",
      visible ? `${promoBar.offsetHeight || FALLBACK_H}px` : "0px"
    );
  };

  /* ── Hide bar completely ── */
  let intervalId = null;

  const hideBar = () => {
    promoBar.style.display = "none";
    promoBar.setAttribute("aria-hidden", "true");
    setOffset(false);
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    // Clean up the resize listener too
    window.removeEventListener("resize", onResize);
  };

  /* ── Tick: update digits or hide when expired ── */
  const tick = () => {
    const diff = endDate - Date.now();

    if (diff <= 0) {
      // Countdown has expired – remove stale key so next visit gets a fresh timer.
      lsRemove(STORAGE_KEY);
      hideBar();
      return;
    }

    promoBar.style.display = "flex";
    promoBar.removeAttribute("aria-hidden");
    setOffset(true);

    hEl.textContent = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
    mEl.textContent = String(Math.floor((diff / 60_000) % 60)).padStart(2, "0");
    sEl.textContent = String(Math.floor((diff / 1_000) % 60)).padStart(2, "0");
  };

  /* ── Resize: keep CSS offset accurate ── */
  const onResize = () => {
    if (promoBar.style.display !== "none") setOffset(true);
  };

  // Run immediately so the bar shows on first paint (no 1-second delay).
  tick();

  // Only start the interval if the bar is still visible after the first tick.
  if (promoBar.style.display !== "none") {
    intervalId = setInterval(tick, 1_000);
    window.addEventListener("resize", onResize, { passive: true });
  }
};

/* ------------------------------------------------------------------
   9. TESTIMONIALS SLIDER
------------------------------------------------------------------ */
const initTestimonialsSlider = () => {
  document.querySelectorAll(".testimonials-slider").forEach((slider) => {
    const viewport = slider.querySelector(".testimonial-viewport");
    const track = slider.querySelector(".testimonial-track");
    const cards = [...track.querySelectorAll(".testimonial-card")];
    const prevButton = slider.querySelector(".testimonial-prev");
    const nextButton = slider.querySelector(".testimonial-next");
    const dotsElement = slider.querySelector(".testimonial-dots");
    const autoplayDelay = Number(slider.dataset.autoplay) || 4800;

    if (!viewport || !track || !cards.length || !dotsElement) return;

    let currentIndex = 0;
    let autoplayId = null;
    let touchStartX = 0;
    let touchCurrentX = 0;

    const syncDimensions = () => {
      const pct = 100 / cards.length;
      track.style.width = `${cards.length * 100}%`;
      cards.forEach((card) => {
        card.style.flex = `0 0 ${pct}%`;
        card.style.width = `${pct}%`;
        card.style.minWidth = `${pct}%`;
      });
    };

    const render = () => {
      const offset = (100 / cards.length) * currentIndex;
      track.style.transform = `translate3d(-${offset}%, 0, 0)`;

      cards.forEach((card, i) => {
        card.setAttribute("aria-hidden", i === currentIndex ? "false" : "true");
      });

      [...dotsElement.children].forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
        dot.setAttribute("aria-current", i === currentIndex ? "true" : "false");
      });
    };

    const goTo = (index) => {
      currentIndex = (index + cards.length) % cards.length;
      render();
    };

    const goNext = () => goTo(currentIndex + 1);
    const goPrev = () => goTo(currentIndex - 1);

    const stopAutoplay = () => {
      if (!autoplayId) return;
      clearInterval(autoplayId);
      autoplayId = null;
    };

    const startAutoplay = () => {
      if (prefersReducedMotion.matches || cards.length <= 1) return;
      stopAutoplay();
      autoplayId = setInterval(goNext, autoplayDelay);
    };

    // Build dots
    dotsElement.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `testimonial-dot${i === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `عرض الرأي رقم ${i + 1}`);
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      dot.addEventListener("click", () => goTo(i));
      dotsElement.appendChild(dot);
    });

    prevButton?.addEventListener("click", goPrev);
    nextButton?.addEventListener("click", goNext);

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", (e) => {
      if (!slider.contains(e.relatedTarget)) startAutoplay();
    });

    viewport.addEventListener("touchstart", (e) => {
      if (cards.length <= 1) return;
      touchStartX = e.changedTouches[0].clientX;
      touchCurrentX = touchStartX;
      stopAutoplay();
    }, { passive: true });

    viewport.addEventListener("touchmove", (e) => {
      if (cards.length <= 1) return;
      touchCurrentX = e.changedTouches[0].clientX;
    }, { passive: true });

    viewport.addEventListener("touchend", () => {
      if (cards.length <= 1) return;
      const dist = touchCurrentX - touchStartX;
      if (Math.abs(dist) >= 45) {
        dist < 0 ? goNext() : goPrev();
      }
      touchStartX = touchCurrentX = 0;
      startAutoplay();
    }, { passive: true });

    window.addEventListener("resize", () => { syncDimensions(); render(); }, { passive: true });

    syncDimensions();
    render();
    startAutoplay();
  });
};

/* ------------------------------------------------------------------
   10. MEDIA NORMALISATION HELPERS (shared by modal + article galleries)
------------------------------------------------------------------ */
const normalizeMediaItem = (item) => {
  const value = String(item || "").trim();
  if (!value) return null;

  if (/^video:/i.test(value)) {
    const src = value.slice(6).trim();
    return src ? { type: "video", src } : null;
  }

  if (/^image:/i.test(value)) {
    const src = value.slice(6).trim();
    return src ? { type: "image", src } : null;
  }

  return { type: "image", src: value };
};

const parseGalleryMedia = (mediaValue = "") =>
  String(mediaValue)
    .split(",")
    .map((item) => item.trim())
    .map(normalizeMediaItem)
    .filter(Boolean);

/* ------------------------------------------------------------------
   11. SHARED SLIDER CONTROLLER (modal + article galleries)
------------------------------------------------------------------ */
const createSliderController = ({
  imageElement,
  dotsElement,
  prevButton,
  nextButton,
  swipeArea,
  dotClassName,
  getFallbackLabel,
  fallbackMediaClassName = "",
}) => {
  if (!imageElement) return null;

  const frameElement = imageElement.parentElement;
  const mediaClassName = imageElement.className || fallbackMediaClassName;

  let currentMedia = [];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchCurrentX = 0;

  const clearFrame = () => {
    if (!frameElement) return;
    frameElement.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
    frameElement.replaceChildren();
  };

  const buildImageElement = (src, label, index) => {
    const img = document.createElement("img");
    if (mediaClassName) img.className = mediaClassName;
    img.src = src || buildPlaceholder(label, "default");
    img.alt = `${label} - صورة ${index + 1}`;
    img.onerror = () => {
      img.onerror = null;
      img.src = buildPlaceholder(label, "default");
    };
    return img;
  };

  const buildVideoElement = (src, label, index) => {
    const video = document.createElement("video");
    if (mediaClassName) video.className = mediaClassName;
    video.classList.add("gallery-media-video");
    video.src = src;
    video.controls = true;
    video.autoplay = false;
    video.preload = "metadata";
    video.playsInline = true;
    video.setAttribute("aria-label", `${label} - فيديو ${index + 1}`);
    video.addEventListener("error", () => {
      if (currentMedia[currentIndex]?.src !== src) return;
      clearFrame();
      frameElement?.appendChild(buildImageElement("", label, index));
    });
    return video;
  };

  const syncControls = () => {
    const multi = currentMedia.length > 1;
    if (prevButton) prevButton.disabled = !multi;
    if (nextButton) nextButton.disabled = !multi;
  };

  const render = () => {
    const label = getFallbackLabel();
    const current = currentMedia[currentIndex];

    clearFrame();

    if (!current || current.type === "image") {
      frameElement?.appendChild(buildImageElement(current?.src || "", label, currentIndex));
    } else {
      frameElement?.appendChild(buildVideoElement(current.src, label, currentIndex));
    }

    if (!dotsElement) return;
    [...dotsElement.children].forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  };

  const goTo = (index) => {
    if (!currentMedia.length) return;
    currentIndex = (index + currentMedia.length) % currentMedia.length;
    render();
  };

  const step = (direction) => {
    if (currentMedia.length <= 1) return;
    goTo(currentIndex + direction);
  };

  const rebuildDots = () => {
    if (!dotsElement) return;
    dotsElement.innerHTML = "";
    if (currentMedia.length <= 1) return;

    currentMedia.forEach((item, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `${dotClassName}${i === currentIndex ? " active" : ""}`;
      dot.setAttribute(
        "aria-label",
        item?.type === "video" ? `عرض الفيديو ${i + 1}` : `عرض الصورة ${i + 1}`
      );
      dot.addEventListener("click", () => goTo(i));
      dotsElement.appendChild(dot);
    });
  };

  const setMedia = (media = []) => {
    currentMedia = Array.isArray(media)
      ? media.map(normalizeMediaItem).filter(Boolean)
      : parseGalleryMedia(media);
    currentIndex = 0;
    touchStartX = 0;
    touchCurrentX = 0;
    syncControls();
    rebuildDots();
    render();
  };

  const reset = () => {
    currentMedia = [];
    currentIndex = 0;
    touchStartX = 0;
    touchCurrentX = 0;
    clearFrame();
    if (dotsElement) dotsElement.innerHTML = "";
    syncControls();
  };

  prevButton?.addEventListener("click", () => step(-1));
  nextButton?.addEventListener("click", () => step(1));

  if (swipeArea) {
    swipeArea.addEventListener("touchstart", (e) => {
      if (currentMedia.length <= 1) return;
      touchStartX = touchCurrentX = e.changedTouches[0].clientX;
    }, { passive: true });

    swipeArea.addEventListener("touchmove", (e) => {
      if (currentMedia.length <= 1) return;
      touchCurrentX = e.changedTouches[0].clientX;
    }, { passive: true });

    swipeArea.addEventListener("touchend", () => {
      if (currentMedia.length <= 1) return;
      const dist = touchCurrentX - touchStartX;
      if (Math.abs(dist) >= 45) step(dist < 0 ? 1 : -1);
      touchStartX = touchCurrentX = 0;
    }, { passive: true });
  }

  syncControls();

  return { setMedia, setImages: setMedia, reset };
};

/* ------------------------------------------------------------------
   12. BLOG MODAL
------------------------------------------------------------------ */
let lastFocusedElement = null;
let previousBodyOverflow = "";

const modalSliderController =
  blogModal &&
  createSliderController({
    imageElement: modalImage,
    dotsElement: modalDots,
    prevButton: blogSliderPrev,
    nextButton: blogSliderNext,
    swipeArea: blogModalSlider,
    dotClassName: "blog-modal-dot",
    getFallbackLabel: () => modalTitle?.textContent || "مقال",
    fallbackMediaClassName: "blog-modal-media",
  });

const resetBlogModal = () => {
  modalSliderController?.reset();
  if (modalDate) modalDate.textContent = "";
  if (modalCategory) modalCategory.textContent = "";
  if (modalTitle) modalTitle.textContent = "";
  if (modalSummary) modalSummary.textContent = "";

  if (modalArticleLink) {
    modalArticleLink.href = "#";
    modalArticleLink.classList.add("is-disabled");
    modalArticleLink.setAttribute("aria-disabled", "true");
  }
};

const closeBlogModal = () => {
  if (!blogModal) return;
  blogModal.classList.remove("active");
  blogModal.setAttribute("aria-hidden", "true");
  body.style.overflow = previousBodyOverflow;
  resetBlogModal();

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
};

const openBlogModal = (trigger) => {
  if (!blogModal || !blogModalContent || !modalDate || !modalCategory || !modalTitle || !modalSummary) return;

  const { title, date, category, summary, images, image, articleUrl } = trigger.dataset;

  if (modalTitle) modalTitle.textContent = title || "";
  if (modalDate) modalDate.textContent = date || "";
  if (modalCategory) modalCategory.textContent = category || "";
  if (modalSummary) modalSummary.textContent = summary || "";

  modalSliderController?.setMedia(trigger.dataset.media || images || image || "");

  if (modalArticleLink) {
    const targetUrl = articleUrl || "#";
    modalArticleLink.href = targetUrl;
    modalArticleLink.classList.toggle("is-disabled", targetUrl === "#");

    if (targetUrl === "#") {
      modalArticleLink.setAttribute("aria-disabled", "true");
    } else {
      modalArticleLink.removeAttribute("aria-disabled");
    }
  }

  lastFocusedElement = trigger;
  previousBodyOverflow = body.style.overflow;
  body.style.overflow = "hidden";
  blogModal.classList.add("active");
  blogModal.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    blogModalContent.focus();
  });
};

// Wire up read-more triggers
readMoreLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    openBlogModal(link);
  });
});

blogModalClose?.addEventListener("click", closeBlogModal);
blogModalOverlay?.addEventListener("click", closeBlogModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && blogModal?.classList.contains("active")) closeBlogModal();
});

// Focus trap inside open modal
blogModalContent?.addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || !blogModal?.classList.contains("active")) return;

  const focusable = [...blogModalContent.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.disabled);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ------------------------------------------------------------------
   13. BLOG CARD – click to navigate (excluding inner links)
------------------------------------------------------------------ */
document.querySelectorAll(".blog-card").forEach((card) => {
  card.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    const { url } = this.dataset;
    if (url) window.location.href = url;
  });
});

/* ------------------------------------------------------------------
   14. ARTICLE GALLERIES
------------------------------------------------------------------ */
const initArticleGalleries = () => {
  document.querySelectorAll(".article-gallery").forEach((gallery) => {
    const galleryImage = gallery.querySelector(".article-gallery-image");
    const galleryDots = gallery.querySelector(".article-gallery-dots");
    const galleryPrev = gallery.querySelector(".article-slider-prev");
    const galleryNext = gallery.querySelector(".article-slider-next");
    const gallerySwipe = gallery.querySelector(".article-gallery-slider");
    const galleryLabel = gallery.dataset.label || document.title || "معرض المقال";

    const controller = createSliderController({
      imageElement: galleryImage,
      dotsElement: galleryDots,
      prevButton: galleryPrev,
      nextButton: galleryNext,
      swipeArea: gallerySwipe,
      dotClassName: "article-gallery-dot",
      getFallbackLabel: () => galleryLabel,
      fallbackMediaClassName: "article-gallery-image",
    });

    controller?.setMedia((gallery.dataset.media || gallery.dataset.images || "").trim());
  });
};

/* ------------------------------------------------------------------
   15. FLOATING WHATSAPP BUTTON
------------------------------------------------------------------ */
const initFloatingWhatsappButton = () => {
  if (!body || document.querySelector(".whatsapp-float")) return;

  const btn = document.createElement("a");
  btn.className = "whatsapp-float";
  btn.href = "https://wa.me/201113728359";
  btn.target = "_blank";
  btn.rel = "noopener noreferrer";
  btn.setAttribute("aria-label", "تواصل عبر واتساب");
  btn.innerHTML = `
    <span class="whatsapp-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" class="wa-svg" aria-hidden="true" focusable="false">
        <path d="M16.001 2.667c-7.364 0-13.334 5.97-13.334 13.334 0 2.35.615 4.557 1.685 6.47l-1.767 6.53 6.684-1.754c1.842 1.004 3.952 1.579 6.732 1.579 7.364 0 13.334-5.97 13.334-13.334S23.365 2.667 16.001 2.667zm0 24.001c-2.26 0-4.357-.607-6.169-1.655l-.441-.255-3.968 1.041 1.059-3.879-.285-.449c-1.139-1.795-1.744-3.88-1.744-6.005 0-6.2 5.035-11.235 11.235-11.235s11.235 5.035 11.235 11.235-5.035 11.235-11.235 11.235zm6.158-8.385c-.337-.169-1.995-.984-2.304-1.096-.309-.113-.534-.169-.759.169-.225.337-.872 1.096-1.069 1.322-.197.225-.394.253-.731.084-.337-.169-1.423-.524-2.712-1.669-1.003-.894-1.68-1.997-1.877-2.334-.197-.337-.021-.518.148-.686.152-.151.337-.394.506-.591.169-.197.225-.337.337-.562.113-.225.056-.422-.028-.591-.084-.169-.759-1.828-1.04-2.506-.273-.657-.551-.567-.759-.577l-.647-.011c-.225 0-.591.084-.9.422-.309.337-1.181 1.153-1.181 2.812 0 1.659 1.209 3.262 1.378 3.487.169.225 2.38 3.632 5.773 5.092.808.349 1.437.557 1.928.713.81.258 1.548.222 2.13.135.65-.097 1.995-.816 2.276-1.603.281-.788.281-1.462.197-1.603-.084-.141-.309-.225-.647-.394z"/>
      </svg>
    </span>
    <span class="whatsapp-text">اطلب خدمتك الآن</span>
  `;

  body.appendChild(btn);
};

/* ------------------------------------------------------------------
   16. ARTICLE QUIZZES
------------------------------------------------------------------ */
const initArticleQuizzes = () => {
  document.querySelectorAll(".article-quiz").forEach((quiz) => {
    const form = quiz.querySelector(".article-quiz-form");
    const result = quiz.querySelector(".article-quiz-result");
    const correctAnswer = quiz.dataset.correctAnswer;
    const correctMsg = quiz.dataset.correctMessage || "تمام! الإجابة صحيحة ✅";
    const wrongMsg = quiz.dataset.wrongMessage ||
      "إجابة غير صحيحة. الإجابة الصحيحة هي: تضييق العنوان ليشمل دولة واحدة أو فئة محددة ✅";

    if (!form || !result || !correctAnswer) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = form.querySelector('input[type="radio"]:checked');

      if (!selected) {
        result.textContent = "اختر إجابة أولًا ثم اضغط على زر التحقق.";
        result.className = "article-quiz-result is-visible is-wrong";
        return;
      }

      result.textContent = selected.value === correctAnswer ? correctMsg : wrongMsg;
      result.className = `article-quiz-result is-visible ${selected.value === correctAnswer ? "is-correct" : "is-wrong"
        }`;
    });

    form.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener("change", () => {
        result.textContent = "";
        result.className = "article-quiz-result";
      });
    });
  });
};

/* ------------------------------------------------------------------
   17. CONTACT FORM
------------------------------------------------------------------ */
// Accepts Egyptian (+20 / 0), Saudi (+966), and Kuwaiti (+965) mobile numbers.
const whatsappPattern = /^(?:(?:\+?20|0)?1[0125]\d{8}|(?:\+?966)?5\d{8}|(?:\+?965)?[569]\d{7})$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeWhatsapp = (v) => v.replace(/[^\d+]/g, "");

const getFormValues = (form) => ({
  name: form.elements.name.value.trim(),
  whatsapp: form.elements.whatsapp.value.trim(),
  email: form.elements.email.value.trim(),
  service: form.elements.service.value.trim(),
  details: form.elements.details.value.trim(),
});

const validators = {
  name: (v) => {
    if (!v) return "يرجى كتابة الاسم.";
    if (v.length < 2) return "الاسم يجب أن يحتوي على حرفين على الأقل.";
    return "";
  },
  whatsapp: (v) => {
    if (!v) return "يرجى كتابة رقم الواتساب.";
    if (!whatsappPattern.test(normalizeWhatsapp(v)))
      return "يرجى إدخال رقم واتساب صحيح (مصر، السعودية، أو الكويت).";
    return "";
  },
  email: (v) => {
    if (!v) return "";
    if (!emailPattern.test(v)) return "يرجى إدخال بريد إلكتروني صحيح.";
    return "";
  },
  service: (v) => (!v ? "يرجى اختيار نوع الخدمة المطلوبة." : ""),
  details: (v) => {
    if (!v) return "يرجى كتابة تفاصيل الطلب.";
    if (v.length < 10) return "يرجى توضيح الطلب في 10 أحرف على الأقل.";
    return "";
  },
};

const showFieldError = (field, message) => {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.add("has-error");
  field.setAttribute("aria-invalid", "true");

  let error = wrapper.querySelector(".field-error");
  if (!error) {
    error = document.createElement("small");
    error.className = "field-error";
    wrapper.appendChild(error);
  }
  error.textContent = message;
};

const clearFieldError = (field) => {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.remove("has-error");
  field.removeAttribute("aria-invalid");
  const error = wrapper.querySelector(".field-error");
  if (error) error.textContent = "";
};

const validateField = (field) => {
  if (!field?.name || !validators[field.name]) return true;
  const message = validators[field.name](field.value.trim());
  if (message) { showFieldError(field, message); return false; }
  clearFieldError(field);
  return true;
};

const showFormMessage = (message, type) => {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className = `form-message is-visible ${type}`;
};

const buildWhatsappMessage = ({ name, whatsapp, email, service, details }) =>
  `مرحبًا، أرغب في طلب خدمة من Rasheed Research Hub.\n\nالاسم: ${name}\nرقم الواتساب: ${whatsapp}\nالبريد الإلكتروني: ${email || "غير مذكور"}\nنوع الخدمة: ${service}\nتفاصيل الطلب: ${details}`;

if (contactForm) {
  const fields = [...contactForm.querySelectorAll("input, select, textarea")];

  fields.forEach((field) => {
    const event = field.tagName.toLowerCase() === "select" ? "change" : "input";
    field.addEventListener(event, () => {
      const wrapper = field.closest(".form-field");
      if (wrapper?.classList.contains("has-error")) validateField(field);
    });
    field.addEventListener("blur", () => validateField(field));
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (formMessage) {
      formMessage.textContent = "";
      formMessage.className = "form-message";
    }

    const values = getFormValues(contactForm);
    let firstInvalidField = null;
    let allValid = true;

    fields.forEach((field) => {
      const valid = validateField(field);
      if (!valid) {
        allValid = true === false; // set to false
        allValid = false;
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (!allValid) {
      showFormMessage("يرجى مراجعة الحقول المطلوبة والتأكد من صحة البيانات قبل المتابعة.", "error");
      firstInvalidField?.focus();
      return;
    }

    const message = buildWhatsappMessage(values);
    const whatsappURL = `https://wa.me/201113728359?text=${encodeURIComponent(message)}`;
    const newWindow = window.open(whatsappURL, "_blank");

    if (!newWindow) {
      showFormMessage(
        "تعذر فتح واتساب تلقائيًا. يرجى التأكد من السماح بفتح النوافذ المنبثقة ثم المحاولة مرة أخرى.",
        "error"
      );
      return;
    }

    showFormMessage("جاري تحويلك إلى واتساب...", "success");
    contactForm.reset();
    fields.forEach(clearFieldError);
  });
}

/* ------------------------------------------------------------------
   18. INITIALISE ALL FEATURES
   ─────────────────────────────────────────────────────────────────
   Each call is wrapped in its own try/catch so that a failure in one
   feature never prevents the others from running.  This is the key
   reason the testimonials / form / modal were silently breaking
   whenever initPromoBarCountdown threw an uncaught error.
------------------------------------------------------------------ */
const safeInit = (fn, label) => {
  try {
    fn();
  } catch (err) {
    // Log in development; silent in production.
    if (typeof console !== "undefined") {
      console.warn(`[RRH] ${label} failed to initialise:`, err);
    }
  }
};

safeInit(initPromoBarCountdown, "initPromoBarCountdown");
safeInit(initTestimonialsSlider, "initTestimonialsSlider");
safeInit(initArticleGalleries, "initArticleGalleries");
safeInit(initFloatingWhatsappButton, "initFloatingWhatsappButton");
safeInit(initArticleQuizzes, "initArticleQuizzes");