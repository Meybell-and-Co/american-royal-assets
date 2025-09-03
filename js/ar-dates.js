// ar-dates.js
// Formats and applies published dates from meta tags to <time> elements.

document.addEventListener("DOMContentLoaded", () => {
  /** @type {HTMLMetaElement|null} */
  const metaDate = document.querySelector('meta[itemprop="datePublished"]');
  if (!metaDate) {
    console.warn("Publish date meta tag not found.");
    return;
  }

  const rawDate = metaDate.getAttribute("content") || "";
  const fixedDate = new Date(rawDate);

  if (Number.isNaN(fixedDate.getTime())) {
    console.warn("Invalid publish date:", rawDate);
    return;
  }

  const formatted = fixedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  /** @type {NodeListOf<HTMLTimeElement>} */
  const times = document.querySelectorAll("time.dt-published");
  times.forEach((el) => {
    el.textContent = formatted;
    el.setAttribute("datetime", fixedDate.toISOString());
  });
});
