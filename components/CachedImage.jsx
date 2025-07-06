import { Image } from 'react-native';

const CachedImage = ({
  source,
  style,
  resizeMode,
  fallbackSource,
  ...props
}) => {
  // Helper function to ensure HTTPS URLs for better production compatibility
  const getSecureImageUrl = (url) => {
    if (!url) return null;
    return url.replace('http://', 'https://');
  };

  // Process the source to ensure HTTPS
  const processedSource = source?.uri
    ? { uri: getSecureImageUrl(source.uri) }
    : source;

  const handleError = (error) => {
    console.log(
      'Image load error:',
      error.nativeEvent?.error || 'Unknown error'
    );
  };

  return (
    <Image
      source={processedSource}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
      {...props}
    />
  );
};

export default CachedImage;
