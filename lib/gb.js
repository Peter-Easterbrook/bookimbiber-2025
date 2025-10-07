// Google Books API integration
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search for books using the Google Books API
 * @param {string} query - Search query (title, author, ISBN, etc.)
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} Array of book objects
 */
export async function searchBooks(query, maxResults = 10) {
  try {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}`;

    console.log('🔍 Searching Google Books API:', url);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Books API error:', response.status, errorText);
      throw new Error(
        `Google Books API returned ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn('No books found for query:', query);
      return [];
    }

    return data.items.map((item) => {
      const volumeInfo = item.volumeInfo || {};
      const imageLinks = volumeInfo.imageLinks || {};

      return {
        googleBooksId: item.id,
        title: volumeInfo.title || 'Unknown Title',
        author:
          Array.isArray(volumeInfo.authors) && volumeInfo.authors.length > 0
            ? volumeInfo.authors.join(', ')
            : 'Unknown',
        description: volumeInfo.description || '',
        publishedDate: volumeInfo.publishedDate || '',
        publisher: volumeInfo.publisher || '',
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories
          ? volumeInfo.categories.join(', ')
          : '',
        language: volumeInfo.language || 'en',
        isbn10: getISBN(volumeInfo.industryIdentifiers, 'ISBN_10'),
        isbn13: getISBN(volumeInfo.industryIdentifiers, 'ISBN_13'),
        thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
        coverImage:
          imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null,
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0,
        previewLink: volumeInfo.previewLink || null,
        infoLink: volumeInfo.infoLink || null,
        subtitle: volumeInfo.subtitle || '',
        maturityRating: volumeInfo.maturityRating || 'NOT_MATURE',
      };
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

/**
 * Search for a book by ISBN
 * @param {string} isbn - ISBN-10 or ISBN-13
 * @returns {Promise<Object|null>} Book object or null if not found
 */
export const searchByISBN = async (isbn) => {
  try {
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
      formattedISBN = cleanISBN.replace(
        /(\d{1})(\d{3})(\d{5})(\d{1})/,
        '$1-$2-$3-$4'
      );
    } else if (cleanISBN.length === 13) {
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
