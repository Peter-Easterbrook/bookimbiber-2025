import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * Hook to handle safe area insets and edge-to-edge display compatibility
 * Compatible with Android 14 and earlier versions
 * @returns {Object} Object containing insets and helper functions
 */
export const useEdgeToEdge = () => {
  const insets = useSafeAreaInsets();

  // Helper function to get safe area styles for containers
  const getSafeAreaStyle = (options = {}) => {
    const {
      top = true,
      bottom = true,
      left = true,
      right = true,
    } = options;

    return {
      paddingTop: top ? insets.top : 0,
      paddingBottom: bottom ? insets.bottom : 0,
      paddingLeft: left ? insets.left : 0,
      paddingRight: right ? insets.right : 0,
    };
  };

  // Helper function to get minimum safe area for content
  const getContentSafeArea = () => ({
    paddingTop: Math.max(insets.top, 20), // Ensure minimum padding
    paddingBottom: Math.max(insets.bottom, 20),
    paddingLeft: Math.max(insets.left, 16),
    paddingRight: Math.max(insets.right, 16),
  });

  // Check if device supports basic safe area handling
  const isSafeAreaSupported = Platform.OS === 'android' && Platform.Version >= 23;

  return {
    insets,
    getSafeAreaStyle,
    getContentSafeArea,
    isSafeAreaSupported,
  };
};

export default useEdgeToEdge;