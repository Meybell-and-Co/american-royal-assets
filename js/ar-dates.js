// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  // Target both blog grid dates AND individual blog post dates
  const blogDateElements = document.querySelectorAll('time.blog-date, time.dt-published, .blog-meta-item--date');
  
  if (blogDateElements.length === 0) {
    console.warn("Blog date elements not found.");
    return;
  }

  blogDateElements.forEach(dateElement => {
    // Get the datetime attribute first (more reliable than text content)
    let rawDate = dateElement.getAttribute('datetime') || dateElement.textContent.trim();
    
    console.log('Original date:', rawDate); // Debug log
    
    let parsedDate;
    
    // Try parsing the datetime attribute or text content
    parsedDate = new Date(rawDate);
    
    // If that fails, try with current year for formats like "Jan 23"
    if (isNaN(parsedDate)) {
      const currentYear = new Date().getFullYear();
      parsedDate = new Date(`${rawDate} ${currentYear}`);
    }
    
    // If still failed, try manual parsing for MM/DD/YY format
    if (isNaN(parsedDate)) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        let [month, day, year] = parts;
        
        // Fix 2-digit year logic
        if (year.length === 2) {
          const yearNum = parseInt(year);
          // If year is 00-30, assume 2000s, if 31-99, assume 1900s
          if (yearNum <= 30) {
            year = `20${year}`;
          } else {
            year = `19${year}`;
          }
        }
        
        parsedDate = new Date(`${month}/${day}/${year}`);
        console.log('Parsed with year logic:', parsedDate); // Debug log
      }
    }

    if (isNaN(parsedDate)) {
      console.warn("Invalid blog date format:", rawDate);
      return;
    }

    // Format to MM/DD/YY with correct year calculation
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    
    // Get last 2 digits of year correctly
    const yearShort = year.toString().slice(-2);
    
    const formatted = `${month}/${day}/${yearShort}`;

    // Update the date element
    dateElement.textContent = formatted;
    dateElement.setAttribute("datetime", parsedDate.toISOString());
    
    console.log(`Blog date updated: ${rawDate} → ${formatted} (full year: ${year})`);
  });
});
