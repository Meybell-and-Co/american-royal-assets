document.addEventListener("DOMContentLoaded", () => {
  const scroller = document.querySelector(".timeline-content");
  const allItems = Array.from(document.querySelectorAll(".timeline-item"));
 // Gather only real items (no buffer)
const allItems = Array.from(document.querySelectorAll(".timeline-item"));
const realItems = allItems.filter(item => !item.classList.contains('timeline-buffer'));
const numRealItems = realItems.length;

// Generate dots for real cards only
dotsContainer.innerHTML = "";
realItems.forEach(() => {
  const dot = document.createElement("div");
  dot.className = "timeline-dot";
  dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll(".timeline-dot");

  function updateNav(idx) {
    dots.forEach((dot, i) => dot.classList.toggle("active", i === idx));
    if (barFill) barFill.style.width = ((idx) / (numRealItems - 1)) * 100 + "%";
    leftArrow.setAttribute("aria-disabled", idx === 0 ? "true" : "false");
    rightArrow.setAttribute("aria-disabled", idx === numRealItems - 1 ? "true" : "false");
    realCurrentIndex = idx;
  }

  function scrollToRealItem(idx, smooth = true) {
    const item = allItems[idx + 1]; // +1 for left buffer
    if (!item) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const scrollLeft =
      item.offsetLeft
      - scroller.offsetLeft
      - (scrollerRect.width / 2)
      + (itemRect.width / 2);

    scroller.scrollTo({
      left: scrollLeft,
      behavior: smooth ? "smooth" : "auto",
    });
    updateNav(idx);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => scrollToRealItem(idx));
  });

  leftArrow.addEventListener("click", () => {
    if (realCurrentIndex > 0) scrollToRealItem(realCurrentIndex - 1);
  });
  rightArrow.addEventListener("click", () => {
    if (realCurrentIndex < numRealItems - 1) scrollToRealItem(realCurrentIndex + 1);
  });

  // Arrow bop animation
  document.querySelectorAll(".timeline-arrow").forEach(arrow => {
    arrow.addEventListener("click", function () {
      arrow.classList.remove("bopping");
      void arrow.offsetWidth;
      arrow.classList.add("bopping");
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") rightArrow.click();
    if (e.key === "ArrowLeft") leftArrow.click();
  });

  // Optional: Sync nav on scroll (for swipe/drag)
  scroller.addEventListener("scroll", function () {
    let idx = 0;
    for (let i = 0; i < numRealItems; i++) {
      const item = allItems[i + 1];
      if (scroller.scrollLeft >= item.offsetLeft - scroller.offsetLeft - 10) {
        idx = i;
      }
    }
    updateNav(idx);
  });

  // Fade edges
  function updateGradientEdges() {
    scroller.classList.toggle('at-start', scroller.scrollLeft === 0);
    scroller.classList.toggle(
      'at-end',
      Math.ceil(scroller.scrollLeft + scroller.offsetWidth) >= scroller.scrollWidth
    );
  }
  scroller.addEventListener('scroll', updateGradientEdges);
  updateGradientEdges();

  // Dynamic arrow sizing (25% of card height)
  function setArrowHeight() {
    var card = realItems[0];
    var arrows = document.querySelectorAll(".timeline-arrow");
    if (card) {
      var cardHeight = card.offsetHeight;
      var arrowHeight = Math.round(cardHeight * 0.25);
      arrows.forEach(function (arrow) {
        arrow.style.height = arrowHeight + "px";
        arrow.style.width = arrowHeight + "px";
      });
    }
  }
  window.addEventListener("resize", setArrowHeight);
  setArrowHeight();

  // Initialize: center first real card
  setTimeout(() => { scrollToRealItem(0, false); }, 50); // Small delay helps for rendering
});
