// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  // Target both blog grid dates AND individual blog post dates
  const blogDateElements = document.querySelectorAll('time.blog-date, time.dt-published, .blog-meta-item--date');
  
  if (blogDateElements.length === 0) {
    console.warn("Blog date elements not found.");
    return;
  }

  // Enhanced detection for individual blog post pages
  const isIndividualPost = document.querySelector('.blog-item-wrapper, .entry-header, article.blog-item, .blog-item-content, .blog-meta-item') !== null || 
                          window.location.pathname.includes('/blog/') || 
                          document.body.classList.contains('blog-item') ||
                          document.querySelector('time.dt-published') !== null; // dt-published is typically only on individual posts

  console.log('Page type detected:', isIndividualPost ? 'Individual blog post' : 'Blog grid/list');
  console.log('URL:', window.location.pathname);

  blogDateElements.forEach(dateElement => {
    // Get both datetime attribute and text content
    let datetimeAttr = dateElement.getAttribute('datetime');
    let textContent = dateElement.textContent.trim();
    
    console.log('Processing element:', dateElement);
    console.log('Datetime attribute:', datetimeAttr);
    console.log('Text content:', textContent);
    
    let parsedDate;
    let rawDate;
    
    // More aggressive fallback for individual posts
    if (datetimeAttr) {
      const datetimeDate = new Date(datetimeAttr);
      const datetimeYear = datetimeDate.getFullYear();
      
      // If we're on an individual post OR datetime year is suspiciously old, prefer text content
      if ((isIndividualPost || datetimeYear < 2010) && textContent.match(/\d{2}\/\d{2}\/\d{2}/)) {
        console.log('Using text content instead of datetime attribute');
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

    // Format the date based on page type
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    
    let formatted;
    if (isIndividualPost) {
      // Use full 4-digit year on individual blog posts
      formatted = `${month}/${day}/${year}`;
    } else {
      // Use 2-digit year on grid/list pages
      const yearShort = year.toString().slice(-2);
      formatted = `${month}/${day}/${yearShort}`;
    }

    // Update the date element
    dateElement.textContent = formatted;
    // Set the correct datetime attribute
    dateElement.setAttribute("datetime", parsedDate.toISOString());
    
    console.log(`Blog date updated: ${rawDate} → ${formatted} (full year: ${year})`);
  });
});
