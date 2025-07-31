// Google Books API integration
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search for books using the Google Books API with improved query formatting
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} Array of English language book objects
 */
export const searchBooks = async (query, maxResults = 10) => {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    // Improved query formatting for better results
    const formattedQuery = formatSearchQuery(query.trim());
    const encodedQuery = encodeURIComponent(formattedQuery);

    // Add language restriction to English books only and order by relevance
    const url = `${GOOGLE_BOOKS_API}?q=${encodedQuery}&langRestrict=en&maxResults=${maxResults}&orderBy=relevance`;

    console.log(
      'Searching Google Books API with formatted query:',
      formattedQuery
    );

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Transform Google Books data to our app format and filter for English books
    const transformedBooks = data.items.map((item) =>
      transformGoogleBookData(item)
    );

    // Additional client-side filtering for English language books
    return transformedBooks.filter((book) => {
      const language = book.language.toLowerCase();
      return (
        language === 'en' ||
        language === 'en-us' ||
        language === 'en-gb' ||
        language === 'eng'
      );
    });
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

/**
 * Search for a book by ISBN (English language books only)
 * @param {string} isbn - ISBN-10 or ISBN-13
 * @returns {Promise<Object|null>} English language book object or null if not found
 */
export const searchByISBN = async (isbn) => {
  try {
    // Clean ISBN - remove any hyphens or spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
      throw new Error('Invalid ISBN format. Must be 10 or 13 digits.');
    }

    const results = await searchBooks(`isbn:${cleanISBN}`, 1);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error searching by ISBN:', error);
    throw error;
  }
};

/**
 * Transform Google Books API data to our app's book format
 * @param {Object} googleBookItem - Raw item from Google Books API
 * @returns {Object} Transformed book object
 */
const transformGoogleBookData = (googleBookItem) => {
  const volumeInfo = googleBookItem.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};

  return {
    // Google Books identifiers
    googleBooksId: googleBookItem.id,

    // Basic book information
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors
      ? volumeInfo.authors.join(', ')
      : 'Unknown Author',
    description: volumeInfo.description || '', // Additional metadata
    publishedDate: volumeInfo.publishedDate || '',
    publisher: volumeInfo.publisher || '',
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories ? volumeInfo.categories.join(', ') : '',
    language: volumeInfo.language || 'en',

    // ISBNs
    isbn10: getISBN(volumeInfo.industryIdentifiers, 'ISBN_10'),
    isbn13: getISBN(volumeInfo.industryIdentifiers, 'ISBN_13'),

    // Images
    thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
    coverImage:
      imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null,

    // Ratings and reviews
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,

    // Links
    previewLink: volumeInfo.previewLink || null,
    infoLink: volumeInfo.infoLink || null,

    // Additional fields for our app
    subtitle: volumeInfo.subtitle || '',
    maturityRating: volumeInfo.maturityRating || 'NOT_MATURE',
  };
};

/**
 * Extract ISBN from industry identifiers
 * @param {Array} identifiers - Array of industry identifiers
 * @param {string} type - Type of ISBN to extract ('ISBN_10' or 'ISBN_13')
 * @returns {string|null} ISBN or null if not found
 */
const getISBN = (identifiers, type) => {
  if (!identifiers || !Array.isArray(identifiers)) {
    return null;
  }

  const identifier = identifiers.find((id) => id.type === type);
  return identifier ? identifier.identifier : null;
};

/**
 * Get a higher quality book cover image
 * @param {string} thumbnail - Thumbnail URL from Google Books
 * @returns {string} Higher quality image URL
 */
export const getHighQualityCover = (thumbnail) => {
  if (!thumbnail) return null;

  // Replace zoom=1 with zoom=0 for higher quality
  return thumbnail.replace('zoom=1', 'zoom=0');
};

/**
 * Validate and format ISBN
 * @param {string} isbn - Raw ISBN input
 * @returns {Object} Object with isValid, cleanISBN, and formattedISBN
 */
