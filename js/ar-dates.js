// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  console.log('=== AR DATES DEBUG START ===');
  console.log('URL:', window.location.href);
  
  // Target both blog grid dates AND individual blog post dates
  const blogDateElements = document.querySelectorAll('time.blog-date, time.dt-published, .blog-meta-item--date, time.blog-meta-item');
  
  console.log('Found date elements:', blogDateElements.length);
  blogDateElements.forEach((el, i) => {
    console.log(`Element ${i}:`, el.outerHTML);
  });
  
  if (blogDateElements.length === 0) {
    console.warn("Blog date elements not found.");
    return;
  }

  // Detect individual post by checking for specific classes in the HTML
  const isIndividualPost = document.querySelector('.blog-item-content') !== null || 
                          document.querySelector('time.dt-published') !== null ||
                          document.querySelector('.blog-item-author-date-wrapper') !== null;

  console.log('Individual post detected:', isIndividualPost);

  blogDateElements.forEach((dateElement, index) => {
    console.log(`\n--- Processing element ${index} ---`);
    
    // Get both datetime attribute and text content
    let datetimeAttr = dateElement.getAttribute('datetime');
    let textContent = dateElement.textContent.trim();
    
    console.log('Element classes:', dateElement.className);
    console.log('Datetime attribute:', datetimeAttr);
    console.log('Text content:', textContent);
    
    let parsedDate;
    let rawDate;
    
    // For individual posts, ALWAYS prefer text content if it looks like MM/DD/YY
    if (isIndividualPost && textContent.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      console.log('Individual post: Using text content');
      rawDate = textContent;
    } else if (datetimeAttr) {
      const datetimeDate = new Date(datetimeAttr);
      const datetimeYear = datetimeDate.getFullYear();
      
      // If datetime year is obviously wrong, use text content
      if (datetimeYear < 2010 && textContent.match(/\d{2}\/\d{2}\/\d{2}/)) {
        console.log('Bad datetime year, using text content');
        rawDate = textContent;
      } else {
        console.log('Using datetime attribute');
        rawDate = datetimeAttr;
      }
    } else {
      console.log('No datetime attr, using text content');
      rawDate = textContent;
    }
    
    console.log('Selected date source:', rawDate);
    
    // Parse the date
    parsedDate = new Date(rawDate);
    
    // If that fails, try manual parsing for MM/DD/YY format
    if (isNaN(parsedDate) && rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        let [month, day, year] = parts.map(p => p.trim());
        
        console.log('Manual parsing:', { month, day, year });
        
        // Handle 2-digit years
        if (year.length === 2) {
          const yearNum = parseInt(year);
          // Years 00-25 are 2000s, 26-99 are 1900s
          if (yearNum <= 25) {
            year = `20${year}`;
          } else {
            year = `19${year}`;
          }
        }
        
        console.log('Converted year:', year);
        
        // Create date
        parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        console.log('Manually parsed date:', parsedDate);
      }
    }

    if (isNaN(parsedDate)) {
      console.error("Could not parse date:", rawDate);
      return;
    }

    // Format the date
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    
    let formatted;
    if (isIndividualPost) {
      // Use full 4-digit year on individual blog posts
      formatted = `${month}/${day}/${year}`;
      console.log('Individual post format (YYYY):', formatted);
    } else {
      // Use 2-digit year on grid/list pages
      const yearShort = year.toString().slice(-2);
      formatted = `${month}/${day}/${yearShort}`;
      console.log('Grid format (YY):', formatted);
    }

    // Update the date element
    console.log('Updating element from:', dateElement.textContent, 'to:', formatted);
    dateElement.textContent = formatted;
    dateElement.setAttribute("datetime", parsedDate.toISOString());
    
    console.log('Final result:', dateElement.textContent);
  });
  
  console.log('=== AR DATES DEBUG END ===');
});
