import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Logo from '../assets/icon.png';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemedText from './ThemedText';

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
      android_ripple={{ color: theme.rippleColor, borderless: false }}
      style={[
        styles.bookItem,
        {
          backgroundColor: theme.uiBackground,
          borderLeftColor: theme.uiButtonBorder,
        },
      ]}
    >
      <View style={styles.bookItemContent}>
        {/* Book Cover */}
        {book.thumbnail || book.coverImage ? (
          <Image
            source={{
              uri: (book.thumbnail || book.coverImage).replace(
                'http://',
                'https://'
              ),
            }}
            style={styles.bookCover}
            resizeMode="cover"
            onError={(error) => {
              console.log('SeriesView image error:', error.nativeEvent.error);
            }}
          />
        ) : (
          <View style={styles.bookCoverPlaceholder}>
            <Image
              source={Logo}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
              accessibilityLabel="Placeholder Book Cover"
              accessibilityRole="image"
            />
          </View>
        )}

        {/* Book Info */}
        <View style={styles.bookInfo}>
          <ThemedText style={styles.bookTitle} numberOfLines={2}>
            {showNumber && book.bookNumber ? `#${book.bookNumber} ` : ''}
            {book.title}
          </ThemedText>
          <ThemedText style={styles.bookAuthor} numberOfLines={1}>
            Written by {book.author}
          </ThemedText>
          {book.publishedDate && (
            <ThemedText style={styles.bookYear}>
              {book.publishedDate.substring(0, 4)}
            </ThemedText>
          )}

          {/* Rating */}
          {book.averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <ThemedText style={styles.metadata}>
                {book.averageRating.toFixed(1)} ({book.ratingsCount || 0}{' '}
                reviews)
              </ThemedText>
            </View>
          )}
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.iconColor}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );

  const renderSeries = (seriesData) => {
    const seriesKey = `${seriesData.author}_${seriesData.seriesName}`;
    const isExpanded = expandedSeries.has(seriesKey);
    const booksToShow = isExpanded
      ? seriesData.books
      : seriesData.books.slice(0, 2);

    return (
      <View key={seriesKey} style={styles.seriesContainer}>
        <Pressable
          onPress={() => toggleSeries(seriesKey)}
          style={[
            styles.seriesHeader,
            { backgroundColor: theme.uiBackground }, // Add it here instead
          ]}
        >
          <View style={styles.seriesInfo}>
            <ThemedText style={styles.seriesTitle}>
              📚 {seriesData.seriesName}
            </ThemedText>
            <ThemedText style={styles.seriesAuthor}>
              by {seriesData.author}
            </ThemedText>
            <ThemedText style={styles.seriesMeta}>
              {seriesData.books.length} book
              {seriesData.books.length !== 1 ? 's' : ''}
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
          {booksToShow.map((book) => renderBook(book, true))}

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
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Series Section */}
      {series.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="bookshelf"
              size={24}
              color={theme.iconColor}
            />
            <ThemedText style={styles.sectionTitle}>Book Series</ThemedText>
          </View>
          {series.map(renderSeries)}
        </View>
      )}

      {/* Standalone Books Section */}
      {standalone.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={24} color={theme.iconColor} />
            <ThemedText style={styles.sectionTitle}>
              Individual Books
              {series.length > 0 && ` (${standalone.length})`}
            </ThemedText>
          </View>
          <View style={styles.standaloneContainer}>
            {standalone.map((book) => renderBook(book))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {series.length === 0 && standalone.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            No books in your library yet!
          </ThemedText>
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
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    marginBottom: 4,
    paddingLeft: 14,
  },
  seriesContainer: {
    marginBottom: 24,
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
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
    alignSelf: 'center',
    width: '95%',
    maxWidth: 550,
    marginVertical: 4,
    padding: 12,
    // paddingLeft: 14,
    borderRadius: 5,
    overflow: 'hidden',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
    borderLeftWidth: 4,
  },
  bookItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCover: {
    width: 60,
    height: 80,
    borderRadius: 5,
    marginRight: 12,
  },
  bookCoverPlaceholder: {
    width: 60,
    height: 80,
    borderRadius: 5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  bookInfo: {
    flex: 1,
    marginRight: 8,
  },
  bookTitle: {
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 16,
    marginBottom: 4,
  },
  bookAuthor: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  bookYear: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metadata: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  chevron: {
    marginLeft: 8,
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
  standaloneContainer: {
    // Simple container, no card styling
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
