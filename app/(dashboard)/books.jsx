import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState, useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Logo from '../../assets/icon.png';
import ThemedLogoMyBooks from '../../components/ThemedLogoMyBooks';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedButton from '../../components/ThemedButton';
import SeriesView from '../../components/SeriesView';
import NewReleasesCard from '../../components/NewReleasesCard';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useBooks } from '../../hooks/useBooks';
import { groupBooksBySeries } from '../../lib/seriesDetection';
// import Spacer from '../../components/Spacer';

const Books = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { books, deleteBook } = useBooks();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('series'); // 'series' or 'list'

  const handleDelete = async (bookId) => {
    await deleteBook(bookId);
    router.replace('/books');
  };

  const isEmpty = !books || books.length === 0;
  
  // Group books by series
  const groupedBooks = useMemo(() => {
    if (!books || books.length === 0) return { series: [], standalone: [] };
    return groupBooksBySeries(books);
  }, [books]);

  return (
    <ThemedView style={styles.container} safe={true}>
      {!isEmpty && (
        <>
          <View style={styles.topLogoContainer}>
            <ThemedLogoMyBooks width={150} height={150} />
          </View>
          
          {/* New Releases Card */}
          <NewReleasesCard style={styles.newReleasesCard} />
          
          {/* View Mode Toggle */}
          <View style={styles.viewToggle}>
            <ThemedButton
              onPress={() => setViewMode('series')}
              style={[
                styles.toggleButton,
                viewMode === 'series' && styles.activeToggle,
                { backgroundColor: viewMode === 'series' ? theme.uiButtonBg : 'transparent' }
              ]}
            >
              <Ionicons 
                name="library" 
                size={16} 
                color={viewMode === 'series' ? theme.uiButtonText : theme.iconColor} 
              />
              <ThemedText style={[
                styles.toggleText,
                { color: viewMode === 'series' ? theme.uiButtonText : theme.iconColor }
              ]}>
                Series
              </ThemedText>
            </ThemedButton>
            
            <ThemedButton
              onPress={() => setViewMode('list')}
              style={[
                styles.toggleButton,
                viewMode === 'list' && styles.activeToggle,
                { backgroundColor: viewMode === 'list' ? theme.uiButtonBg : 'transparent' }
              ]}
            >
              <Ionicons 
                name="list" 
                size={16} 
                color={viewMode === 'list' ? theme.uiButtonText : theme.iconColor} 
              />
              <ThemedText style={[
                styles.toggleText,
                { color: viewMode === 'list' ? theme.uiButtonText : theme.iconColor }
              ]}>
                List
              </ThemedText>
            </ThemedButton>
          </View>
        </>
      )}
      {/* Content based on view mode */}
      {isEmpty ? (
        <View style={styles.emptyListPlaceholder}>
          <Pressable onPress={() => router.push('/create')}>
            <ThemedLogoMyBooks width={250} height={250} />
          </Pressable>
          <ThemedText
            style={[styles.fallbackText, { color: theme.textColor }]}
          >
            Nothing on your reading list!
          </ThemedText>
        </View>
      ) : viewMode === 'series' ? (
        <SeriesView 
          series={groupedBooks.series} 
          standalone={groupedBooks.standalone} 
        />
      ) : (
        <FlatList
          data={books || []}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const bookImageUrl = item.thumbnail || item.coverImage;

            return (
              <Pressable
                onPress={() => router.push(`/books/${item.$id}`)}
                android_ripple={{ color: theme.rippleColor, borderless: false }}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.uiBackground,
                    borderLeftColor: theme.uiButtonBorder,
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  {/* Book Cover */}
                  {bookImageUrl ? (
                    <Image
                      source={{
                        uri: bookImageUrl.replace('http://', 'https://'),
                      }}
                      style={styles.bookCover}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log(
                          'Books list image error:',
                          error.nativeEvent.error
                        );
                      }}
                    />
                  ) : (
                    <View style={styles.bookCoverPlaceholder}>
                      <Image
                        source={Logo}
                        style={{ width: 60, height: 60 }}
                        resizeMode="contain"
                        accessibilityLabel="Placeholder Book Cover"
                        accessibilityRole="image"
                      />
                    </View>
                  )}

                  {/* Book Info */}
                  <View style={styles.bookInfo}>
                    <ThemedText
                      style={styles.title}
                      numberOfLines={2}
                      title={true}
                    >
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.author} numberOfLines={1}>
                      Written by {item.author}
                    </ThemedText>

                    {/* Series Info */}
                    {item.seriesName && (
                      <ThemedText style={styles.seriesInfo} numberOfLines={1}>
                        📚 {item.seriesName} #{item.bookNumber || '?'}
                      </ThemedText>
                    )}

                    {/* Rating */}
                    {item.averageRating > 0 && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <ThemedText style={styles.metadata}>
                          {item.averageRating.toFixed(1)} (
                          {item.ratingsCount || 0}
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
          }}
        />
      )}
    </ThemedView>
  );
};

export default Books;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    marginTop: -20,
    paddingTop: 0,
  },
  topLogoContainer: {
    alignItems: 'center', // <-- Add this style
    justifyContent: 'flex-start', // <-- Add this style
    marginBottom: 8, // <-- Reduce from 16 to 8 for less space below logo
    marginTop: 0, // <-- Add this to ensure no extra space above logo
    paddingTop: 0,
  },
  list: {
    marginTop: 0,
    paddingBottom: 60,
    marginBottom: 0,
  },
  card: {
    alignSelf: 'center',
    width: '95%',
    maxWidth: 550,
    marginVertical: 8,
    padding: 12,
    paddingLeft: 14,
    borderRadius: 5,
    overflow: 'hidden',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
    borderLeftWidth: 4,
  },
  cardContent: {
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
  },
  emptyListPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bookInfo: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: 'berlin-sans-fb-bold',
    letterSpacing: 1,
    fontSize: 18,
    marginBottom: 4,
  },
  author: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 1,
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  metadata: {
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
  chevron: {
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  newReleasesCard: {
    marginHorizontal: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  activeToggle: {
    // Styling handled dynamically
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'berlin-sans-fb',
    marginLeft: 4,
  },
  seriesInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
    fontFamily: 'berlin-sans-fb',
  },
});
