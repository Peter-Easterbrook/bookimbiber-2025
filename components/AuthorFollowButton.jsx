import { useContext, useState } from 'react';
import { useColorScheme, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedButton from './ThemedButton';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthors } from '../hooks/useAuthors';

/**
 * AuthorFollowButton Component
 * Button to follow/unfollow an author
 */
const AuthorFollowButton = ({ 
  authorName, 
  authorId = null, 
  style,
  size = 'medium' // small, medium, large
}) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  
  const { followedAuthors, followAuthor, unfollowAuthor, authorsLoading } = useAuthors();
  const [localLoading, setLocalLoading] = useState(false);

  // Check if author is already followed
  const isFollowing = followedAuthors.some(
    a => a.authorName.toLowerCase() === authorName.toLowerCase()
  );

  const followedAuthor = followedAuthors.find(
    a => a.authorName.toLowerCase() === authorName.toLowerCase()
  );

  const handlePress = async () => {
    if (localLoading) return;
    
    setLocalLoading(true);
    
    try {
      if (isFollowing && followedAuthor) {
        // Confirm unfollow
        Alert.alert(
          'Unfollow Author',
          `Stop following ${authorName}? You won't get notifications about their new releases.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Unfollow', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await unfollowAuthor(followedAuthor.$id);
                } catch (error) {
                  Alert.alert('Error', 'Failed to unfollow author. Please try again.');
                }
              }
            }
          ]
        );
      } else {
        // Follow author
        await followAuthor({
          name: authorName,
          id: authorId,
          booksCount: 1,
          genres: [],
        });
        
        Alert.alert(
          'Following Author! 📚',
          `You're now following ${authorName}. We'll notify you when they release new books.`,
          [{ text: 'Got it!' }]
        );
      }
    } catch (error) {
      const message = error.message === 'Already following this author' 
        ? 'You are already following this author!'
        : 'Failed to follow author. Please try again.';
      
      Alert.alert('Error', message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Size configurations
  const getButtonConfig = () => {
    switch (size) {
      case 'small':
        return {
          buttonStyle: { paddingHorizontal: 8, paddingVertical: 4 },
          textStyle: { fontSize: 12 },
          iconSize: 14
        };
      case 'large':
        return {
          buttonStyle: { paddingHorizontal: 16, paddingVertical: 12 },
          textStyle: { fontSize: 16 },
          iconSize: 20
        };
      default: // medium
        return {
          buttonStyle: { paddingHorizontal: 12, paddingVertical: 8 },
          textStyle: { fontSize: 14 },
          iconSize: 16
        };
    }
  };

  const config = getButtonConfig();
  const buttonColor = isFollowing ? theme.warningBackground : theme.uiBackground;
  const textColor = isFollowing ? theme.warningText : theme.textColor;
  const iconName = isFollowing ? 'person-remove' : 'person-add';
  const buttonText = isFollowing ? 'Following' : 'Follow';

  return (
    <ThemedButton
      onPress={handlePress}
      disabled={localLoading || authorsLoading}
      style={[
        styles.button,
        config.buttonStyle,
        { 
          backgroundColor: buttonColor,
          borderColor: theme.uiBorder,
        },
        style
      ]}
    >
      <Ionicons 
        name={iconName}
        size={config.iconSize} 
        color={textColor}
        style={styles.icon}
      />
      <ThemedText 
        style={[
          config.textStyle, 
          { color: textColor },
          styles.buttonText
        ]}
      >
        {localLoading ? 'Loading...' : buttonText}
      </ThemedText>
    </ThemedButton>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 0.5,
  },
});

export default AuthorFollowButton;