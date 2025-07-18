import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Logo from '../../assets/icon.png';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
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
  const { user, deleteBooks } = useUser();
  const { books, readBooks, booksLoading } = useBooks();
  const navigation = useRouter();
  const responsiveHeading = useResponsiveHeadingStyle();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteBooks = () => {
    Alert.alert(
      'Delete All Books',
      'Are you sure you want to delete your books?\nThis action cannot be undone and all your book data will be permanently deleted.\nTo completely delete your account, please email us at    support@onestepweb.dev',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteBooks();
              navigation.replace('/login');
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete account. Please try again.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

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
          {[...readBooks].reverse().map((book) => (
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
      <Spacer height={30} />
      <View style={styles.admin}>
        {/* <ThemedText style={styles.privacyNote}>
          To completely delete your account, please email us at
          support@onestepweb.dev
          </ThemedText> */}
        <ThemedButton href='/privacy-policy' style={styles.deleteButton}>
          <ThemedText>Privacy Policy</ThemedText>
          <MaterialIcons name='policy' size={24} color='black' />
        </ThemedButton>
        <ThemedButton
          onPress={handleDeleteBooks}
          disabled={isDeleting}
          style={[{ opacity: 1.2 }, styles.deleteButton]}
        >
          <ThemedText>
            {isDeleting ? 'Deleting books...' : 'Delete books'}
          </ThemedText>

          <Ionicons name='trash-outline' size={24} color={Colors.warning} />
        </ThemedButton>
      </View>
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
    maxWidth: '100%',
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  deleteButtonText: {
    fontWeight: 'normal',
    textAlign: 'center',
  },
  privacyNote: {
    width: '100%',
    maxWidth: 350,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  admin: {
    width: '100%',
    maxWidth: 500,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});
