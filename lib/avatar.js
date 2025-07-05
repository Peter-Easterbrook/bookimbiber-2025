import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Pick an image from camera or gallery, then upload via UserContext callbacks
export const openImagePicker = async (source, uploadAvatar, setIsUploading) => {
  // Request library permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission needed',
      'Please grant permission to access photos'
    );
    return;
  }
  let result;
  if (source === 'camera') {
    const camStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus.status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant permission to access camera'
      );
      return;
    }
    result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  }

  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    const uri = asset.uri;
    const ext = uri.split('.').pop().toLowerCase();
    const mimeType = asset.type ? `${asset.type}/${ext}` : `image/${ext}`;
    const imageFile = {
      name: `avatar_${Date.now()}.${ext}`,
      type: mimeType,
      size: asset.fileSize || 0,
      uri,
    };
    try {
      setIsUploading(true);
      await uploadAvatar(imageFile);
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      let errorMessage = 'Failed to upload avatar';
      if (err.message.includes('authorized')) {
        errorMessage = 'Permission denied. Please try logging out and back in.';
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  }
};

export const renderAvatar = () => {
  const avatarUrl = userProfile?.avatar
    ? getAvatarUrl(userProfile.avatar)
    : null;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, styles.avatarImage]}
      />
    );
  } else {
    return (
      <Ionicons
        name='person-circle-outline'
        size={100}
        color={theme.iconColor}
        style={styles.avatar}
      />
    );
  }
};
