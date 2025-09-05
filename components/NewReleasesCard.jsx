import { useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ThemedText from './ThemedText';
import ThemedCard from './ThemedCard';
import LazyBookCover from './LazyBookCover';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthors } from '../hooks/useAuthors';

/**
 * NewReleasesCard Component
 * Displays new releases from followed authors
 */
const NewReleasesCard = ({ style }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const router = useRouter();
  
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
          <Ionicons name="sparkles" size={20} color="#FFD700" style={styles.sparkle} />
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
              {release.books.map((book, bookIndex) => (
                <Pressable
                  key={`${book.googleBooksId || book.title}-${bookIndex}`}
                  onPress={() => {
                    // Navigate to book search/add screen with pre-filled data
                    router.push({
                      pathname: '/create',
                      params: { 
                        preselectedBook: JSON.stringify(book) 
                      }
                    });
                  }}
                  style={styles.bookContainer}
                >
                  <LazyBookCover 
                    book={book} 
                    size="small" 
                    style={styles.bookCover}
                  />
                  <ThemedText 
                    style={styles.bookTitle} 
                    numberOfLines={2}
                  >
                    {book.title}
                  </ThemedText>
                  <ThemedText 
                    style={styles.bookYear} 
                    numberOfLines={1}
                  >
                    {book.publishedDate?.substring(0, 4) || 'New'}
                  </ThemedText>
                </Pressable>
              ))}
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
  releasesContainer: {
    paddingRight: 16,
  },
  authorSection: {
    marginRight: 24,
    minWidth: 200,
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
    marginBottom: 6,
  },
  bookTitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
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