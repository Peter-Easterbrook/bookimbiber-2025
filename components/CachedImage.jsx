import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useImageCache } from '../hooks/useImageCache';

const CachedImage = ({
  source,
  style,
  resizeMode,
  fallbackSource,
  ...props
}) => {
  const [imageSource, setImageSource] = useState(source);
  const [hasError, setHasError] = useState(false);
  const { getImageSource } = useImageCache();

  useEffect(() => {
    if (source?.uri) {
      loadCachedImage(source.uri);
    } else {
      setImageSource(source);
    }
  }, [source]);

  const loadCachedImage = async (url) => {
    try {
      // Try direct URL first (bypass cache in preview builds)
      setImageSource({ uri: url });

      // Then try cached version
      const cachedSource = await getImageSource(url);
      if (cachedSource) {
        setImageSource(cachedSource);
      }
    } catch (error) {
      console.error('Error loading cached image:', error);
      setHasError(true);
      // Fallback to original source or placeholder
      setImageSource(fallbackSource || source);
    }
  };

  const handleError = (error) => {
    console.error('Image load error:', error);
    setHasError(true);
    if (fallbackSource) {
      setImageSource(fallbackSource);
    }
  };

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
      {...props}
    />
  );
};

export default CachedImage;
