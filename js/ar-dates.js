// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  // Target both blog grid dates AND individual blog post dates
  const blogDateElements = document.querySelectorAll('time.blog-date, time.dt-published, .blog-meta-item--date');
  
  if (blogDateElements.length === 0) {
    console.warn("Blog date elements not found.");
    return;
  }

  blogDateElements.forEach(dateElement => {
    // Get both datetime attribute and text content
    let datetimeAttr = dateElement.getAttribute('datetime');
    let textContent = dateElement.textContent.trim();
    
    console.log('Datetime attribute:', datetimeAttr);
    console.log('Text content:', textContent);
    
    let parsedDate;
    let rawDate;
    
    // Check if datetime attribute has obviously wrong year (like 2001 for recent posts)
    if (datetimeAttr) {
      const datetimeDate = new Date(datetimeAttr);
      const datetimeYear = datetimeDate.getFullYear();
      
      // If datetime year is suspiciously old (before 2010), prefer text content
      if (datetimeYear < 2010 && textContent.match(/\d{2}\/\d{2}\/\d{2}/)) {
        console.log('Datetime year seems wrong, using text content instead');
        rawDate = textContent;
      } else {
        rawDate = datetimeAttr;
      }
    } else {
      rawDate = textContent;
    }
    
    console.log('Using date source:', rawDate);
    
    // First try: Parse as ISO string or standard date format
    parsedDate = new Date(rawDate);
    
    // If that fails, try manual parsing for MM/DD/YY or MM/DD/YYYY format
    if (isNaN(parsedDate)) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        let [month, day, year] = parts.map(p => p.trim());
        
        // Fix 2-digit year logic - be more specific about the cutoff
        if (year.length === 2) {
          const yearNum = parseInt(year);
          // Years 00-25 are 2000s, 26-99 are 1900s (adjust cutoff as needed)
          if (yearNum <= 25) {
            year = `20${year}`;
          } else {
            year = `19${year}`;
          }
        }
        
        // Create date using YYYY-MM-DD format for better parsing
        parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        console.log('Parsed with manual logic:', parsedDate);
      }
    }
    
    // Try with current year for formats like "Jan 23"
    if (isNaN(parsedDate)) {
      const currentYear = new Date().getFullYear();
      parsedDate = new Date(`${rawDate} ${currentYear}`);
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
    // Set the correct datetime attribute
    dateElement.setAttribute("datetime", parsedDate.toISOString());
    
    console.log(`Blog date updated: ${rawDate} → ${formatted} (full year: ${year})`);
  });
});
