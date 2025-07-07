import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Logo from '../assets/icon.png'; // Placeholder image for book cover
import { searchBooks } from '../lib/googleBooks';
import Spacer from './Spacer';
import ThemedButton from './ThemedButton';
import ThemedText from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import ThemedView from './ThemedView';

const BookSearchModal = ({ visible, onClose, onBookSelect, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchBooks(searchQuery.trim(), 20);
      setSearchResults(results);

      if (results.length === 0) {
        Alert.alert(
          'No Results',
          'No books found for your search. Try different keywords.'
        );
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error',
        'Failed to search for books. Please check your internet connection and try again.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookSelect = (book) => {
    onBookSelect(book);
    onClose();

    // Reset search state
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderBookItem = ({ item }) => (
    <Pressable
      style={[styles.bookItem, { borderBottomColor: theme.uiBorder }]}
      onPress={() => handleBookSelect(item)}
    >
      <View style={styles.bookItemContent}>
        {item.thumbnail || item.coverImage ? (
          <Image
            source={{
              uri: (item.thumbnail || item.coverImage).replace(
                'http://',
                'https://'
              ),
            }}
            style={styles.bookCover}
            resizeMode='cover'
            onError={(error) => {
              console.log(
                'BookSearchModal image error:',
                error.nativeEvent.error
              );
            }}
          />
        ) : (
          <View
            style={[
              styles.bookCoverPlaceholder,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Image
              source={Logo}
              style={{ width: 60, height: 60 }}
              resizeMode='contain'
              accessibilityLabel='Placeholder Book Cover'
              accessibilityRole='image'
            />
          </View>
        )}

        <View style={styles.bookInfo}>
          <ThemedText style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.bookAuthor} numberOfLines={1}>
            by {item.author}
          </ThemedText>
          {item.publishedDate && (
            <ThemedText style={styles.bookYear}>
              {new Date(item.publishedDate).getFullYear()}
            </ThemedText>
          )}
          {item.pageCount > 0 && (
            <ThemedText style={styles.bookPages}>
              {item.pageCount} pages
            </ThemedText>
          )}
        </View>

        <Ionicons
          name='chevron-forward'
          size={20}
          color={theme.iconColor}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );

  if (!visible) return null;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText title style={styles.headerTitle}>
          Search Books
        </ThemedText>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons
            name='close-circle-outline'
            size={24}
            color={theme.iconColor}
          />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <ThemedTextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='Search by title, author, or ISBN...'
          onSubmitEditing={handleSearch}
          returnKeyType='search'
        />
        <ThemedButton
          onPress={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          style={styles.searchButton}
        >
          {isSearching ? (
            <ActivityIndicator color={theme.iconColor} size='large' />
          ) : (
            <Ionicons name='search' size={24} color={theme.iconColor} />
          )}
        </ThemedButton>
      </View>

      <Spacer />

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.iconColor} />
          <Spacer />
          <ThemedText>Searching books...</ThemedText>
        </View>
      ) : hasSearched && searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name='search' size={48} color={theme.iconColor} />
          <Spacer />
          <ThemedText>No books found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Try searching with different keywords
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.googleBooksId}
          renderItem={renderBookItem}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 12,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    width: '100%',
    paddingVertical: 14,
    paddingLeft: 12,
    alignItems: 'center',
  },
  searchButton: {
    width: 48,
    height: 48,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
  },
  resultsList: {
    flex: 1,
  },
  bookItem: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    borderBottomWidth: 0.5,
    paddingVertical: 12,
  },
  bookItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCover: {
    width: 60,
    height: 80,
    borderRadius: 5,
  },
  bookCoverPlaceholder: {
    width: 60,
    height: 80,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  bookPages: {
    fontSize: 12,
    opacity: 0.6,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default BookSearchModal;
