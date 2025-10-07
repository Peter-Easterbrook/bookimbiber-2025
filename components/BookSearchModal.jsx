import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../assets/icon.png';
import { searchBooks } from '../lib/googleBooks';
import Spacer from './Spacer';
import ThemedButton from './ThemedButton';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

const BookSearchModal = ({ visible, onClose, onBookSelect, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const insets = useSafeAreaInsets();

  // Defensive: ensure theme exists
  const safeTheme = theme || {
    iconColor: '#000',
    inputBackground: '#fff',
    textColor: '#000',
    borderColor: '#ccc',
    placeholderColor: '#999',
    cardBackground: '#f5f5f5',
    uiBorder: '#ddd',
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchBooks(searchQuery.trim(), 20);
      setSearchResults(results || []); // defensive: ensure array

      if (!results || results.length === 0) {
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
      setSearchResults([]); // reset on error
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookSelect = (book) => {
    if (!book) return;
    onBookSelect(book);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderBookItem = ({ item }) => {
    if (!item) return null;

    return (
      <Pressable
        style={[styles.bookItem, { borderBottomColor: safeTheme.uiBorder }]}
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
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.bookCoverPlaceholder,
                { backgroundColor: safeTheme.cardBackground },
              ]}
            >
              <Image
                source={Logo}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.bookInfo}>
            <ThemedText style={styles.bookTitle} numberOfLines={2}>
              {item.title || 'Unknown Title'}
            </ThemedText>
            <ThemedText style={styles.bookAuthor} numberOfLines={1}>
              by {item.author || 'Unknown'}
            </ThemedText>
            {item.publishedDate && (
              <ThemedText style={styles.bookYear}>
                {new Date(item.publishedDate).getFullYear()}
              </ThemedText>
            )}
            {item.language && (
              <ThemedText style={styles.bookLanguage}>
                Language: {item.language.toUpperCase()}
              </ThemedText>
            )}
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={safeTheme.iconColor}
            style={styles.chevron}
          />
        </View>
      </Pressable>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Search Books</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={safeTheme.iconColor} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: safeTheme.inputBackground,
                color: safeTheme.textColor,
                borderColor: safeTheme.borderColor,
              },
            ]}
            placeholder="Search by title or author..."
            placeholderTextColor={safeTheme.placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <ThemedButton onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color={safeTheme.iconColor} />
          </ThemedButton>
        </View>

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={safeTheme.iconColor} />
          </View>
        ) : hasSearched && searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={safeTheme.iconColor} />
            <Spacer />
            <ThemedText>No books found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try searching with different keywords
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) =>
              item?.googleBooksId || `book-${index}`
            }
            renderItem={renderBookItem}
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </ThemedView>
    </Modal>
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
    width: '100%',
    maxWidth: 500,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0,
    elevation: 0,
  },
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
    opacity: 0.9,
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 2,
  },
  bookLanguage: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default BookSearchModal;
