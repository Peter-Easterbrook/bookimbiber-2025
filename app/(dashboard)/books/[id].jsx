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
import CachedImage from '../../../components/CachedImage';
import { Colors } from '../../../constants/Colors';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { useBooks } from '../../../hooks/useBooks';
import {
  useResponsiveButtonStyle,
  useResponsiveButtonText,
} from '../../../hooks/useResponsive';
// themed components
import * as Linking from 'expo-linking';
import { getLocales } from 'expo-localization';
import Logo from '../../../assets/icon.png';
import Spacer from '../../../components/Spacer';
import ThemedButton from '../../../components/ThemedButton';
import ThemedCard from '../../../components/ThemedCard';
import ThemedLoader from '../../../components/ThemedLoader';
import ThemedText from '../../../components/ThemedText';
import ThemedView from '../../../components/ThemedView';

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
    screenWidth > 450
      ? { width: 120, height: 160 }
      : { width: 80, height: 107 };

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

  const getAmazonDomain = () => {
    const locales = getLocales();
    const countryCode = locales[0]?.regionCode?.toLowerCase() || 'us';

    const amazonDomains = {
      // Americas
      us: 'amazon.com',
      ca: 'amazon.ca',
      mx: 'amazon.com.mx',
      br: 'amazon.com.br',

      // Europe - Major Amazon stores
      gb: 'amazon.co.uk',
      de: 'amazon.de',
      fr: 'amazon.fr',
      it: 'amazon.it',
      es: 'amazon.es',
      nl: 'amazon.nl',
      pl: 'amazon.pl',
      se: 'amazon.se',
      tr: 'amazon.com.tr',

      // European countries that use German Amazon
      at: 'amazon.de', // 🔥 Austria uses German Amazon
      ch: 'amazon.de', // Switzerland (German-speaking) uses German Amazon
      li: 'amazon.de', // Liechtenstein uses German Amazon
      lu: 'amazon.de', // Luxembourg uses German Amazon

      // European countries that use UK Amazon
      ie: 'amazon.co.uk', // Ireland uses UK Amazon

      // European countries that use French Amazon
      be: 'amazon.fr', // Belgium (French-speaking) uses French Amazon
      mc: 'amazon.fr', // Monaco uses French Amazon

      // European countries that use Italian Amazon
      sm: 'amazon.it', // San Marino uses Italian Amazon
      va: 'amazon.it', // Vatican uses Italian Amazon

      // European countries that use Spanish Amazon
      ad: 'amazon.es', // Andorra uses Spanish Amazon
      pt: 'amazon.es', // Portugal often uses Spanish Amazon

      // Nordic countries that use Swedish Amazon
      no: 'amazon.se', // Norway uses Swedish Amazon
      dk: 'amazon.se', // Denmark uses Swedish Amazon
      fi: 'amazon.se', // Finland uses Swedish Amazon
      is: 'amazon.se', // Iceland uses Swedish Amazon

      // Other European countries default to German Amazon (largest EU market)
      cz: 'amazon.de', // Czech Republic
      sk: 'amazon.de', // Slovakia
      hu: 'amazon.de', // Hungary
      si: 'amazon.de', // Slovenia
      hr: 'amazon.de', // Croatia
      bg: 'amazon.de', // Bulgaria
      ro: 'amazon.de', // Romania
      ee: 'amazon.de', // Estonia
      lv: 'amazon.de', // Latvia
      lt: 'amazon.de', // Lithuania
      mt: 'amazon.de', // Malta
      cy: 'amazon.de', // Cyprus

      // Middle East & Africa
      ae: 'amazon.ae',
      sa: 'amazon.sa',
      eg: 'amazon.ae', // Egypt uses UAE Amazon
      kw: 'amazon.ae', // Kuwait uses UAE Amazon
      qa: 'amazon.ae', // Qatar uses UAE Amazon
      bh: 'amazon.ae', // Bahrain uses UAE Amazon
      om: 'amazon.ae', // Oman uses UAE Amazon
      jo: 'amazon.ae', // Jordan uses UAE Amazon
      lb: 'amazon.ae', // Lebanon uses UAE Amazon

      // Asia Pacific
      in: 'amazon.in',
      jp: 'amazon.co.jp',
      cn: 'amazon.cn',
      au: 'amazon.com.au',
      nz: 'amazon.com.au', // New Zealand uses Australian Amazon
      sg: 'amazon.sg',

      // Asian countries that typically use Singapore Amazon
      my: 'amazon.sg', // Malaysia
      th: 'amazon.sg', // Thailand
      ph: 'amazon.sg', // Philippines
      id: 'amazon.sg', // Indonesia
      vn: 'amazon.sg', // Vietnam
      hk: 'amazon.sg', // Hong Kong
      tw: 'amazon.sg', // Taiwan
      kr: 'amazon.sg', // South Korea (until they get their own)
    };

    const domain = amazonDomains[countryCode] || 'amazon.com';

    return domain;
  };

  const handleAmazon = async () => {
    try {
      const amazonDomain = getAmazonDomain();
      const searchQuery = `${encodeURIComponent(
        book.title
      )} ${encodeURIComponent(book.author)}`;
      const amazonUrl = `https://www.${amazonDomain}/s?k=${searchQuery}`;

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
                >
                  {book.title && book.title.length > 20
                    ? book.title.slice(0, 30) + '...'
                    : book.title}
                </ThemedText>
                <ThemedText style={styles.author}>
                  Written by {book.author}
                </ThemedText>

                {/* Categories */}
                {book.publishedDate && book.publishedDate.length > 0 && (
                  <View style={styles.categoriesContainer}>
                    <ThemedText style={styles.categoriesLabel}>
                      Published:{' '}
                      {book.publishedDate?.substring?.(0, 4) || 'Unknown'}
                    </ThemedText>
                  </View>
                )}
                {/* Categories */}
                {book.categories && book.categories.length > 0 && (
                  <View style={styles.categoriesContainer}>
                    <ThemedText style={styles.categoriesLabel}>
                      Categories:
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
                    <ThemedText style={styles.rating}>
                      {book.averageRating.toFixed(1)} ({book.ratingsCount || 0}
                      reviews)
                    </ThemedText>
                  </View>
                )}
              </View>
              {/* {showImage && */}
              {bookImageUrl ? (
                <CachedImage
                  source={{ uri: bookImageUrl }}
                  style={[styles.bookCover, imageSize]}
                  resizeMode='cover'
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
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 20,
    fontWeight: '400',
  },
  author: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  metadata: {
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 4,
  },
  rating: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoriesLabel: {
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categories: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 14,
    opacity: 0.7,
  },
  descriptionTitle: {
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'berlin-sans-fb',
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
