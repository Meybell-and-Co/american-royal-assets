// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  console.log('=== AR DATES SIMPLE VERSION ===');
  
  // Target blog grid dates only
  const blogDateElements = document.querySelectorAll('time.blog-date');
  
  console.log('Found date elements:', blogDateElements.length);
  
  if (blogDateElements.length === 0) {
    console.log("No date elements found - exiting");
    return;
  }

  blogDateElements.forEach((dateElement, index) => {
    console.log(`\n--- Processing element ${index} ---`);
    
    let textContent = dateElement.textContent.trim();
    let datetimeAttr = dateElement.getAttribute('datetime');
    console.log('Original text:', textContent);
    console.log('Datetime attr:', datetimeAttr);
    
    let parsedDate;
    
    // If it's in MM/DD/YY format, convert the year
    if (textContent.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
      console.log('Found MM/DD/YY format');
      const parts = textContent.split('/');
      let [month, day, year] = parts.map(p => p.trim());
      
      // Convert 2-digit year to 4-digit
      const yearNum = parseInt(year);
      if (yearNum <= 25) {
        year = `20${year}`;  // 00-25 = 2000s
      } else {
        year = `19${year}`;  // 26-99 = 1900s
      }
      
      const formatted = `${month}/${day}/${year}`;
      console.log('Updated to:', formatted);
      
      // Update the element
      dateElement.textContent = formatted;
      
      // Also update datetime attribute for semantic correctness
      parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      dateElement.setAttribute("datetime", parsedDate.toISOString());
    }
    // If it's in "Month Day" format, try to get the year from datetime attribute
    else if (textContent.match(/^[A-Za-z]+ \d{1,2}$/)) {
      console.log('Found "Month Day" format');
      
      let yearToUse;
      
      // Try to extract year from datetime attribute if available
      if (datetimeAttr) {
        const datetimeDate = new Date(datetimeAttr);
        if (!isNaN(datetimeDate)) {
          yearToUse = datetimeDate.getFullYear();
          console.log('Using year from datetime attribute:', yearToUse);
          
          // But if the datetime year is obviously wrong (like 2001), use a smart guess
          if (yearToUse < 2010) {
            // Try to guess based on the month - if it's a future month, probably last year
            const textDate = new Date(`${textContent} 2023`); // Try 2023 first
            const now = new Date();
            
            if (textDate > now) {
              yearToUse = 2022; // If future date, probably from previous year
            } else {
              yearToUse = 2023; // Otherwise use 2023
            }
            console.log('Datetime year seemed wrong, guessing:', yearToUse);
          }
        } else {
          yearToUse = 2023; // Fallback
        }
      } else {
        yearToUse = 2023; // Default fallback
      }
      
      const fullDate = `${textContent} ${yearToUse}`;
      console.log('Trying to parse:', fullDate);
      
      // Parse and reformat to MM/DD/YYYY
      parsedDate = new Date(fullDate);
      if (!isNaN(parsedDate)) {
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = parsedDate.getDate().toString().padStart(2, '0');
        const year = parsedDate.getFullYear();
        const formatted = `${month}/${day}/${year}`;
        
        console.log('Updated to:', formatted);
        dateElement.textContent = formatted;
        dateElement.setAttribute("datetime", parsedDate.toISOString());
      }
    }
    
    console.log('Final result:', dateElement.textContent);
  });
  
  console.log('=== AR DATES COMPLETE ===');
});

/* Hide dates on individual blog posts */
.blog-item time.dt-published,
.blog-item .blog-meta-item--date,
.blog-item-author-date-wrapper time {
  display: none;
}
