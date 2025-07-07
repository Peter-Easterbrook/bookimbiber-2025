import { useRouter } from 'expo-router';
import { useContext } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Logo from '../../assets/icon.png';
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useBooks } from '../../hooks/useBooks';
import { useResponsiveHeadingStyle } from '../../hooks/useResponsive';
import { useUser } from '../../hooks/useUser';

const Profile = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { user } = useUser();
  const { books, readBooks, booksLoading } = useBooks();
  const navigation = useRouter();
  const responsiveHeading = useResponsiveHeadingStyle();

  const getInitial = (user) => {
    if (!user) return '';
    if (user.name && user.name.length > 0) return user.name[0].toUpperCase();
    if (user.email && user.email.length > 0) return user.email[0].toUpperCase();
    return '';
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.navigate('/login')}
          activeOpacity={0.5}
          style={styles.button}
        >
          <ThemedText title={true} style={styles.heading}>
            Not logged in.
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.initialCircle,
          {
            backgroundColor: theme.buttonBackgroundFocused + '33',
            borderColor: theme.uiBorder,
          },
        ]}
      >
        <ThemedText style={[styles.initialText, { color: theme.iconColor }]}>
          {getInitial(user)}
        </ThemedText>
      </View>
      <Spacer height={20} />
      <ThemedText title={true} style={styles.heading}>
        Hello, {user.name}
      </ThemedText>
      <Spacer height={10} />
      <Spacer height={20} />
      {readBooks.length > 0 && (
        <ThemedText title={true} style={responsiveHeading}>
          Reading History:
        </ThemedText>
      )}

      {booksLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color={theme.text} />
        </View>
      ) : readBooks.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
          contentContainerStyle={styles.readBooksSection}
        >
          {readBooks.map((book) => (
            <View
              key={book.$id || book.id}
              style={[
                styles.readBookItem,
                {
                  backgroundColor: theme.uiBackground,
                  borderLeftColor: theme.uiButtonBorder,
                },
              ]}
            >
              <View style={styles.readBookItemContent}>
                <View style={styles.bookInfo}>
                  <ThemedText
                    style={styles.readBookTitle}
                    numberOfLines={2}
                    title={true}
                  >
                    {book.title}
                  </ThemedText>
                  <ThemedText style={styles.readBookAuthor}>
                    by {book.author}
                  </ThemedText>
                  {book.readAt && (
                    <ThemedText style={styles.readBookDate}>
                      Finished on {new Date(book.readAt).toLocaleDateString()}
                    </ThemedText>
                  )}
                </View>
                {/* Book Cover */}
                <>
                  {book.thumbnail || book.coverImage ? (
                    <Image
                      source={{
                        uri: (book.thumbnail || book.coverImage).replace(
                          'http://',
                          'https://'
                        ),
                      }}
                      style={styles.bookCover}
                      resizeMode='cover'
                      onError={(error) => {
                        console.log(
                          'Profile image error:',
                          error.nativeEvent.error
                        );
                      }}
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
                </>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ThemedText style={styles.readBookStatement}>
          No books read yet
        </ThemedText>
      )}
    </ThemedView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'berlin-sans-fb-bold',
    fontWeight: 'normal',
    letterSpacing: 1,
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 0,
  },
  avatar: {
    marginBottom: 20,
  },
  initialCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    overflow: 'hidden', // Ensures the circle is clipped
  },
  initialText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  readBookStatement: {
    fontSize: 16,
    textAlign: 'center',
  },
  readBooksSection: {
    width: '100%',
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  readBookItem: {
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
  readBookItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    paddingRight: 20,
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
  readBookTitle: {
    letterSpacing: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  readBookAuthor: {
    letterSpacing: 1,
    fontSize: 14,
  },
  readBookDate: {
    fontSize: 12,
    marginTop: 20,
  },
  loaderContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 200,
    width: '49%',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
