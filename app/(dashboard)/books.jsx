import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Logo from '../../assets/icon.png';
import CachedImage from '../../components/CachedImage';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useBooks } from '../../hooks/useBooks';
// import Spacer from '../../components/Spacer';

const Books = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { books, deleteBook } = useBooks();
  const router = useRouter();

  const handleDelete = async (bookId) => {
    await deleteBook(bookId);
    router.replace('/books');
  };

  return (
    <ThemedView style={styles.container} safe={true}>
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
                  <CachedImage
                    source={{ uri: bookImageUrl }}
                    style={styles.bookCover}
                    resizeMode='cover'
                  />
                ) : (
                  <View style={styles.bookCoverPlaceholder}>
                    <Image
                      source={Logo}
                      style={{ width: 60, height: 60 }}
                      resizeMode='contain'
                      accessibilityLabel='Placeholder Book Cover'
                      accessibilityRole='image'
                    />
                  </View>
                )}

                {/* Book Info */}
                <View style={styles.bookInfo}>
                  <ThemedText style={styles.title} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.author} numberOfLines={1}>
                    Written by {item.author}
                  </ThemedText>

                  {/* Rating */}
                  {item.averageRating > 0 && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name='star' size={14} color='#FFD700' />
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
                  name='chevron-forward'
                  size={20}
                  color={theme.iconColor}
                  style={styles.chevron}
                />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <ThemedText style={[styles.fallbackText, { color: theme.textColor }]}>
            Nothing on your reading list!
          </ThemedText>
        }
      />
      {/* <Spacer height={40} /> */}
    </ThemedView>
  );
};

export default Books;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    marginTop: 20,
  },

  list: {
    marginTop: 50,
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
});
