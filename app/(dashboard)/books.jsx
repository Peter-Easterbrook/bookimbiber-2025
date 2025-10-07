import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Logo from '../../assets/icon.png';
import AuthorFollowButton from '../../components/AuthorFollowButton';
import NewReleasesCard from '../../components/NewReleasesCard';
import ThemedLogoMyBooks from '../../components/ThemedLogoMyBooks';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuthors } from '../../hooks/useAuthors';
import { useBooks } from '../../hooks/useBooks';

const Books = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { books, deleteBook } = useBooks();
  const { newReleases, followedAuthors } = useAuthors(); // for badge count + extraData to re-render rows
  const router = useRouter();
  const [viewMode, setViewMode] = useState('series'); // 'series' or 'list'

  const handleDelete = async (bookId) => {
    await deleteBook(bookId);
    router.replace('/books');
  };

  const isEmpty = !books || books.length === 0;

  return (
    <ThemedView style={styles.container} safe={true}>
      {!isEmpty && (
        <>
          <View style={styles.topLogoContainer}>
            <ThemedLogoMyBooks width={150} height={150} />
            {/* Notifications badge top-right */}
            <Pressable
              onPress={() => router.push('/notifications')}
              style={[
                styles.notificationsButton,
                { backgroundColor: theme.buttonBackgroundFocused },
              ]}
            >
              <Ionicons
                name="notifications"
                size={22}
                color={theme.iconColor}
              />
              {newReleases && newReleases.length > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {newReleases.length}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </View>

          {/* New Releases Card */}
          <NewReleasesCard style={styles.newReleasesCard} />

          {/* View Mode Toggle */}
        </>
      )}
      {/* Content based on view mode */}
      {isEmpty ? (
        <View style={styles.emptyListPlaceholder}>
          <Pressable onPress={() => router.push('/create')}>
            <ThemedLogoMyBooks width={250} height={250} />
          </Pressable>
          <ThemedText style={[styles.fallbackText, { color: theme.textColor }]}>
            Nothing on your reading list!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={books || []}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.list}
          extraData={followedAuthors} // ensure rows re-render when follow state changes
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

                    {/* Rating */}
                    {item.averageRating > 0 && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <ThemedText style={styles.metadata}>
                          {item.averageRating.toFixed(1)} (
                          {item.ratingsCount || 0} reviews)
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.chevronBlock}>
                    <AuthorFollowButton
                      authorName={item.author}
                      size="small"
                      style={{
                        margin: 0,
                      }}
                    />
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.iconColor}
                      style={styles.chevron}
                    />
                  </View>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    marginTop: 0,
    paddingTop: 0,
    // keep relative so badge can position
    position: 'relative',
    width: '100%',
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
    marginVertical: 4,
    padding: 6,
    paddingRight: 12,
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
  chevronBlock: {
    height: 75, // match styles.bookCover.height
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 'auto',
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
  activeToggle: {},
  toggleText: {
    fontSize: 14,
    fontFamily: 'berlin-sans-fb',
    marginLeft: 10,
  },
  notificationsButton: {
    position: 'absolute',
    right: 18,
    top: 8,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent500,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    fontFamily: 'berlin-sans-fb',
  },
});
