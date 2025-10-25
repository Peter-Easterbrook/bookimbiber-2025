import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import { useAuthors } from '../hooks/useAuthors';

const AuthorFollowButton = ({
  authorName,
  authorId = null,
  style,
  size = 'medium', // small, medium, large
}) => {
  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;

  const { followedAuthors, followAuthor, unfollowAuthor, authorsLoading } =
    useAuthors();
  const [localLoading, setLocalLoading] = useState(false);

  // Check if author is already followed
  const isFollowing = followedAuthors.some(
    (a) => a.authorName.toLowerCase() === (authorName || '').toLowerCase()
  );

  const followedAuthor = followedAuthors.find(
    (a) => a.authorName.toLowerCase() === (authorName || '').toLowerCase()
  );

  const handlePress = async () => {
    if (localLoading || authorsLoading) return;
    setLocalLoading(true);
    try {
      if (isFollowing && followedAuthor) {
        await unfollowAuthor(followedAuthor.$id);
      } else {
        await followAuthor({
          name: authorName,
          id: authorId,
        });
      }
    } catch (e) {
      console.warn('Follow/unfollow failed', e);
    } finally {
      setLocalLoading(false);
    }
  };

  const sizes = {
    small: { paddingHorizontal: 8, paddingVertical: 6, fontSize: 12 },
    medium: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
    large: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
  };

  const s = sizes[size] || sizes.medium;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.button,
        {
          borderColor: theme.uiButtonBorder,
          backgroundColor: isFollowing
            ? theme.buttonBackgroundFocused
            : 'transparent',
        },
        {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
        },
        style,
      ]}
    >
      {localLoading ? (
        <ActivityIndicator size="small" color={theme.uiButtonText} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name={isFollowing ? 'checkmark' : 'add'}
            size={14}
            color={isFollowing ? theme.uiButtonText : theme.iconColor}
            style={styles.icon}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: isFollowing ? theme.uiButtonText : theme.iconColor,
                fontSize: s.fontSize,
              },
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </View>
      )}
    </Pressable>
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
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 0.5,
  },
});

export default AuthorFollowButton;
