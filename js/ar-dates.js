// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  // Target both blog grid dates AND individual blog post dates
  const blogDateElements = document.querySelectorAll('time.blog-date, time.dt-published, .blog-meta-item--date');
  
  if (blogDateElements.length === 0) {
    console.warn("Blog date elements not found.");
    return;
  }

  blogDateElements.forEach(dateElement => {
    // Get the current date text (e.g., "Jan 23" or "5/30/25")
    const rawDate = dateElement.textContent.trim();
    
    // Parse the date - handle different formats
    let parsedDate;
    
    // Try parsing as-is first
    parsedDate = new Date(rawDate);
    
    // If that fails, try with full year for short formats
    if (isNaN(parsedDate)) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        const [month, day, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        parsedDate = new Date(`${month}/${day}/${fullYear}`);
      }
    }
    
    // If still failed, try adding current year to formats like "Jan 23"
    if (isNaN(parsedDate)) {
      const currentYear = new Date().getFullYear();
      parsedDate = new Date(`${rawDate} ${currentYear}`);
    }

    if (isNaN(parsedDate)) {
      console.warn("Invalid blog date format:", rawDate);
      return;
    }

    // Format to MM/DD/YY
    const formatted = (parsedDate.getMonth() + 1).toString().padStart(2, '0') + 
                     '/' + parsedDate.getDate().toString().padStart(2, '0') + 
                     '/' + parsedDate.getFullYear().toString().slice(-2);

    // Update the date element
    dateElement.textContent = formatted;
    dateElement.setAttribute("datetime", parsedDate.toISOString());
    
    console.log(`Blog date updated: ${rawDate} → ${formatted}`);
  });
});
