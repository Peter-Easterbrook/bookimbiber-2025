import { createContext, useEffect, useState } from 'react';
import { ID, Permission, Query, Role } from 'react-native-appwrite';
import { useUser } from '../hooks/useUser';
import { client, databases } from '../lib/appwrite';

const DATABASE_ID = '681e133100381d53f199';
const COLLECTION_ID = '681e13450007197b1942';

export const BooksContext = createContext();

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]); // Only unread books
  const [readBooks, setReadBooks] = useState([]); // Only read books
  const [booksLoading, setBooksLoading] = useState(false);
  const { user } = useUser();

  async function fetchBooks() {
    if (!user || !user.$id) return;

    setBooksLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      // Separate books into read and unread
      const allBooks = response.documents;
      const unreadBooks = allBooks.filter((book) => !book.read && !book.readAt);
      const booksAlreadyRead = allBooks.filter(
        (book) => book.read || book.readAt
      );

      // Sort read books by readAt date, descending
      booksAlreadyRead.sort((a, b) => new Date(b.readAt) - new Date(a.readAt));

      setBooks(unreadBooks);
      setReadBooks(booksAlreadyRead);
    } catch (error) {
      console.error(error.message);
    } finally {
      setBooksLoading(false);
    }
  }

  async function fetchBookById(id) {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id
      );

      return response;
    } catch (error) {
      console.log(error.message);
    }
  }
  async function createBook(data) {
    if (!user || !user.$id) throw new Error('No user ID for book creation');
    try {
      // Filter data to only include the fields we support
      const filteredData = {
        title: data.title,
        author: data.author,
        description: data.description,
        userId: user.$id,
        read: data.read || false,
        // Optional Google Books fields (only if they exist in the database)
        ...(data.categories && { categories: data.categories }),
        ...(data.publishedDate && { publishedDate: data.publishedDate }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.averageRating && { averageRating: data.averageRating }),
        ...(data.ratingsCount !== undefined && {
          ratingsCount: data.ratingsCount,
        }),
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        filteredData,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );

      return result;
    } catch (error) {
      console.error('Error creating book:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response,
      });

      // If it's a database schema error, try creating with basic fields only
      if (error.message.includes('attribute') || error.code === 400) {
        try {
          const basicData = {
            title: data.title,
            author: data.author,
            description: data.description,
            userId: user.$id,
            read: data.read || false,
          };

          const basicResult = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            basicData,
            [
              Permission.read(Role.user(user.$id)),
              Permission.update(Role.user(user.$id)),
              Permission.delete(Role.user(user.$id)),
            ]
          );

          return basicResult;
        } catch (basicError) {
          console.error('Error creating book with basic fields:', basicError);
          throw basicError;
        }
      }

      throw error;
    }
  }

  async function updateBook(id, data) {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
    } catch (err) {
      console.error(err);
    }
  }

  async function markAsRead(id) {
    try {
      const readAt = new Date().toISOString();
      await updateBook(id, { read: true, readAt });

      // Find the book being marked as read
      const bookToMove = books.find((book) => book.$id === id);
      if (bookToMove) {
        const updatedBook = { ...bookToMove, read: true, readAt };

        // Update books state immediately to show "Read!" status
        setBooks((prevBooks) =>
          prevBooks.map((book) => (book.$id === id ? updatedBook : book))
        );

        // After 2 seconds, only remove from books - let real-time subscription handle readBooks
        setTimeout(() => {
          setBooks((prevBooks) => prevBooks.filter((book) => book.$id !== id));
          // ❌ Remove this line - don't manually add to readBooks
          // setReadBooks((prevReadBooks) => [...prevReadBooks, updatedBook]);
        }, 2000);
      }
    } catch (error) {
      console.error('Error marking book as read:', error);
      throw error;
    }
  }

  async function deleteBook(id) {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);

      // Remove from both arrays
      setBooks((prevBooks) => prevBooks.filter((book) => book.$id !== id));
      setReadBooks((prevReadBooks) =>
        prevReadBooks.filter((book) => book.$id !== id)
      );
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }

  async function deleteBooks() {
    if (!user) {
      throw new Error('No user is currently logged in');
    }

    try {
      setBooksLoading(true);

      // Check if there are books to delete
      if (!books || books.length === 0) {
        console.log('No books to delete');
        return;
      }

      // Delete each book with proper error handling for IDs
      const promises = books.map((book) => {
        if (!book.$id) {
          console.error('Missing document ID for book:', book);
          return Promise.resolve(); // Skip this book
        }
        return databases.deleteDocument(DATABASE_ID, COLLECTION_ID, book.$id);
      });

      await Promise.all(promises);

      // Clear the local state
      setBooks([]);
      setReadBooks && setReadBooks([]);
    } catch (error) {
      console.error('Error deleting books:', error);
      throw new Error('Failed to delete books. Please try again.');
    } finally {
      setBooksLoading(false);
    }
  }

  // Update the real-time subscription to handle both arrays
  useEffect(() => {
    let unsubscribe;
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

    if (user) {
      fetchBooks();

      unsubscribe = client.subscribe(channel, (response) => {
        const { payload, events } = response;

        if (events[0].includes('create')) {
          // New books are always unread
          setBooks((prevBooks) => [...prevBooks, payload]);
        }

        if (events[0].includes('update')) {
          const isRead = payload.read || payload.readAt;

          if (isRead) {
            // Move from books to readBooks
            setBooks((prevBooks) =>
              prevBooks.filter((book) => book.$id !== payload.$id)
            );
            setReadBooks((prevReadBooks) => {
              const exists = prevReadBooks.some(
                (book) => book.$id === payload.$id
              );
              if (exists) {
                return prevReadBooks.map((book) =>
                  book.$id === payload.$id ? payload : book
                );
              }
              // Add new read book to the beginning of the list
              return [payload, ...prevReadBooks];
            });
          } else {
            // Update in books array
            setBooks((prevBooks) =>
              prevBooks.map((book) =>
                book.$id === payload.$id ? payload : book
              )
            );
          }
        }

        if (events[0].includes('delete')) {
          setBooks((prevBooks) =>
            prevBooks.filter((book) => book.$id !== payload.$id)
          );
          setReadBooks((prevReadBooks) =>
            prevReadBooks.filter((book) => book.$id !== payload.$id)
          );
        }
      });
    } else {
      setBooks([]);
      setReadBooks([]);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return (
    <BooksContext.Provider
      value={{
        books,
        readBooks, // Add readBooks to context
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
