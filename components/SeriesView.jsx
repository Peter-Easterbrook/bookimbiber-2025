import { useContext, useState } from 'react';
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
import ThemedView from './ThemedView';
import ThemedCard from './ThemedCard';
import LazyBookCover from './LazyBookCover';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * SeriesView Component
 * Displays books grouped by series with expandable sections
 */
const SeriesView = ({ series, standalone }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const router = useRouter();
  const [expandedSeries, setExpandedSeries] = useState(new Set());

  const toggleSeries = (seriesKey) => {
    const newExpanded = new Set(expandedSeries);
    if (newExpanded.has(seriesKey)) {
      newExpanded.delete(seriesKey);
    } else {
      newExpanded.add(seriesKey);
    }
    setExpandedSeries(newExpanded);
  };

  const renderBook = (book, showNumber = false) => (
    <Pressable
      key={book.$id}
      onPress={() => router.push(`/books/${book.$id}`)}
      style={[styles.bookItem, { borderColor: theme.uiBorder }]}
    >
      <LazyBookCover book={book} size="small" style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <ThemedText style={styles.bookTitle} numberOfLines={2}>
          {showNumber && book.bookNumber ? `#${book.bookNumber} ` : ''}
          {book.title}
        </ThemedText>
        <ThemedText style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </ThemedText>
        {book.publishedDate && (
          <ThemedText style={styles.bookYear}>
            {book.publishedDate.substring(0, 4)}
          </ThemedText>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={theme.iconColor}
        style={styles.chevron}
      />
    </Pressable>
  );

  const renderSeries = (seriesData) => {
    const seriesKey = `${seriesData.author}_${seriesData.seriesName}`;
    const isExpanded = expandedSeries.has(seriesKey);
    const booksToShow = isExpanded ? seriesData.books : seriesData.books.slice(0, 2);

    return (
      <ThemedCard key={seriesKey} style={styles.seriesCard}>
        <Pressable
          onPress={() => toggleSeries(seriesKey)}
          style={styles.seriesHeader}
        >
          <View style={styles.seriesInfo}>
            <ThemedText style={styles.seriesTitle}>
              📚 {seriesData.seriesName}
            </ThemedText>
            <ThemedText style={styles.seriesAuthor}>
              by {seriesData.author}
            </ThemedText>
            <ThemedText style={styles.seriesMeta}>
              {seriesData.books.length} book{seriesData.books.length !== 1 ? 's' : ''}
              {seriesData.confidence === 'high' && ' • Verified Series'}
            </ThemedText>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.iconColor}
          />
        </Pressable>

        <View style={styles.booksContainer}>
          {booksToShow.map(book => renderBook(book, true))}
          
          {!isExpanded && seriesData.books.length > 2 && (
            <Pressable
              onPress={() => toggleSeries(seriesKey)}
              style={[styles.showMore, { borderColor: theme.uiBorder }]}
            >
              <ThemedText style={styles.showMoreText}>
                Show {seriesData.books.length - 2} more books
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={theme.iconColor} />
            </Pressable>
          )}
        </View>
      </ThemedCard>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Series Section */}
      {series.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📚 Book Series</ThemedText>
          {series.map(renderSeries)}
        </View>
      )}

      {/* Standalone Books Section */}
      {standalone.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            📖 Individual Books
            {series.length > 0 && ` (${standalone.length})`}
          </ThemedText>
          <ThemedCard style={styles.standaloneCard}>
            {standalone.map(book => renderBook(book))}
          </ThemedCard>
        </View>
      )}

      {/* Empty State */}
      {series.length === 0 && standalone.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No books in your library yet!</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add some books to see them organized by series
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  seriesCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 16,
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  seriesAuthor: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  seriesMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  booksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bookCover: {
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
    marginRight: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 1,
  },
  bookYear: {
    fontSize: 11,
    opacity: 0.5,
  },
  chevron: {
    marginLeft: 4,
  },
  showMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1,
  },
  showMoreText: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 4,
  },
  standaloneCard: {
    padding: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'berlin-sans-fb-bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default SeriesView;