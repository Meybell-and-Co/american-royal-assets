// @ts-check

/** Reveals the component after DOM + (ideally) fonts are ready */
function markTimelineReady() {
  const root = document.querySelector('.timeline-root');
  if (!root) return;

  // Avoid double toggles
  if (root.classList.contains('is-ready')) return;

  // Wait for fonts if available; fall back quickly
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise(r => setTimeout(r, 150));

  Promise.race([fontsReady, timeout]).then(() => {
    root.classList.add('is-ready');
  });
}

/** Main initializer (idempotent) */
function initTimeline() {
  try {
    // Re-init guard: prevent duplicate listeners on AJAX page loads
    const root = document.querySelector('.timeline-root');
    if (!root || root.hasAttribute('data-timeline-initialized')) {
      markTimelineReady(); // still reveal if we can
      return;
    }
    root.setAttribute('data-timeline-initialized', 'true');

    /** @type {HTMLElement|null} */
    const block = document.querySelector(".timeline-desktop.timeline-loaded-fade");
    if (!block) { markTimelineReady(); return; }

    // Ensure it's visible even if animations fail
    block.style.opacity = "1";

    // Don’t run the interactions on narrow screens
    if (window.innerWidth <= 900) { 
      // Still reveal for mobile
      markTimelineReady();
      return; 
    }

    /** @type {HTMLElement|null} */
    const scroller = document.querySelector(".timeline-content");
    /** @type {HTMLElement[]} */
    const allItems = Array.from(document.querySelectorAll(".timeline-item"));
    const realItems = allItems.filter(i => !i.classList.contains("timeline-buffer"));

    /** @type {HTMLButtonElement|null} */
    const leftArrow  = document.querySelector(".timeline-arrow-left");
    /** @type {HTMLButtonElement|null} */
    const rightArrow = document.querySelector(".timeline-arrow-right");
    /** @type {HTMLElement|null} */
    const barFill    = document.querySelector(".timeline-progress-bar-fill");
    /** @type {HTMLElement|null} */
    const dotsWrap   = document.querySelector(".timeline-dots");

    if (!scroller || !leftArrow || !rightArrow || !dotsWrap || realItems.length === 0) {
      markTimelineReady();
      return;
    }

    // Build dots (one per real card)
    dotsWrap.innerHTML = "";
    realItems.forEach(() => {
      const dot = document.createElement("div");
      dot.className = "timeline-dot";
      dotsWrap.appendChild(dot);
    });
    /** @type {NodeListOf<HTMLElement>} */
    const dots = dotsWrap.querySelectorAll(".timeline-dot");

    let idx = 0;

    /**
     * @param {number} nextIdx
     */
    function updateUI(nextIdx) {
      dots.forEach((d, i) => d.classList.toggle("active", i === nextIdx));
      if (barFill && realItems.length > 1) {
        barFill.style.width = String((nextIdx / (realItems.length - 1)) * 100) + "%";
      }
      leftArrow.setAttribute("aria-disabled", nextIdx === 0 ? "true" : "false");
      rightArrow.setAttribute("aria-disabled", nextIdx === realItems.length - 1 ? "true" : "false");
      idx = nextIdx;
    }

    /**
     * @param {number} nextIdx
     * @param {boolean} [smooth=true]
     */
    function scrollToIdx(nextIdx, smooth = true) {
      const item = allItems[nextIdx + 1]; // +1 accounts for left buffer
      if (!item) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const left =
        item.offsetLeft - scroller.offsetLeft - (scrollerRect.width / 2) + (itemRect.width / 2);
      scroller.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
      updateUI(nextIdx);
    }

    dots.forEach((d, i) => d.addEventListener("click", () => scrollToIdx(i)));
    leftArrow.addEventListener("click", () => { if (idx > 0) scrollToIdx(idx - 1); });
    rightArrow.addEventListener("click", () => { if (idx < realItems.length - 1) scrollToIdx(idx + 1); });

    document.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft")  leftArrow.click();
      if (e.key === "ArrowRight") rightArrow.click();
    });

    scroller.addEventListener("scroll", () => {
      // Snap active dot to nearest card center
      let best = 0, min = Infinity;
      for (let i = 0; i < realItems.length; i++) {
        const item = allItems[i + 1];
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const viewCenter = scroller.scrollLeft + scroller.offsetWidth / 2;
        const diff = Math.abs(viewCenter - itemCenter);
        if (diff < min) { min = diff; best = i; }
      }
      updateUI(best);
    });

    function sizeArrows() {
      const card = realItems[0];
      if (!card) return;
      const h = Math.round(card.offsetHeight * 0.25);
      document.querySelectorAll(".timeline-arrow").forEach(a => {
        /** @type {HTMLElement} */(a).style.height = h + "px";
        /** @type {HTMLElement} */(a).style.width  = h + "px";
      });
    }
    window.addEventListener("resize", sizeArrows);
    sizeArrows();

    // Initial position + fade-in
    setTimeout(() => { scrollToIdx(0, false); }, 20);
    setTimeout(() => { block.classList.add("timeline-show"); }, 150);

    // Fun bop on click
    document.querySelectorAll(".timeline-arrow").forEach(el => {
      const arrow = /** @type {HTMLElement} */(el);
      arrow.addEventListener("click", () => {
        arrow.classList.remove("bopping-left", "bopping-right");
        void arrow.offsetWidth; // reflow
        arrow.classList.add(arrow.classList.contains("timeline-arrow-left") ? "bopping-left" : "bopping-right");
      });
      arrow.addEventListener("animationend", () => {
        arrow.classList.remove("bopping-left", "bopping-right");
      });
    });

    // Finally reveal the component
    markTimelineReady();

  } catch (e) {
    const fallback = document.querySelector(".timeline-desktop.timeline-loaded-fade");
    if (fallback) /** @type {HTMLElement} */(fallback).style.opacity = "1";
    console.warn("Timeline init failed:", e);
    markTimelineReady();
  }
}

// Boot on DOM load and Squarespace AJAX navigations
document.addEventListener("DOMContentLoaded", initTimeline);
document.addEventListener("sqs:pageLoaded", initTimeline);
document.addEventListener("sqs-page-async-load", initTimeline);