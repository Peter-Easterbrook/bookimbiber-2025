// Google Books API integration
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search for books using the Google Books API (English language books only)
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} Array of English language book objects
 */
export const searchBooks = async (query, maxResults = 10) => {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const encodedQuery = encodeURIComponent(query.trim());
    // Add language restriction to English books only
    const url = `${GOOGLE_BOOKS_API}?q=${encodedQuery}&langRestrict=en&maxResults=${maxResults}`;

    console.log('Searching Google Books API:', url);

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
