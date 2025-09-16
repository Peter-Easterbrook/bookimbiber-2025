import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { ID, Permission, Query, Role } from 'react-native-appwrite';
import { useUser } from '../hooks/useUser';
import { client, databases } from '../lib/appwrite';
import { searchBooks } from '../lib/googleBooks';
import {
  incrementNotificationCount,
  sendLocalNotification,
} from '../lib/notifications';

const DATABASE_ID = '681e133100381d53f199';
const AUTHORS_COLLECTION_ID = 'authors'; // New collection for followed authors

export const AuthorContext = createContext();

export function AuthorProvider({ children }) {
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [newReleases, setNewReleases] = useState([]);
  const { user } = useUser();

  // Fetch followed authors
  async function fetchFollowedAuthors() {
    if (!user || !user.$id) return;

    setAuthorsLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        AUTHORS_COLLECTION_ID,
        [Query.equal('userId', user.$id), Query.orderDesc('$createdAt')]
      );

      setFollowedAuthors(response.documents);

      // After loading authors, check for new releases
      await checkForNewReleases(response.documents);
    } catch (error) {
      console.error('Error fetching followed authors:', error);
    } finally {
      setAuthorsLoading(false);
    }
  }

  // Follow an author
  async function followAuthor(authorData) {
    if (!user || !user.$id) throw new Error('No user ID for following author');

    try {
      // Check if already following
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

  // Unfollow an author
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
    if (!authors.length) return;

    try {
      const releases = [];
      const currentYear = new Date().getFullYear();

      // Check each followed author for new books
      for (const author of authors) {
        try {
          // Search for recent books by this author (last 2 years)
          const query = `inauthor:"${author.authorName}" subject:fiction`;
          const books = await searchBooks(query, 10);

          // Filter for recent releases
          const recentBooks = books.filter((book) => {
            if (!book.publishedDate) return false;
            const publishYear = parseInt(book.publishedDate.substring(0, 4));
            return publishYear >= currentYear - 1; // Last 2 years
          });

          if (recentBooks.length > 0) {
            const top = recentBooks.slice(0, 3);
            releases.push({ author: author.authorName, books: top });

            // Send immediate local notification for author
            const titles = top
              .map((b) => b.title)
              .slice(0, 3)
              .join(', ');
            // await so notification attempt happens before we continue
            await sendLocalNotification({
              title: `${author.authorName} has new releases`,
              body: titles,
            });

            // increment a simple unread count (used for badge)
            try {
              await incrementNotificationCount();
            } catch (e) {
              // ignore
            }

            // Persist a simple in-app notification history
            try {
              const key = 'bookimbiber_notifications';
              const raw = await AsyncStorage.getItem(key);
              const hist = raw ? JSON.parse(raw) : [];
              hist.unshift({
                id: `${author.$id || author.authorName}-${Date.now()}`,
                author: author.authorName,
                books: top,
                ts: new Date().toISOString(),
                read: false,
              });
              await AsyncStorage.setItem(
                key,
                JSON.stringify(hist.slice(0, 50))
              );
            } catch (e) {
              console.warn('Failed saving notification history', e);
            }
          }
        } catch (error) {
          console.error(
            `Error checking releases for ${author.authorName}:`,
            error
          );
        }
      }

      setNewReleases(releases);

      // Update last checked time for all authors
      if (releases.length > 0) {
        const updatePromises = authors.map((author) =>
          databases.updateDocument(
            DATABASE_ID,
            AUTHORS_COLLECTION_ID,
            author.$id,
            {
              lastChecked: new Date().toISOString(),
            }
          )
        );
        await Promise.allSettled(updatePromises);
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
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Check for new releases periodically (once per day)
  useEffect(() => {
    if (followedAuthors.length > 0) {
      const checkReleases = async () => {
        try {
          const lastCheck = await AsyncStorage.getItem('lastReleaseCheck');
          const now = new Date();
          const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          if (!lastCheck || new Date(lastCheck) < dayAgo) {
            checkForNewReleases();
            await AsyncStorage.setItem('lastReleaseCheck', now.toISOString());
          }
        } catch (error) {
          console.error('Error checking release storage:', error);
        }
      };

      checkReleases();
    }
  }, [followedAuthors]);

  return (
    <AuthorContext.Provider
      value={{
        followedAuthors,
        authorsLoading,
        newReleases,
        followAuthor,
        unfollowAuthor,
        checkForNewReleases,
        getAuthorSuggestions,
        fetchFollowedAuthors,
      }}
    >
      {children}
    </AuthorContext.Provider>
  );
}
