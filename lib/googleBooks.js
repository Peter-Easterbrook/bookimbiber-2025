import { apiCache } from '../utils/api-cache';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Cache TTLs
const SEARCH_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours for general searches
const AUTHOR_BOOKS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for author books
const ISBN_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for ISBN lookups

/**
 * Search for books by author name (optimized for new releases check)
 * @param {string} authorName - Author name to search for
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of book objects
 */
export async function searchBooksByAuthor(authorName, maxResults = 40) {
  try {
    const cacheKey = `author_books_${authorName}_${maxResults}`;

    // Try cache first
    const cachedData = await apiCache.get(cacheKey);
    if (cachedData) {
      console.log('📚 Using cached author books for:', authorName);
      return cachedData;
    }

    console.log('🌐 Fetching fresh author books for:', authorName);

    const url = `${GOOGLE_BOOKS_API}?q=inauthor:"${encodeURIComponent(
      authorName
    )}"&maxResults=${maxResults}&orderBy=newest`;

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Books API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn('No books found for author:', authorName);
      // Cache empty results too to avoid repeated failed lookups
      await apiCache.set(cacheKey, [], AUTHOR_BOOKS_CACHE_TTL);
      return [];
    }

    const books = data.items.map((item) => {
      const volumeInfo = item.volumeInfo || {};
      const imageLinks = volumeInfo.imageLinks || {};

      return {
        googleBooksId: item.id,
        title: volumeInfo.title || 'Unknown Title',
        author:
          Array.isArray(volumeInfo.authors) && volumeInfo.authors.length > 0
            ? volumeInfo.authors.join(', ')
            : authorName,
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

    // Cache for 24 hours
    await apiCache.set(cacheKey, books, AUTHOR_BOOKS_CACHE_TTL);

    return books;
  } catch (error) {
    console.error('Error searching books by author:', error);
    return [];
  }
}

/**
 * Search for books in multiple languages (with caching)
 */
export async function searchBooks(query, maxResults = 10, userLocale = null) {
  try {
    if (!query || query.trim().length === 0) {
      console.warn('Empty search query provided');
      return [];
    }

    // Create cache key
    const cacheKey = `search_${query}_${maxResults}_${userLocale || 'en'}`;

    // Try to get from cache first
    const cachedData = await apiCache.get(cacheKey);
    if (cachedData) {
      console.log('📚 Using cached search results for:', query);
      return cachedData;
    }

    console.log('🌐 Fetching fresh search results for:', query);

    const resultsPerLanguage = Math.ceil(maxResults / 2);

    // Always search English first
    const englishResults = await searchBooksInLanguage(
      query,
      resultsPerLanguage,
      'en'
    );

    // If user has a non-English locale, search in that language too
    let localResults = [];
    if (userLocale && userLocale !== 'en') {
      localResults = await searchBooksInLanguage(
        query,
        resultsPerLanguage,
        userLocale
      );
    }

    // Merge results, removing duplicates by googleBooksId
    const combined = [...localResults, ...englishResults];
    const uniqueResults = Array.from(
      new Map(combined.map((book) => [book.googleBooksId, book])).values()
    );

    const results = uniqueResults.slice(0, maxResults);

    // Cache the results
    await apiCache.set(cacheKey, results, SEARCH_CACHE_TTL);

    return results;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

/**
 * Internal function to search books in a specific language
 */
async function searchBooksInLanguage(query, maxResults, lang) {
  try {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&langRestrict=${lang}&orderBy=relevance`;

    console.log(`🔍 Searching Google Books API (${lang.toUpperCase()}):`, url);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Google Books API error (${lang}):`,
        response.status,
        errorText
      );
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn(`No books found for query in ${lang}:`, query);
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
        language: volumeInfo.language || lang,
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
    console.error(`Error searching books in ${lang}:`, error);
    return [];
  }
}

/**
 * Search for a book by ISBN (with long cache)
 */
export const searchByISBN = async (isbn) => {
  try {
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
      throw new Error('Invalid ISBN format. Must be 10 or 13 digits.');
    }

    // Cache ISBN lookups for 7 days (ISBNs don't change)
    const cacheKey = `isbn_${cleanISBN}`;
    const cachedData = await apiCache.get(cacheKey);
    if (cachedData) {
      console.log('📚 Using cached ISBN lookup for:', cleanISBN);
      return cachedData;
    }

    console.log('🌐 Fetching fresh ISBN lookup for:', cleanISBN);
    const results = await searchBooks(`isbn:${cleanISBN}`, 1);
    const result = results.length > 0 ? results[0] : null;

    if (result) {
      await apiCache.set(cacheKey, result, ISBN_CACHE_TTL);
    }

    return result;
  } catch (error) {
    console.error('Error searching by ISBN:', error);
    throw error;
  }
};

const getISBN = (identifiers, type) => {
  if (!identifiers || !Array.isArray(identifiers)) {
    return null;
  }

  const identifier = identifiers.find((id) => id.type === type);
  return identifier ? identifier.identifier : null;
};

export const getHighQualityCover = (thumbnail) => {
  if (!thumbnail) return null;
  return thumbnail.replace('zoom=1', 'zoom=0');
};

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
