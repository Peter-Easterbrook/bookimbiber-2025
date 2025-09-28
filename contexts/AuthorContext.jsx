import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { ID, Permission, Query, Role } from 'react-native-appwrite';
import { useUser } from '../hooks/useUser';
import { client, databases } from '../lib/appwrite';
import { searchBooks } from '../lib/googleBooks';
import {
  incrementNotificationCount,
  sendLocalNotification,
} from '../lib/notifications';
import { BooksContext } from './BooksContext';

const DATABASE_ID = '681e133100381d53f199';
const AUTHORS_COLLECTION_ID = 'authors';

export const AuthorContext = createContext();

export function AuthorProvider({ children }) {
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [newReleases, setNewReleases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const { books, readBooks } = useContext(BooksContext) || { books: [], readBooks: [] };

  // How frequently to re-check an author (ms). 24 hours by default.
  const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

  const normalizeForId = (s = '') =>
    s
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  // Generate unique ID for book comparison
  const bookIdFor = (b) => {
    if (!b) return '';

    // Primary ID based on Google Books ID if available
    if (b.googleBooksId) {
      return `gbid:${String(b.googleBooksId)}`;
    }

    // Fallback ID based on normalized title, author, and publication year
    const title = normalizeForId(b.title || '');
    const author = normalizeForId(b.author || '');
    const year = (b.publishedDate || '').toString().substring(0, 4);

    // Include author in ID for better matching accuracy
    return `title:${title}|author:${author}|year:${year}`;
  };

  // Check if a book is already in user's collection
  const isBookOwned = (book) => {
    const bookId = bookIdFor(book);
    const allUserBooks = [...(books || []), ...(readBooks || [])];

    // Try multiple matching strategies for better accuracy
    const isOwned = allUserBooks.some(ownedBook => {
      const ownedBookId = bookIdFor(ownedBook);

      // Direct ID match
      if (ownedBookId === bookId) return true;

      // If the new release book has a googleBooksId, also try matching by title/author/year
      if (book.googleBooksId && !ownedBook.googleBooksId) {
        const fallbackNewId = `title:${normalizeForId(book.title || '')}|author:${normalizeForId(book.author || '')}|year:${(book.publishedDate || '').toString().substring(0, 4)}`;
        if (ownedBookId === fallbackNewId) return true;
      }

      // If the owned book has a googleBooksId, also try matching by title/author/year
      if (!book.googleBooksId && ownedBook.googleBooksId) {
        const fallbackOwnedId = `title:${normalizeForId(ownedBook.title || '')}|author:${normalizeForId(ownedBook.author || '')}|year:${(ownedBook.publishedDate || '').toString().substring(0, 4)}`;
        if (bookId === fallbackOwnedId) return true;
      }

      return false;
    });

    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Checking if book is owned:', {
        title: book.title,
        author: book.author,
        hasGoogleBooksId: !!book.googleBooksId,
        bookId,
        totalUserBooks: allUserBooks.length,
        isOwned
      });
    }

    return isOwned;
  };

  // Filter out owned books from a list
  const filterUnownedBooks = (bookList) => {
    const filtered = bookList.filter(book => !isBookOwned(book));

    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Filtering book list:', {
        originalCount: bookList.length,
        filteredCount: filtered.length,
        removedCount: bookList.length - filtered.length
      });
    }

    return filtered;
  };

  // ---- Notifications storage helpers ----
  const NOTIFS_KEY = 'bookimbiber_notifications';

  const loadNotifications = async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      setNotifications(existing);
      // derive newReleases from unread notifications so badge/card reflect unread until user acts
      const unread = existing.filter((n) => !n.read);
      setNewReleases(
        unread.map((n) => ({
          author: n.author,
          books: filterUnownedBooks(n.books || [])
        })).filter((n) => n.books.length > 0) // Remove releases with no unowned books
      );
    } catch (e) {
      console.warn('Failed to load notifications', e);
    }
  };

  // Save an in-app notification. Returns true if saved, false if duplicate.
  const saveNotification = async (newNotification) => {
    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      const newKeys = (newNotification.books || []).map(bookIdFor).sort();

      const isDuplicate = existing.some((n) => {
        if (n.author !== newNotification.author) return false;
        const existingKeys = (n.books || []).map(bookIdFor).sort();
        if (existingKeys.length !== newKeys.length) return false;
        return existingKeys.every((k, i) => k === newKeys[i]);
      });

      if (isDuplicate) {
        return false;
      }

      existing.unshift(newNotification);
      const toSave = existing.slice(0, 50);
      await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(toSave));

      // update in-memory notifications and derived newReleases (unread)
      setNotifications(toSave);
      const unread = toSave.filter((n) => !n.read);
      setNewReleases(
        unread.map((n) => ({
          author: n.author,
          books: filterUnownedBooks(n.books || [])
        })).filter((n) => n.books.length > 0) // Remove releases with no unowned books
      );

      return true;
    } catch (e) {
      console.warn('Failed to save notification', e);
      return false;
    }
  };

  // Mark a notification as read (and update newReleases / storage)
  const markNotificationRead = async (id) => {
    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const next = existing.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(next));
      setNotifications(next);

      // recompute unread -> newReleases
      const unread = next.filter((n) => !n.read);
      setNewReleases(
        unread.map((n) => ({
          author: n.author,
          books: filterUnownedBooks(n.books || [])
        })).filter((n) => n.books.length > 0) // Remove releases with no unowned books
      );

      // optionally decrement badge - if you have a badge counter util expose a decrement function instead
      try {
        await incrementNotificationCount(); // if this increments, replace with proper decrement if available
      } catch (e) {
        // ignore if not applicable
      }
    } catch (e) {
      console.warn('Failed to mark notification read', e);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const next = existing.filter((n) => n.id !== id);
      await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(next));
      setNotifications(next);
      const unread = next.filter((n) => !n.read);
      setNewReleases(
        unread.map((n) => ({
          author: n.author,
          books: filterUnownedBooks(n.books || [])
        })).filter((n) => n.books.length > 0) // Remove releases with no unowned books
      );
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  };

  // ---- Authors / releases ----

  async function fetchFollowedAuthors() {
    if (!user || !user.$id) return;

    setAuthorsLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        AUTHORS_COLLECTION_ID,
        [Query.equal('userId', user.$id), Query.orderDesc('$createdAt')]
      );

      setFollowedAuthors(response.documents || []);

      // load in-app notifications and derive newReleases from unread ones
      await loadNotifications();

      // Also check for fresh releases (this will add new notifications only if they are not duplicates)
      await checkForNewReleases(response.documents || []);
    } catch (error) {
      console.error('Error fetching followed authors:', error);
    } finally {
      setAuthorsLoading(false);
    }
  }

  async function followAuthor(authorData) {
    if (!user || !user.$id) throw new Error('No user ID for following author');

    try {
      const existing = followedAuthors.find(
        (a) => a.authorName.toLowerCase() === authorData.name.toLowerCase()
      );

      if (existing) {
        throw new Error('Already following this author');
      }

      const authorDoc = {
        userId: user.$id,
        authorName: authorData.name,
        authorId: authorData.id || null,
        booksCount: authorData.booksCount || 0,
        genres: authorData.genres || [],
        lastChecked: new Date().toISOString(),
        isActive: true,
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        AUTHORS_COLLECTION_ID,
        ID.unique(),
        authorDoc,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );

      setFollowedAuthors((prev) => [result, ...prev]);
      return result;
    } catch (error) {
      console.error('Error following author:', error);
      throw error;
    }
  }

  async function unfollowAuthor(authorId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        AUTHORS_COLLECTION_ID,
        authorId
      );
      setFollowedAuthors((prev) => prev.filter((a) => a.$id !== authorId));
    } catch (error) {
      console.error('Error unfollowing author:', error);
      throw error;
    }
  }

  // Check for new releases from followed authors
  async function checkForNewReleases(authors = followedAuthors) {
    if (!authors || !authors.length) return;

    try {
      const releases = [];
      const currentYear = new Date().getFullYear();

      for (const author of authors) {
        // allow checking regardless of lastChecked — duplicates are handled by saveNotification
        try {
          const query = `inauthor:"${author.authorName}" subject:fiction`;
          const books = await searchBooks(query, 10);

          const recentBooks = books.filter((book) => {
            if (!book.publishedDate) return false;
            const publishYear = parseInt(
              book.publishedDate.substring(0, 4),
              10
            );
            return publishYear >= currentYear - 1;
          });

          // Filter out books that user already owns
          const unownedRecentBooks = filterUnownedBooks(recentBooks);

          if (unownedRecentBooks.length > 0) {
            const top = unownedRecentBooks.slice(0, 3);
            releases.push({ author: author.authorName, books: top });

            const notificationData = {
              id: `${author.$id || author.authorName}-${Date.now()}`,
              author: author.authorName,
              books: top,
              ts: new Date().toISOString(),
              read: false,
            };

            const saved = await saveNotification(notificationData);
            if (saved) {
              const titles = top
                .map((b) => b.title)
                .slice(0, 3)
                .join(', ');
              await sendLocalNotification({
                title: `${author.authorName} has new releases`,
                body: titles,
              });
              try {
                await incrementNotificationCount();
              } catch (e) {
                // ignore
              }
            }
          }
        } catch (error) {
          console.error(
            `Error checking releases for ${author.authorName}:`,
            error
          );
        }
      }

      // Merge with any currently-unread notifications to ensure UI shows unread releases
      try {
        const raw = await AsyncStorage.getItem(NOTIFS_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const unread = existing.filter((n) => !n.read);
        // prefer unread notifications for display (they may include items found earlier)
        if (unread.length > 0) {
          setNewReleases(
            unread.map((n) => ({
              author: n.author,
              books: filterUnownedBooks(n.books || [])
            })).filter((n) => n.books.length > 0) // Remove releases with no unowned books
          );
        } else {
          setNewReleases(releases); // releases already filtered above
        }
      } catch (e) {
        // fallback
        setNewReleases(releases);
      }

      return releases;
    } catch (error) {
      console.error('Error checking for new releases:', error);
    }
  }

  // Get author suggestions based on user's books
  async function getAuthorSuggestions(userBooks) {
    const authorCounts = new Map();

    // Count books by each author in user's library
    userBooks.forEach((book) => {
      const author = book.author;
      // ignore placeholder authors that may appear (support both legacy "Unknown Author" and "Unknown")
      if (author && author !== 'Unknown' && author !== 'Unknown Author') {
        const count = authorCounts.get(author) || 0;
        authorCounts.set(author, count + 1);
      }
    });

    // Filter out already followed authors
    const followedNames = new Set(
      followedAuthors.map((a) => a.authorName.toLowerCase())
    );
    const suggestions = [];

    for (const [author, bookCount] of authorCounts.entries()) {
      if (!followedNames.has(author.toLowerCase()) && bookCount >= 2) {
        suggestions.push({
          name: author,
          booksCount: bookCount,
          reason: `You have ${bookCount} books by this author`,
        });
      }
    }

    return suggestions.sort((a, b) => b.booksCount - a.booksCount).slice(0, 5);
  }

  // Real-time subscription for authors
  useEffect(() => {
    let unsubscribe;
    const channel = `databases.${DATABASE_ID}.collections.${AUTHORS_COLLECTION_ID}.documents`;

    if (user) {
      fetchFollowedAuthors();

      unsubscribe = client.subscribe(channel, (response) => {
        const { payload, events } = response;

        if (events[0].includes('create')) {
          setFollowedAuthors((prev) => [payload, ...prev]);
        }

        if (events[0].includes('update')) {
          setFollowedAuthors((prev) =>
            prev.map((author) =>
              author.$id === payload.$id ? payload : author
            )
          );
        }

        if (events[0].includes('delete')) {
          setFollowedAuthors((prev) =>
            prev.filter((author) => author.$id !== payload.$id)
          );
        }
      });
    } else {
      setFollowedAuthors([]);
      setNewReleases([]);
      setNotifications([]);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Periodic checks (kept as fallback)
  useEffect(() => {
    let interval;
    if (user && followedAuthors.length > 0) {
      interval = setInterval(() => {
        checkForNewReleases(followedAuthors).catch((e) =>
          console.warn('Periodic checkForNewReleases failed', e)
        );
      }, CHECK_INTERVAL_MS);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, followedAuthors]);

  // Update newReleases when user's book collection changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Books/readBooks/notifications changed, refreshing newReleases:', {
        booksCount: books?.length || 0,
        readBooksCount: readBooks?.length || 0,
        notificationsCount: notifications?.length || 0
      });
    }

    if (user && notifications.length > 0) {
      const unread = notifications.filter((n) => !n.read);

      const filteredReleases = unread.map((n) => ({
        author: n.author,
        books: filterUnownedBooks(n.books || [])
      })).filter((n) => n.books.length > 0); // Remove releases with no unowned books

      setNewReleases(filteredReleases);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, readBooks, notifications]); // Re-run when user's book collection or notifications change

  return (
    <AuthorContext.Provider
      value={{
        followedAuthors,
        authorsLoading,
        newReleases,
        notifications,
        followAuthor,
        unfollowAuthor,
        checkForNewReleases,
        getAuthorSuggestions,
        fetchFollowedAuthors,
        saveNotification,
        markNotificationRead,
        deleteNotification,
        loadNotifications,
      }}
    >
      {children}
    </AuthorContext.Provider>
  );
}
