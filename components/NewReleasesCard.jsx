import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react'; // Added useState
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthors } from '../hooks/useAuthors';
import ThemedCard from './ThemedCard';
import ThemedText from './ThemedText';
const Logo = require('../assets/icon.png'); // Changed to require for proper asset loading

/**
 * NewReleasesCard Component
 * Displays new releases from followed authors
 */
const NewReleasesCard = ({ style }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const router = useRouter();
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed images

  const { newReleases, checkForNewReleases, authorsLoading } = useAuthors();

  const handleRefresh = async () => {
    try {
      await checkForNewReleases();
    } catch (error) {
      console.error('Failed to refresh new releases:', error);
    }
  };

  if (newReleases.length === 0) {
    return null; // Don't show card if no new releases
  }

  return (
    <ThemedCard style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name="sparkles"
            size={20}
            color="#FFD700"
            style={styles.sparkle}
          />
          <ThemedText style={styles.title}>New Releases</ThemedText>
        </View>
        <Pressable
          onPress={handleRefresh}
          disabled={authorsLoading}
          style={styles.refreshButton}
        >
          <Ionicons
            name="refresh"
            size={16}
            color={theme.iconColor}
            style={authorsLoading ? styles.spinning : null}
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.releasesContainer}
      >
        {newReleases.map((release, index) => (
          <View key={`${release.author}-${index}`} style={styles.authorSection}>
            <ThemedText style={styles.authorName} numberOfLines={1}>
              {release.author}
            </ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.booksRow}
            >
              {release.books.map((book, bookIndex) => {
                const imageKey = book.googleBooksId || book.title;
                const imageFailed = failedImages.has(imageKey);
                const hasImage =
                  (book.thumbnail || book.coverImage) && !imageFailed;

                return (
                  <Pressable
                    key={`${imageKey}-${bookIndex}`}
                    onPress={() => {
                      // Filter to only essential serializable fields to avoid JSON issues
                      const bookToPass = {
                        title: book.title,
                        author: book.author,
                        description: book.description,
                        thumbnail: book.thumbnail,
                        coverImage: book.coverImage,
                        publishedDate: book.publishedDate,
                        language: book.language,
                        categories: book.categories,
                        pageCount: book.pageCount,
                        googleBooksId: book.googleBooksId,
                      };
                      console.log('Book to pass:', bookToPass); // Debug log
                      router.push({
                        pathname: '/create',
                        params: {
                          preselectedBook: encodeURIComponent(
                            JSON.stringify(bookToPass)
                          ),
                        },
                      });
                    }}
                    style={styles.bookContainer}
                  >
                    {hasImage ? (
                      <Image
                        source={{
                          uri: (book.thumbnail || book.coverImage).replace(
                            'http://',
                            'https://'
                          ),
                        }}
                        style={styles.bookCover}
                        resizeMode="cover"
                        onError={() => {
                          console.warn('Failed to load book cover image');
                          setFailedImages((prev) =>
                            new Set(prev).add(imageKey)
                          );
                        }}
                      />
                    ) : (
                      <View
                        style={[
                          styles.bookCoverPlaceholder,
                          {
                            backgroundColor: theme.cardBackground || '#f0f0f0',
                          },
                        ]}
                      >
                        <Image
                          source={Logo}
                          style={{ width: 60, height: 60 }}
                          resizeMode="contain"
                          accessibilityLabel="Placeholder Book Cover"
                          accessibilityRole="image"
                        />
                      </View>
                    )}
                    <ThemedText style={styles.bookTitle} numberOfLines={2}>
                      {book.title}
                    </ThemedText>
                    <ThemedText style={styles.bookYear} numberOfLines={1}>
                      {book.publishedDate?.substring(0, 4) || 'New'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Tap any book to add it to your library
        </ThemedText>
      </View>
    </ThemedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkle: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 4,
  },
  spinning: {
    // Add animation in future if needed
  },
  releasesContainer: {},
  authorSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed from 'center' for better top alignment
    minWidth: 160,
    paddingVertical: 8, // Added for better spacing
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'berlin-sans-fb-bold',
    marginBottom: 8,
    opacity: 0.8,
  },
  booksRow: {
    paddingRight: 12,
  },
  bookContainer: {
    marginRight: 12,
    width: 80,
    alignItems: 'center',
  },
  bookCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginBottom: 6,
  },
  bookCoverPlaceholder: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  bookTitle: {
    width: 80, // Set to match container width, removed minWidth to prevent clipping
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 13, // Adjusted for better wrapping
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default NewReleasesCard;
