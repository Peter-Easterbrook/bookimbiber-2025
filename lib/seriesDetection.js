/**
 * Series Detection Utility for Book Imbiber
 * Automatically detect and group book series from Google Books data
 */

/**
 * Extract series information from book data
 * @param {Object} book - Book object with title, subtitle, author
 * @returns {Object} Series info with name, number, and confidence
 */
export const detectSeries = (book) => {
  const { title, subtitle = '', author } = book;
  const fullTitle = `${title} ${subtitle}`.trim();
  
  // Series detection patterns (ordered by confidence)
  const patterns = [
    // Explicit series patterns
    { regex: /(.+?)\s*[:\-–]\s*Book\s+(\d+)/i, confidence: 'high' },
    { regex: /(.+?)\s*[:\-–]\s*Volume\s+(\d+)/i, confidence: 'high' },
    { regex: /(.+?)\s*[:\-–]\s*Part\s+(\d+)/i, confidence: 'high' },
    { regex: /(.+?)\s+#(\d+)/i, confidence: 'high' },
    
    // Numbered titles
    { regex: /(.+?)\s+(\d+)$/i, confidence: 'medium' },
    { regex: /(.+?)\s+(\d+)[:\-–]/i, confidence: 'medium' },
    
    // Roman numerals
    { regex: /(.+?)\s+(I{1,3}|IV|V|VI{1,3}|IX|X)$/i, confidence: 'medium' },
    
    // Subtitle series indicators
    { regex: /(.+?)\s*[:\-–]\s*(.+?)\s+(\d+)/i, confidence: 'low' },
    
    // Common series words in subtitle
    { regex: /(.+?)\s*[:\-–]\s*(A .+ Novel|The .+ Series|.+ Saga)/i, confidence: 'low' }
  ];
  
  for (const pattern of patterns) {
    const match = fullTitle.match(pattern.regex);
    if (match) {
      let seriesName = match[1].trim();
      let bookNumber = match[2];
      
      // Convert roman numerals to numbers
      if (isRomanNumeral(bookNumber)) {
        bookNumber = romanToNumber(bookNumber);
      }
      
      // Clean up series name
      seriesName = cleanSeriesName(seriesName);
      
      return {
        seriesName,
        bookNumber: parseInt(bookNumber) || 1,
        confidence: pattern.confidence,
        author,
        detectedFrom: 'title'
      };
    }
  }
  
  // Check if subtitle contains series info
  if (subtitle) {
    const subtitleSeries = detectSeriesFromSubtitle(subtitle, author);
    if (subtitleSeries) {
      return subtitleSeries;
    }
  }
  
  return null;
};

/**
 * Group books by series
 * @param {Array} books - Array of book objects
 * @returns {Object} Grouped series with standalone books
 */
export const groupBooksBySeries = (books) => {
  const series = new Map();
  const standalone = [];
  
  books.forEach(book => {
    const seriesInfo = detectSeries(book);
    
    if (seriesInfo && seriesInfo.confidence !== 'low') {
      const key = `${seriesInfo.author}_${seriesInfo.seriesName}`.toLowerCase();
      
      if (!series.has(key)) {
        series.set(key, {
          seriesName: seriesInfo.seriesName,
          author: seriesInfo.author,
          books: [],
          confidence: seriesInfo.confidence
        });
      }
      
      series.get(key).books.push({
        ...book,
        bookNumber: seriesInfo.bookNumber
      });
    } else {
      standalone.push(book);
    }
  });
  
  // Sort books within each series by book number
  series.forEach(seriesData => {
    seriesData.books.sort((a, b) => (a.bookNumber || 0) - (b.bookNumber || 0));
  });
  
  return {
    series: Array.from(series.values()),
    standalone
  };
};

/**
 * Detect series from subtitle
 */
const detectSeriesFromSubtitle = (subtitle, author) => {
  const seriesPatterns = [
    /(?:Book|Vol|Volume|Part)\s+(\d+)\s+(?:of|in)\s+(?:the\s+)?(.+)/i,
    /(.+)\s+(?:Book|Vol|Volume|Part)\s+(\d+)/i,
    /(?:A|An)\s+(.+)\s+Novel/i
  ];
  
  for (const pattern of seriesPatterns) {
    const match = subtitle.match(pattern);
    if (match) {
      return {
        seriesName: match[2] || match[1],
        bookNumber: parseInt(match[1]) || 1,
        confidence: 'medium',
        author,
        detectedFrom: 'subtitle'
      };
    }
  }
  
  return null;
};

/**
 * Clean series name from common artifacts
 */
const cleanSeriesName = (name) => {
  return name
    .replace(/\s*[:\-–]\s*$/, '') // Remove trailing punctuation
    .replace(/^(The|A|An)\s+/i, '') // Remove leading articles
    .trim();
};

/**
 * Check if string is roman numeral
 */
const isRomanNumeral = (str) => {
  return /^[IVX]+$/i.test(str);
};

/**
 * Convert roman numeral to number
 */
const romanToNumber = (roman) => {
  const romanNumerals = { I: 1, V: 5, X: 10 };
  let result = 0;
  let prevValue = 0;
  
  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanNumerals[roman[i].toUpperCase()];
    if (currentValue < prevValue) {
      result -= currentValue;
    } else {
      result += currentValue;
    }
    prevValue = currentValue;
  }
  
  return result;
};

/**
 * Search for more books in the same series using Google Books API
 * @param {string} seriesName - Name of the series
 * @param {string} author - Author name
 * @returns {Promise<Array>} Array of potential series books
 */
export const findMoreBooksInSeries = async (seriesName, author) => {
  try {
    const { searchBooks } = await import('./googleBooks.js');
    const query = `inauthor:"${author}" intitle:"${seriesName}"`;
    const results = await searchBooks(query, 20);
    
    return results
      .map(book => ({ ...book, seriesInfo: detectSeries(book) }))
      .filter(book => book.seriesInfo && 
               book.seriesInfo.seriesName.toLowerCase().includes(seriesName.toLowerCase()))
      .sort((a, b) => (a.seriesInfo.bookNumber || 0) - (b.seriesInfo.bookNumber || 0));
  } catch (error) {
    console.error('Error finding series books:', error);
    return [];
  }
};