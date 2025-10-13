// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  // Target the actual blog date element instead of meta tag
  const blogDateElement = document.querySelector('time.blog-date');
  
  if (!blogDateElement) {
    console.warn("Blog date element not found.");
    return;
  }

  // Get the current date text (e.g., "5/30/25")
  const rawDate = blogDateElement.textContent.trim();
  
  // Parse the date - handle different formats
  let parsedDate;
  
  // Try parsing as-is first
  parsedDate = new Date(rawDate);
  
  // If that fails, try with full year (assuming 20xx)
  if (isNaN(parsedDate)) {
    const parts = rawDate.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const fullYear = year.length === 2 ? `20${year}` : year;
      parsedDate = new Date(`${month}/${day}/${fullYear}`);
    }
  }

  if (isNaN(parsedDate)) {
    console.warn("Invalid blog date format:", rawDate);
    return;
  }

  // Format the date nicely
  const formatted = parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  // Update the blog date element
  blogDateElement.textContent = formatted;
  
  // Also update any other date elements that might exist
  document.querySelectorAll("time.dt-published").forEach(el => {
    el.textContent = formatted;
    el.setAttribute("datetime", parsedDate.toISOString());
  });
  
  console.log(`Blog date updated: ${rawDate} → ${formatted}`);
});
