import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
// Import the utility function
import * as Linking from 'expo-linking';
import Logo from '../../../assets/icon.png';
import Spacer from '../../../components/Spacer';
import ThemedButton from '../../../components/ThemedButton';
import ThemedCard from '../../../components/ThemedCard';
import ThemedLoader from '../../../components/ThemedLoader';
import ThemedText from '../../../components/ThemedText';
import ThemedView from '../../../components/ThemedView';
import { Colors } from '../../../constants/Colors';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { useBooks } from '../../../hooks/useBooks';
import {
  useResponsiveButtonStyle,
  useResponsiveButtonText,
} from '../../../hooks/useResponsive';
import { getAmazonSearchUrl } from '../../../lib/amazonLink'; // Add this import

const BookDetails = () => {
  const [book, setBook] = useState(null);

  const { id } = useLocalSearchParams();
  const { fetchBookById, deleteBook, updateBook, markAsRead } = useBooks();
  const router = useRouter();
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const { showButtonText } = useResponsiveButtonText();
  const { buttonStyle, containerStyle } = useResponsiveButtonStyle();

  // ✅ 3. All effects
  useEffect(() => {
    async function loadBook() {
      console.log('🔍 Fetching book with ID:', id);
      const bookData = await fetchBookById(id);
      console.log('📚 Full book data received:', bookData);
      console.log('📅 Published date specifically:', bookData?.publishedDate);
      console.log('📊 All date-related fields:', {
        publishedDate: bookData?.publishedDate,
        createdAt: bookData?.$createdAt,
        updatedAt: bookData?.$updatedAt,
      });
      setBook(bookData);
    }

    loadBook();

    return () => setBook(null);
  }, [id]);

  // ✅ 4. Derived values that DON'T depend on book state
  const theme = Colors[scheme || fallback] ?? Colors.light;
  // const showImage = Dimensions.get('window').width > 450;
  const screenWidth = Dimensions.get('window').width;
  const imageSize =
    screenWidth > 450 ? { width: 120, height: 160 } : { width: 70, height: 97 };

  // ✅ 5. Early returns AFTER all hooks but BEFORE book-dependent logic
  if (!book) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  // ✅ 6. Derived values that DO depend on book state (after null check)
  const isRead = book.read || !!book.readAt;

  // ✅ 7. Handler functions
  const handleMarkAsRead = async () => {
    try {
      await markAsRead(id);

      // Update local state to show the "Read!" status immediately
      setBook((prevBook) => ({
        ...prevBook,
        read: true,
        readAt: new Date().toISOString(),
      }));

      // After 2 seconds, remove from books list and navigate back
      setTimeout(() => {
        // The book will now be in readBooks list automatically
        // Navigate back to books list (book will be gone from main list)
        router.replace('/books');
      }, 2000);
    } catch (error) {
      console.error('Error marking book as read:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBook(id);
      setBook(null);
      router.replace('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleAmazon = async () => {
    try {
      // Use the imported utility function
      const amazonUrl = getAmazonSearchUrl(book.title, book.author);

      // Use Linking to open in browser instead of router.push
      const canOpen = await Linking.canOpenURL(amazonUrl);
      if (canOpen) {
        await Linking.openURL(amazonUrl);
      } else {
        console.error('Cannot open Amazon URL');
      }
    } catch (error) {
      console.error('Error opening Amazon URL:', error);
    }
  };

  // Get book image URL with fallback
  const bookImageUrl = book.thumbnail || book.coverImage;

  // ✅ 8. Main render
  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedCard style={styles.card}>
          <View style={styles.bookInfoSection}>
            <View style={styles.headerInfoSection}>
              <View>
                <ThemedText
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  title={true}
                >
                  {book.title && book.title.length > 20
                    ? book.title.slice(0, 28) + '...'
                    : book.title}
                </ThemedText>
                <ThemedText style={styles.author}>
                  Written by{' '}
                  {book.author && book.author.length > 20
                    ? book.author.slice(0, 28) + '...'
                    : book.author || 'Unknown'}
                </ThemedText>

                {/* Categories */}
                {book.publishedDate && book.publishedDate.length > 0 && (
                  <View style={styles.categoriesContainer}>
                    <ThemedText style={styles.categoriesLabel} title={true}>
                      Published:{' '}
                    </ThemedText>
                    <ThemedText style={styles.categories}>
                      {book.publishedDate?.substring?.(0, 4) || 'Unknown'}
                    </ThemedText>
                  </View>
                )}
                {/* Categories */}
                {book.categories && book.categories.length > 0 && (
                  <View style={styles.categoriesContainer}>
                    <ThemedText style={styles.categoriesLabel} title={true}>
                      Categories:{' '}
                    </ThemedText>
                    <ThemedText style={styles.categories}>
                      {book.categories}
                    </ThemedText>
                  </View>
                )}
                {/* Rating */}
                {book.averageRating > 0 && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name='star' size={16} color='#FFD700' />
                    <ThemedText style={styles.rating} title={true}>
                      {book.averageRating.toFixed(1)} ({book.ratingsCount || 0}{' '}
                      reviews)
                    </ThemedText>
                  </View>
                )}
              </View>
              {/* {showImage && */}
              {bookImageUrl ? (
                <Image
                  source={{ uri: bookImageUrl.replace('http://', 'https://') }}
                  style={[styles.bookCover, imageSize]}
                  resizeMode='cover'
                  onError={(error) => {
                    console.log(
                      'BookDetails image error:',
                      error.nativeEvent.error
                    );
                  }}
                />
              ) : (
                <Image
                  source={Logo}
                  style={[styles.bookCover, imageSize]}
                  resizeMode='contain'
                  accessibilityLabel='Placeholder Book Cover'
                  accessibilityRole='image'
                />
              )}
            </View>
          </View>

          <Spacer height={10} />
          {/* Description */}
          <ThemedText title={true} style={styles.descriptionTitle}>
            Book Description:
          </ThemedText>
          <ThemedText style={styles.description}>
            {book.description || 'No description available.'}
          </ThemedText>
          <Spacer height={20} />
          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <ThemedButton
              style={[styles.bookButton, containerStyle]}
              onPress={handleDelete}
            >
              <View style={buttonStyle}>
                {showButtonText && <ThemedText>Delete</ThemedText>}
                <Ionicons
                  name='trash-outline'
                  size={24}
                  color={Colors.warning}
                />
              </View>
            </ThemedButton>

            <ThemedButton
              style={[styles.bookButton, containerStyle]}
              onPress={handleAmazon}
            >
              <View style={buttonStyle}>
                {showButtonText && <ThemedText>Amazon</ThemedText>}
                <Ionicons name='logo-amazon' size={24} color={Colors.amazon} />
              </View>
            </ThemedButton>

            <ThemedButton
              style={[styles.bookButton, containerStyle]}
              onPress={handleMarkAsRead}
              disabled={isRead}
            >
              <View style={buttonStyle}>
                {isRead ? (
                  <>
                    {showButtonText && <ThemedText>Read!</ThemedText>}
                    <Ionicons
                      name='checkmark-circle-outline'
                      size={24}
                      color='green'
                    />
                  </>
                ) : (
                  <>
                    {showButtonText && <ThemedText>Mark Read</ThemedText>}
                    <Ionicons
                      name='bookmark-outline'
                      size={24}
                      color={Colors.amazon}
                    />
                  </>
                )}
              </View>
            </ThemedButton>
          </View>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
};

export default BookDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  card: {
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
    margin: 10,
    paddingBottom: 5,
  },
  bookInfoSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  headerInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookCover: {
    borderRadius: 8,
  },
  title: {
    letterSpacing: 1,
    fontSize: 20,
  },
  author: {
    letterSpacing: 1,
    fontSize: 16,
    marginBottom: 8,
  },
  metadata: {
    letterSpacing: 1,
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 4,
  },
  rating: {
    letterSpacing: 1,
    fontSize: 14,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  categoriesLabel: {
    letterSpacing: 1,
    fontSize: 14,
    marginBottom: 2,
  },
  categories: {
    letterSpacing: 1,
    fontSize: 14,
    marginBottom: 2,
  },
  descriptionTitle: {
    letterSpacing: 1,
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    letterSpacing: 1,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
    textAlign: 'left',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 5, // Reduced padding
    gap: 5, // Add small gap between buttons
  },
  bookButton: {
    // Simplified - let the responsive styles handle the layout
    alignItems: 'center',
    justifyContent: 'center',
  },
});