export const validateISBN = (isbn) => {
  if (!isbn) {
    return { isValid: false, cleanISBN: '', formattedISBN: '' };
  }

  const cleanISBN = isbn.replace(/[-\s]/g, '');
  const isValid = /^\d{10}$|^\d{13}$/.test(cleanISBN);

  let formattedISBN = cleanISBN;
  if (isValid) {
    if (cleanISBN.length === 10) {
      // Format ISBN-10: 0-123-45678-9
      formattedISBN = cleanISBN.replace(
        /(\d{1})(\d{3})(\d{5})(\d{1})/,
        '$1-$2-$3-$4'
      );
    } else if (cleanISBN.length === 13) {
      // Format ISBN-13: 978-0-123-45678-9
      formattedISBN = cleanISBN.replace(
        /(\d{3})(\d{1})(\d{3})(\d{5})(\d{1})/,
        '$1-$2-$3-$4-$5'
      );
    }
  }

  return {
    isValid,
    cleanISBN,
    formattedISBN,
  };
};

/**
 * Format search query to prioritize author and title searches
 * @param {string} query - Raw search query
 * @returns {string} Formatted query for Google Books API
 */
const formatSearchQuery = (query) => {
  // Check if query looks like an ISBN
  const cleanQuery = query.replace(/[-\s]/g, '');
  if (/^\d{10}$|^\d{13}$/.test(cleanQuery)) {
    return `isbn:${cleanQuery}`;
  }

  // Split query into potential parts
  const parts = query.toLowerCase().split(/\s+/);

  // Common author indicators
  const authorIndicators = ['by', 'author:', 'written by', 'from'];
  const titleIndicators = ['title:', 'book:'];

  // Check for explicit author/title indicators
  let hasAuthorIndicator = authorIndicators.some((indicator) =>
    query.toLowerCase().includes(indicator)
  );
  let hasTitleIndicator = titleIndicators.some((indicator) =>
    query.toLowerCase().includes(indicator)
  );

  if (hasAuthorIndicator) {
    // Extract author name after indicator
    let authorName = query;
    authorIndicators.forEach((indicator) => {
      if (query.toLowerCase().includes(indicator)) {
        const index = query.toLowerCase().indexOf(indicator);
        authorName = query.substring(index + indicator.length).trim();
      }
    });
    return `inauthor:"${authorName}"`;
  }

  if (hasTitleIndicator) {
    // Extract title after indicator
    let title = query;
    titleIndicators.forEach((indicator) => {
      if (query.toLowerCase().includes(indicator)) {
        const index = query.toLowerCase().indexOf(indicator);
        title = query.substring(index + indicator.length).trim();
      }
    });
    return `intitle:"${title}"`;
  }

  // Heuristic detection for likely author names
  if (isLikelyAuthorName(query)) {
    return `inauthor:"${query}"`;
  }

  // Heuristic detection for likely book titles
  if (isLikelyBookTitle(query)) {
    return `intitle:"${query}"`;
  }

  // Default: search both author and title with preference for author
  return `inauthor:"${query}" OR intitle:"${query}"`;
};

/**
 * Determine if a query is likely an author name
 * @param {string} query - Search query
 * @returns {boolean} True if likely an author name
 */
const isLikelyAuthorName = (query) => {
  const words = query.trim().split(/\s+/);

  // 2-3 words with capitalized first letters often indicate names
  if (words.length >= 2 && words.length <= 3) {
    const capitalizedWords = words.filter((word) => /^[A-Z][a-z]+$/.test(word));

    // If most words are properly capitalized, likely a name
    if (capitalizedWords.length >= words.length - 1) {
      return true;
    }
  }

  // Common author name patterns
  const namePatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+$/, // First Last
    /^[A-Z]\. [A-Z][a-z]+$/, // J. Author
    /^[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+$/, // First M. Last
  ];

  return namePatterns.some((pattern) => pattern.test(query));
};

/**
 * Determine if a query is likely a book title
 * @param {string} query - Search query
 * @returns {boolean} True if likely a book title
 */
const isLikelyBookTitle = (query) => {
  // Common book title indicators
  const titleWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'through',
  ];

  const words = query.toLowerCase().split(/\s+/);

  // Longer phrases with common title words
  if (words.length > 3) {
    const titleWordCount = words.filter((word) =>
      titleWords.includes(word)
    ).length;

    if (titleWordCount >= 2) {
      return true;
    }
  }

  // Phrases with quotation marks or special characters often indicate titles
  if (/["':;!?-]/.test(query)) {
    return true;
  }

  return false;
};
