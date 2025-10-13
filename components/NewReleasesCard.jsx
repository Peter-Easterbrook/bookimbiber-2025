import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import { useUser } from '../hooks/useUser';
import { Debouncer } from '../utils/api-cache';
import ThemedCard from './ThemedCard';
import ThemedText from './ThemedText';
const Logo = require('../assets/icon.png');

// Create debouncer instance for UI (1 hour cooldown)
const uiDebouncer = new Debouncer(60 * 60 * 1000);

/**
 * NewReleasesCard Component
 * Displays new releases from followed authors
 */
const NewReleasesCard = ({ style }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const router = useRouter();
  const [failedImages, setFailedImages] = useState(new Set());
  const { user } = useUser();

  const { newReleases, checkForNewReleases, authorsLoading } = useAuthors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animate refresh icon when loading
  useEffect(() => {
    if (isRefreshing || authorsLoading) {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isRefreshing, authorsLoading, rotateAnim]);

  const handleRefresh = async () => {
    if (isRefreshing || authorsLoading) return;

    const debounceKey = `new-releases-refresh-${user?.$id}`;

    // Check if we're still in cooldown
    if (!uiDebouncer.canProceed(debounceKey)) {
      const remainingMs = uiDebouncer.getRemainingTime(debounceKey);
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      Alert.alert(
        'Please Wait',
        `You can refresh again in ${remainingMinutes} minute${
          remainingMinutes !== 1 ? 's' : ''
        }.\n\nThis helps reduce API usage and stay within quota limits.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRefreshing(true);
    try {
      await checkForNewReleases(undefined, true); // Pass true to force refresh
      uiDebouncer.markCalled(debounceKey);
    } catch (error) {
      console.error('Failed to refresh new releases:', error);
      Alert.alert(
        'Refresh Failed',
        'Could not check for new releases. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!newReleases || newReleases.length === 0) {
    return null;
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
          disabled={isRefreshing || authorsLoading}
          style={[
            styles.refreshButton,
            (isRefreshing || authorsLoading) && styles.refreshButtonDisabled,
          ]}
        >
          <Animated.View
            style={[
              (isRefreshing || authorsLoading) && {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={
                isRefreshing || authorsLoading
                  ? theme.iconColor + '80'
                  : theme.iconColor
              }
            />
          </Animated.View>
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
    alignSelf: 'center',
    width: '95%',
    maxWidth: 550,
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
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  releasesContainer: {},
  authorSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed from 'center' for better top alignment
    minWidth: 160,
    // paddingVertical: 2, // Added for better spacing
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
