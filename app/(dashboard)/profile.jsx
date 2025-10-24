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
import ThemedTextInput from '../../components/ThemedTextInput';
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
  const { user, deleteBooks, updateName, updatePassword } = useUser();
  const { books, readBooks, booksLoading } = useBooks();
  const navigation = useRouter();
  const responsiveHeading = useResponsiveHeadingStyle();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getInitial = (user) => {
    if (!user) return '';
    if (user.name && user.name.length > 0) return user.name[0].toUpperCase();
    if (user.email && user.email.length > 0) return user.email[0].toUpperCase();
    return '';
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setNewName('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      // Start editing - prefill with current name
      setNewName(user?.name || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    let nameUpdated = false;
    let passwordUpdated = false;

    try {
      // Update name if changed
      if (newName && newName.trim() !== user.name) {
        await updateName(newName);
        nameUpdated = true;
      }

      // Update password if provided
      if (newPassword || currentPassword) {
        if (!currentPassword) {
          throw new Error('Current password is required to change password');
        }
        if (!newPassword) {
          throw new Error('New password is required');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await updatePassword(currentPassword, newPassword);
        passwordUpdated = true;
      }

      // Show success message
      if (nameUpdated && passwordUpdated) {
        Alert.alert('Success', 'Your name and password have been updated');
      } else if (nameUpdated) {
        Alert.alert('Success', 'Your name has been updated');
      } else if (passwordUpdated) {
        Alert.alert('Success', 'Your password has been updated');
      } else {
        Alert.alert('No Changes', 'No changes were made to your profile');
      }

      // Reset form and exit edit mode
      setNewName('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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
      'Are you sure you want to delete your books?\nThis action cannot be undone and all your book data will be permanently deleted.',
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
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
        <ThemedText style={styles.emailText}>{user.email}</ThemedText>
        <Spacer height={20} />

        {/* Edit Profile Section */}
        {!isEditing ? (
          <ThemedButton onPress={handleEditToggle} style={styles.editButton}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </ThemedButton>
        ) : (
          <View style={styles.editForm}>
            <ThemedText title={true} style={styles.sectionTitle}>
              Edit Profile
            </ThemedText>
            <Spacer height={15} />

            {/* Name Field */}
            <ThemedText style={styles.label}>Name</ThemedText>
            <ThemedTextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              style={styles.input}
            />
            <Spacer height={20} />

            {/* Password Section */}
            <ThemedText style={styles.label}>Change Password (Optional)</ThemedText>
            <Spacer height={10} />
            <ThemedTextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              secureTextEntry
              style={styles.input}
            />
            <Spacer height={10} />
            <ThemedTextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 8 characters)"
              secureTextEntry
              style={styles.input}
            />
            <Spacer height={10} />
            <ThemedTextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
              style={styles.input}
            />
            <Spacer height={25} />

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <ThemedButton
                onPress={handleSaveChanges}
                style={[styles.actionButton, { opacity: isSaving ? 0.5 : 1 }]}
                disabled={isSaving}
              >
                <ThemedText style={styles.buttonText}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </ThemedText>
              </ThemedButton>
              <ThemedButton
                onPress={handleEditToggle}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.uiBackground,
                    borderColor: theme.uiBorder,
                  },
                ]}
                disabled={isSaving}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </ThemedButton>
            </View>
          </View>
        )}

        <Spacer height={30} />
        {readBooks.length > 0 && (
          <ThemedText title={true} style={responsiveHeading}>
            Reading History:
          </ThemedText>
        )}
        <Spacer height={10} />

        {booksLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : readBooks.length > 0 ? (
          <>
            {[...readBooks].map((book) => (
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
                        resizeMode="cover"
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
                          resizeMode="contain"
                          accessibilityLabel="Placeholder Book Cover"
                          accessibilityRole="image"
                        />
                      </View>
                    )}
                  </>
                </View>
              </View>
            ))}
          </>
        ) : (
          <ThemedText style={styles.readBookStatement}>
            No books read yet.
          </ThemedText>
        )}
        <Spacer height={30} />
      </ScrollView>
    </ThemedView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: 'berlin-sans-fb-bold',
    fontWeight: 'normal',
    letterSpacing: 1,
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 0,
  },
  emailText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
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
    borderWidth: 2,
    overflow: 'hidden',
  },
  initialText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  editButton: {
    maxWidth: 200,
    width: '100%',
  },
  editButtonText: {
    fontFamily: 'berlin-sans-fb',
    fontSize: 16,
    letterSpacing: 1,
  },
  editForm: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    maxWidth: '48%',
  },
  buttonText: {
    fontFamily: 'berlin-sans-fb',
    fontSize: 14,
    letterSpacing: 1,
  },
  readBookStatement: {
    fontSize: 16,
    textAlign: 'center',
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
