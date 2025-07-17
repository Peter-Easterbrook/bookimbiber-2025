import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useBooks } from '../../hooks/useBooks';

import BookSearchModal from '../../components/BookSearchModal';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import ThemedLogo from '../../components/ThemedLogo';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';

const Create = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const { createBook } = useBooks();
  const router = useRouter();
  async function handleSubmit() {
    setError(null);
    if (!title.trim() || !author.trim() || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (description.length > 500) {
      setError('Max input 500 characters.');
      return;
    }
    setLoading(true); // create the book with additional metadata if available
    try {
      const bookData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        read: false,
        // Include only the supported Google Books fields
        ...(selectedBook && {
          categories: selectedBook.categories,
          thumbnail: selectedBook.thumbnail,
          averageRating: selectedBook.averageRating,
          ratingsCount: selectedBook.ratingsCount,
          publishedDate: selectedBook.publishedDate?.substring(0, 4) || null,
        }),
      };

      console.log('📚 Sending book data to createBook:', bookData);
      console.log('📊 Google Books metadata being sent:', {
        hasCategories: !!selectedBook?.categories,
        hasThumbnail: !!selectedBook?.thumbnail,
        hasAverageRating: selectedBook?.averageRating !== undefined,
        hasRatingsCount: selectedBook?.ratingsCount !== undefined,
        hasPublishedDate: !!selectedBook?.publishedDate,
        categories: selectedBook?.categories,
        thumbnail: selectedBook?.thumbnail,
        averageRating: selectedBook?.averageRating,
        ratingsCount: selectedBook?.ratingsCount,
        publishedDate: selectedBook?.publishedDate,
      });

      const result = await createBook(bookData);
      console.log('Book creation result:', result);

      // Show success message if book was created with basic fields only
      if (
        selectedBook &&
        result &&
        !result.categories &&
        selectedBook.categories
      ) {
        setError(
          'Book created successfully, but some Google Books metadata could not be saved due to database limitations.'
        );
      }
    } catch (e) {
      console.error('Create book error:', e);
      let errorMessage = e.message;

      // Provide more user-friendly error messages
      if (errorMessage.includes('attribute')) {
        errorMessage =
          'Some book information could not be saved due to database limitations. The book was created with basic information only.';
      } else if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch')
      ) {
        errorMessage =
          'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('permission')) {
        errorMessage =
          'You do not have permission to create books. Please contact support.';
      }

      setError(errorMessage);
      setLoading(false);
      return;
    }

    // reset fields
    setTitle('');
    setAuthor('');
    setDescription('');
    setSelectedBook(null);

    // redirect
    router.replace('/books');

    // reset loading state
    setLoading(false);
  }
  const handleBookSelect = (book) => {
    if (!book) return;
    setSelectedBook(book);
    setTitle(book.title?.trim() || '');
    setAuthor(book.author?.trim() || '');

    // Limit description to 497 characters with ellipsis
    const bookDescription = book.description || '';
    const limitedDescription =
      bookDescription.length > 300
        ? bookDescription.substring(0, 295) + '...'
        : bookDescription;

    setDescription(limitedDescription);
    setError(null);
    setShowSearchModal(false);
    Keyboard.dismiss();
  };

  const handleDescriptionChange = (text) => {
    // Limit manual input to 300 characters total
    if (text.length <= 300) {
      setDescription(text);
    } else {
      // If text exceeds 300 characters, truncate and add ellipsis
      const truncatedText = text.substring(0, 295) + '...';
      setDescription(truncatedText);
    }
  };

  const clearSelectedBook = () => {
    setSelectedBook(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setError(null);
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }} // ← make the scrollview full-width
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerIconBlock}>
            <Spacer height={10} />
            <ThemedLogo width={200} height={200} />
            <Spacer height={10} />
            <ThemedText title={true} style={styles.title}>
              Add a New Book
            </ThemedText>
          </View>
          <Spacer height={20} />

          {/* Book Search Section */}
          <View style={styles.searchSection}>
            <ThemedButton
              onPress={() => setShowSearchModal(true)}
              style={styles.iconButton}
            >
              <ThemedText>Search books</ThemedText>
              <Ionicons name='search' size={24} color={theme.iconColor} />
            </ThemedButton>

            {selectedBook && (
              <ThemedCard style={styles.selectedBookCard}>
                <View style={styles.selectedBookContent}>
                  <View style={styles.selectedBookInfo}>
                    <ThemedText
                      style={styles.selectedBookTitle}
                      numberOfLines={2}
                    >
                      {selectedBook.title}
                    </ThemedText>
                    <ThemedText style={styles.selectedBookData}>
                      By {selectedBook.author}
                    </ThemedText>
                    <ThemedText style={styles.selectedBookData}>
                      Published:{' '}
                      {selectedBook.publishedDate?.substring(0, 4) || 'Unknown'}
                    </ThemedText>
                    <ThemedText style={styles.selectedBookData}>
                      Category: {selectedBook.categories || 'N/A'}
                    </ThemedText>
                  </View>
                  {(selectedBook.thumbnail || selectedBook.coverImage) && (
                    <Image
                      source={{
                        uri: selectedBook.thumbnail || selectedBook.coverImage,
                      }}
                      style={styles.selectedBookCover}
                      resizeMode='cover'
                    />
                  )}
                </View>
                <Spacer height={16} />
                <View style={styles.selectedBookHeader}>
                  <ThemedText style={styles.selectedBookLabel}>
                    Delete selection:
                  </ThemedText>
                  <Pressable
                    onPress={clearSelectedBook}
                    style={styles.clearButton}
                  >
                    <Ionicons
                      name='trash-outline'
                      size={24}
                      color={theme.iconColor}
                    />
                  </Pressable>
                </View>
              </ThemedCard>
            )}
          </View>
          <Spacer height={10} />
          <View style={styles.inputSection}>
            <ThemedTextInput
              style={styles.input}
              placeholder='Add title...'
              value={title}
              onChangeText={setTitle}
              autoCapitalize='words'
            />
            <Spacer height={10} />
            <ThemedTextInput
              style={styles.input}
              placeholder='Add author...'
              value={author}
              onChangeText={setAuthor}
              autoCapitalize='words'
            />
            <Spacer height={10} />
            <ThemedTextInput
              style={styles.multiline}
              placeholder='Add description...'
              value={description}
              onChangeText={handleDescriptionChange}
              multiline={true}
              textAlignVertical='top'
              maxLength={300}
            />
            <View style={styles.characterCounter}>
              <ThemedText style={styles.counterText}>
                {description.length}/300 characters
              </ThemedText>
            </View>
            <Spacer height={10} />
            <ThemedButton
              onPress={handleSubmit}
              disabled={loading}
              style={[
                {
                  alignSelf: 'flex-end',
                },
                styles.iconButton,
              ]}
            >
              <ThemedText>{loading ? 'Saving...' : 'Create book'}</ThemedText>
              <MaterialCommunityIcons
                size={24}
                name='book-edit-outline'
                color={theme.iconColor}
              />
            </ThemedButton>
          </View>

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}
          <Spacer />
        </ScrollView>

        {/* Book Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType='slide'
          presentationStyle='pageSheet'
        >
          <BookSearchModal
            visible={showSearchModal}
            onClose={() => setShowSearchModal(false)}
            onBookSelect={handleBookSelect}
            theme={theme}
          />
        </Modal>
      </ThemedView>
    </Pressable>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  scrollContent: {
    width: '100%', // make content container full-width
    alignItems: 'center', // but center its children
    paddingHorizontal: 20, // add horizontal padding for better spacing
  },
  headerIconBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  searchSection: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  iconButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchButtonText: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 16,
  },
  selectedBookCard: {
    marginTop: 12,
    padding: 12,
    paddingBottom: 0,
  },
  selectedBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedBookLabel: {
    letterSpacing: 1,
    fontSize: 12,
    opacity: 0.9,
  },
  clearButton: {
    padding: 4,
  },
  selectedBookContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectedBookCover: {
    width: 50,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedBookInfo: {
    flex: 1,
  },
  selectedBookTitle: {
    fontFamily: 'berlin-sans-fb-bold',
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectedBookData: {
    letterSpacing: 1,
    fontSize: 13,
    opacity: 0.9,
    marginBottom: 4,
  },
  inputSection: {
    width: '100%',
    maxWidth: 500,
  },
  input: {
    letterSpacing: 1,
    fontSize: 16,
  },
  multiline: {
    letterSpacing: 1,
    minHeight: 100,
    fontFamily: 'berlin-sans-fb',
    opacity: 1.1,
    // Removed marginHorizontal to match searchSection width
  },
  characterCounter: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  counterText: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 12,
    opacity: 0.6,
  },
  error: {
    maxWidth: 400,
    color: Colors.warning,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginTop: 20,
    borderWidth: 0.5,
    borderRadius: 5,
    letterSpacing: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.warningBackground,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
});
