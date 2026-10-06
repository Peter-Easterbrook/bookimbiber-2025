import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { db, fromSnapshot, userCollection, userDoc } from '../lib/firebase';

export const BooksContext = createContext();

const isRead = (book) => book.read || !!book.readAt;

// How long a just-read book stays in the unread list showing "Read!"
const READ_DISPLAY_MS = 2000;

export function BooksProvider({ children }) {
  const [allBooks, setAllBooks] = useState([]);
  const [recentlyRead, setRecentlyRead] = useState([]); // ids still shown as "Read!"
  const [booksLoading, setBooksLoading] = useState(false);
  const { user } = useUser();
  const uid = user?.id;

  const booksQuery = () =>
    query(userCollection(uid, 'books'), orderBy('createdAt', 'desc'));

  // Unread books, newest first; just-read books linger here briefly
  const books = useMemo(
    () =>
      allBooks.filter((book) => !isRead(book) || recentlyRead.includes(book.id)),
    [allBooks, recentlyRead]
  );

  // Read books, most recently finished first
  const readBooks = useMemo(
    () =>
      allBooks
        .filter((book) => isRead(book) && !recentlyRead.includes(book.id))
        .sort((a, b) => new Date(b.readAt) - new Date(a.readAt)),
    [allBooks, recentlyRead]
  );

  async function fetchBooks() {
    if (!uid) return;

    setBooksLoading(true);
    try {
      const snapshot = await getDocs(booksQuery());
      setAllBooks(snapshot.docs.map(fromSnapshot));
    } catch (error) {
      console.error(error.message);
    } finally {
      setBooksLoading(false);
    }
  }

  async function fetchBookById(id) {
    if (!uid) return;
    try {
      const snapshot = await getDoc(userDoc(uid, 'books', id));
      return snapshot.exists() ? fromSnapshot(snapshot) : undefined;
    } catch (error) {
      console.log(error.message);
    }
  }

  async function createBook(data) {
    if (!uid) throw new Error('No user ID for book creation');
    try {
      // Filter data to only include the fields we support
      const filteredData = {
        title: data.title,
        author: data.author,
        description: data.description,
        read: data.read || false,
        createdAt: serverTimestamp(),
        // Optional Google Books fields
        ...(data.googleBooksId && { googleBooksId: data.googleBooksId }),
        ...(data.categories && { categories: data.categories }),
        ...(data.publishedDate && { publishedDate: data.publishedDate }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.averageRating && { averageRating: data.averageRating }),
        ...(data.ratingsCount !== undefined && {
          ratingsCount: data.ratingsCount,
        }),
        ...(data.language && { language: data.language }),
        ...(data.pageCount && { pageCount: data.pageCount }),
      };

      const ref = await addDoc(userCollection(uid, 'books'), filteredData);
      return { id: ref.id, ...filteredData };
    } catch (error) {
      console.error('Error creating book:', error.code, error.message);
      throw error;
    }
  }

  async function updateBook(id, data) {
    if (!uid) return;
    try {
      await updateDoc(userDoc(uid, 'books', id), data);
    } catch (err) {
      console.error(err);
    }
  }

  async function markAsRead(id) {
    try {
      // Keep the book in the unread list showing "Read!" for a moment
      setRecentlyRead((prev) => [...prev, id]);
      setTimeout(() => {
        setRecentlyRead((prev) => prev.filter((bookId) => bookId !== id));
      }, READ_DISPLAY_MS);

      await updateBook(id, { read: true, readAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error marking book as read:', error);
      throw error;
    }
  }

  async function deleteBook(id) {
    if (!uid) return;
    try {
      await deleteDoc(userDoc(uid, 'books', id));
      // The snapshot listener also removes it; this just makes it instant
      setAllBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  // Deletes all of the user's books, read and unread
  async function deleteBooks() {
    if (!uid) {
      throw new Error('No user is currently logged in');
    }

    try {
      setBooksLoading(true);

      const snapshot = await getDocs(userCollection(uid, 'books'));
      if (snapshot.empty) {
        console.log('No books to delete');
        return;
      }

      // A batch holds up to 500 writes
      for (let i = 0; i < snapshot.docs.length; i += 500) {
        const batch = writeBatch(db);
        snapshot.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }

      setAllBooks([]);
    } catch (error) {
      console.error('Error deleting books:', error);
      throw new Error('Failed to delete books. Please try again.');
    } finally {
      setBooksLoading(false);
    }
  }

  // Live listener: Firestore pushes every add/update/delete for this user's books
  useEffect(() => {
    if (!uid) {
      setAllBooks([]);
      setRecentlyRead([]);
      return;
    }

    setBooksLoading(true);
    const unsubscribe = onSnapshot(
      booksQuery(),
      (snapshot) => {
        setAllBooks(snapshot.docs.map(fromSnapshot));
        setBooksLoading(false);
      },
      (error) => {
        console.error('Books listener error:', error.code, error.message);
        setBooksLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  return (
    <BooksContext.Provider
      value={{
        books,
        readBooks,
        booksLoading,
        fetchBooks,
        fetchBookById,
        createBook,
        deleteBook,
        updateBook,
        markAsRead,
        deleteBooks,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}
