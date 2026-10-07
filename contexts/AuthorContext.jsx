import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useUser } from '../hooks/useUser';
import { fromSnapshot, userCollection, userDoc } from '../lib/firebase';
import { searchBooksByAuthor } from '../lib/googleBooks';
import {
  incrementNotificationCount,
  sendLocalNotification,
} from '../lib/notifications';
import { Debouncer } from '../utils/api-cache';
import { BooksContext } from './BooksContext';

export const AuthorContext = createContext();

// Create debouncer for refresh functionality (1 hour cooldown)
const refreshDebouncer = new Debouncer(60 * 60 * 1000);

export function AuthorProvider({ children }) {
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [newReleases, setNewReleases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const uid = user?.id;
  const { books, readBooks } = useContext(BooksContext) || {
    books: [],
    readBooks: [],
  };

  const normalizeForId = (s = '') =>
    s
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const bookIdFor = (b) => {
    if (!b) return '';

    if (b.googleBooksId) {
      return `gbid:${String(b.googleBooksId)}`;
    }

    const title = normalizeForId(b.title || '');
    const author = normalizeForId(b.author || '');
    const year = (b.publishedDate || '').toString().substring(0, 4);

    return `title:${title}|author:${author}|year:${year}`;
  };

  const isBookOwned = (book) => {
    const bookId = bookIdFor(book);
    const allUserBooks = [...(books || []), ...(readBooks || [])];

    const isOwned = allUserBooks.some((ownedBook) => {
      const ownedBookId = bookIdFor(ownedBook);

      if (ownedBookId === bookId) return true;

      if (book.googleBooksId && !ownedBook.googleBooksId) {
        const fallbackNewId = `title:${normalizeForId(book.title || '')}|author:${normalizeForId(book.author || '')}|year:${(book.publishedDate || '').toString().substring(0, 4)}`;
        if (ownedBookId === fallbackNewId) return true;
      }

      if (!book.googleBooksId && ownedBook.googleBooksId) {
        const fallbackOwnedId = `title:${normalizeForId(ownedBook.title || '')}|author:${normalizeForId(ownedBook.author || '')}|year:${(ownedBook.publishedDate || '').toString().substring(0, 4)}`;
        if (bookId === fallbackOwnedId) return true;
      }

      return false;
    });

    return isOwned;
  };

  const filterUnownedBooks = (bookList) => {
    const filtered = bookList.filter((book) => !isBookOwned(book));
    return filtered;
  };

  // ---- Notifications storage helpers ----
  const NOTIFS_KEY = (userId) => `bookimbiber_notifications_${userId}`;

  const authorsQuery = () =>
    query(userCollection(uid, 'authors'), orderBy('createdAt', 'desc'));

  const loadNotifications = async () => {
    if (!uid) {
      setNotifications([]);
      setNewReleases([]);
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY(uid));
      const existing = raw ? JSON.parse(raw) : [];
      setNotifications(existing);
      const unread = existing.filter((n) => !n.read);
      setNewReleases(
        unread
          .map((n) => ({
            author: n.author,
            books: filterUnownedBooks(n.books || []),
          }))
          .filter((n) => n.books.length > 0)
      );
    } catch (e) {
      console.warn('Failed to load notifications', e);
    }
  };

  const saveNotification = async (newNotification) => {
    if (!uid) return false;

    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY(uid));
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
      await AsyncStorage.setItem(NOTIFS_KEY(uid), JSON.stringify(toSave));

      setNotifications(toSave);
      const unread = toSave.filter((n) => !n.read);
      setNewReleases(
        unread
          .map((n) => ({
            author: n.author,
            books: filterUnownedBooks(n.books || []),
          }))
          .filter((n) => n.books.length > 0)
      );

      return true;
    } catch (e) {
      console.warn('Failed to save notification', e);
      return false;
    }
  };

  const markNotificationRead = async (id) => {
    if (!uid) return;

    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY(uid));
      const existing = raw ? JSON.parse(raw) : [];
      const next = existing.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(NOTIFS_KEY(uid), JSON.stringify(next));
      setNotifications(next);

      const unread = next.filter((n) => !n.read);
      setNewReleases(
        unread
          .map((n) => ({
            author: n.author,
            books: filterUnownedBooks(n.books || []),
          }))
          .filter((n) => n.books.length > 0)
      );
    } catch (e) {
      console.warn('Failed to mark notification read', e);
    }
  };

  const deleteNotification = async (id) => {
    if (!uid) return;

    try {
      const raw = await AsyncStorage.getItem(NOTIFS_KEY(uid));
      const existing = raw ? JSON.parse(raw) : [];
      const next = existing.filter((n) => n.id !== id);
      await AsyncStorage.setItem(NOTIFS_KEY(uid), JSON.stringify(next));
      setNotifications(next);
      const unread = next.filter((n) => !n.read);
      setNewReleases(
        unread
          .map((n) => ({
            author: n.author,
            books: filterUnownedBooks(n.books || []),
          }))
          .filter((n) => n.books.length > 0)
      );
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  };

  // ---- Authors / releases ----

  async function fetchFollowedAuthors() {
    if (!uid) return;

    setAuthorsLoading(true);
    try {
      const snapshot = await getDocs(authorsQuery());
      setFollowedAuthors(snapshot.docs.map(fromSnapshot));
      await loadNotifications();

      // Don't automatically check on load - let user trigger it
      // This reduces API calls on app startup
    } catch (error) {
      console.error('Error fetching followed authors:', error);
    } finally {
      setAuthorsLoading(false);
    }
  }

  async function followAuthor(authorData) {
    if (!uid) throw new Error('No user ID for following author');

    try {
      const existing = followedAuthors.find(
        (a) => a.authorName.toLowerCase() === authorData.name.toLowerCase()
      );

      if (existing) {
        throw new Error('Already following this author');
      }

      const authorDoc = {
        authorName: authorData.name,
        authorId: authorData.id || null,
        booksCount: authorData.booksCount || 0,
        genres: authorData.genres || [],
        lastChecked: new Date().toISOString(),
        isActive: true,
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(userCollection(uid, 'authors'), authorDoc);
      // The snapshot listener adds it to followedAuthors
      return { id: ref.id, ...authorDoc };
    } catch (error) {
      console.error('Error following author:', error);
      throw error;
    }
  }

  async function unfollowAuthor(authorId) {
    try {
      await deleteDoc(userDoc(uid, 'authors', authorId));
      setFollowedAuthors((prev) => prev.filter((a) => a.id !== authorId));
    } catch (error) {
      console.error('Error unfollowing author:', error);
      throw error;
    }
  }

  /**
   * Check for new releases - NOW WITH DEBOUNCING
   * Can be called manually or automatically
   */
  async function checkForNewReleases(
    authors = followedAuthors,
    forceRefresh = false
  ) {
    if (!authors || !authors.length || !uid) return;

    // Check debouncer unless force refresh
    if (!forceRefresh) {
      const debounceKey = `check-releases-${uid}`;
      if (!refreshDebouncer.canProceed(debounceKey)) {
        const remainingMs = refreshDebouncer.getRemainingTime(debounceKey);
        console.log(
          `⏰ Skipping check - ${Math.ceil(remainingMs / 60000)} minutes until next allowed check`
        );
        return;
      }
      refreshDebouncer.markCalled(debounceKey);
    }

    console.log('🔍 Checking for new releases from', authors.length, 'authors');

    try {
      const releases = [];
      const currentYear = new Date().getFullYear();

      // Process authors in batches to avoid overwhelming the API
      const BATCH_SIZE = 3;
      for (let i = 0; i < authors.length; i += BATCH_SIZE) {
        const batch = authors.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (author) => {
            try {
              // Use the new cached searchBooksByAuthor function
              const books = await searchBooksByAuthor(author.authorName, 10);

              const recentBooks = books.filter((book) => {
                if (!book.publishedDate) return false;
                const publishYear = parseInt(
                  book.publishedDate.substring(0, 4),
                  10
                );
                return publishYear >= currentYear - 1;
              });

              const unownedRecentBooks = filterUnownedBooks(recentBooks);

              if (unownedRecentBooks.length > 0) {
                const top = unownedRecentBooks.slice(0, 3);
                releases.push({ author: author.authorName, books: top });

                const notificationData = {
                  id: `${author.id || author.authorName}-${Date.now()}`,
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
          })
        );

        // Add a small delay between batches to be nice to the API
        if (i + BATCH_SIZE < authors.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      try {
        const raw = await AsyncStorage.getItem(NOTIFS_KEY(uid));
        const existing = raw ? JSON.parse(raw) : [];
        const unread = existing.filter((n) => !n.read);
        if (unread.length > 0) {
          setNewReleases(
            unread
              .map((n) => ({
                author: n.author,
                books: filterUnownedBooks(n.books || []),
              }))
              .filter((n) => n.books.length > 0)
          );
        } else {
          setNewReleases(releases);
        }
      } catch (e) {
        setNewReleases(releases);
      }

      console.log(
        '✅ Finished checking for new releases. Found:',
        releases.length
      );
      return releases;
    } catch (error) {
      console.error('Error checking for new releases:', error);
    }
  }

  async function getAuthorSuggestions(userBooks) {
    const authorCounts = new Map();

    userBooks.forEach((book) => {
      const author = book.author;
      if (author && author !== 'Unknown' && author !== 'Unknown Author') {
        const count = authorCounts.get(author) || 0;
        authorCounts.set(author, count + 1);
      }
    });

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

  // Live listener: Firestore pushes every follow/unfollow for this user
  useEffect(() => {
    if (!uid) {
      console.log('No user, clearing all author data');
      setFollowedAuthors([]);
      setNewReleases([]);
      setNotifications([]);
      return;
    }

    loadNotifications();
    const unsubscribe = onSnapshot(
      authorsQuery(),
      (snapshot) => {
        setFollowedAuthors(snapshot.docs.map(fromSnapshot));
      },
      (error) => {
        console.error('Authors listener error:', error.code, error.message);
      }
    );

    return unsubscribe;
  }, [uid]);

  // REMOVED: Automatic periodic checks
  // Users will trigger checks manually via the refresh button
  // This dramatically reduces API usage

  // Update newReleases when user's book collection changes
  useEffect(() => {
    if (user && notifications.length > 0) {
      const unread = notifications.filter((n) => !n.read);

      const filteredReleases = unread
        .map((n) => ({
          author: n.author,
          books: filterUnownedBooks(n.books || []),
        }))
        .filter((n) => n.books.length > 0);

      setNewReleases(filteredReleases);
    } else if (!user) {
      setNewReleases([]);
    }
  }, [books, readBooks, notifications, user]);

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
