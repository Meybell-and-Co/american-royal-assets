// @ts-check
document.addEventListener("DOMContentLoaded", () => {
  console.log('=== AR DATES SIMPLE VERSION ===');
  
  // Target individual blog post dates specifically
  const blogDateElements = document.querySelectorAll('time.dt-published, time.blog-meta-item');
  
  console.log('Found individual post date elements:', blogDateElements.length);
  
  if (blogDateElements.length === 0) {
    console.log("No individual post date elements found - probably on grid page");
    return;
  }

  blogDateElements.forEach((dateElement, index) => {
    console.log(`\n--- Processing element ${index} ---`);
    
    let textContent = dateElement.textContent.trim();
    console.log('Original text:', textContent);
    
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
    // If it's in "Month Day" format, add current year
    else if (textContent.match(/^[A-Za-z]+ \d{1,2}$/)) {
      console.log('Found "Month Day" format');
      const currentYear = new Date().getFullYear();
      const fullDate = `${textContent} ${currentYear}`;
      
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
