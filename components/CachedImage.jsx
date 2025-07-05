import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useImageCache } from '../hooks/useImageCache';

const CachedImage = ({ source, style, resizeMode, ...props }) => {
  const [imageSource, setImageSource] = useState(source);
  const { getImageSource } = useImageCache();

  useEffect(() => {
    if (source?.uri) {
      loadCachedImage(source.uri);
    }
  }, [source]);

  const loadCachedImage = async (url) => {
    try {
      const cachedSource = await getImageSource(url);
      if (cachedSource) {
        setImageSource(cachedSource);
      }
    } catch (error) {
      console.error('Error loading cached image:', error);
      setImageSource(source);
    }
  };

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode={resizeMode}
      {...props}
    />
  );
};

export default CachedImage;
