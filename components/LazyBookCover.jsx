import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import OptimizedImage from './OptimizedImage';
import { ThemeContext } from '../contexts/ThemeContext';
import { getHighQualityCover } from '../lib/googleBooks';

/**
 * LazyBookCover Component
 * Specialized optimized image component for book covers
 * Includes theme-aware placeholders and quality selection
 */
const LazyBookCover = ({
  book,
  style,
  size = 'medium', // small, medium, large
  lazy = true,
  onPress,
  ...props
}) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = scheme || fallback;

  // Determine image URL with fallback
  const getImageUrl = () => {
    if (book?.thumbnail) {
      return getHighQualityCover(book.thumbnail);
    }
    if (book?.coverImage) {
      return book.coverImage.replace('http://', 'https://');
    }
    return null;
  };

  // Size configurations
  const getSizeConfig = (size) => {
    switch (size) {
      case 'small':
        return { width: 60, height: 80, quality: 'low' };
      case 'large':
        return { width: 120, height: 160, quality: 'high' };
      default: // medium
        return { width: 80, height: 107, quality: 'medium' };
    }
  };

  const imageUrl = getImageUrl();
  const sizeConfig = getSizeConfig(size);
  
  // Generate cache key based on book data
  const cacheKey = book?.googleBooksId || 
                   book?.$id || 
                   `${book?.title}-${book?.author}`.replace(/[^a-zA-Z0-9]/g, '_');

  const imageStyle = {
    width: sizeConfig.width,
    height: sizeConfig.height,
    borderRadius: 5,
    ...style,
  };

  return (
    <OptimizedImage
      source={imageUrl ? { uri: imageUrl } : null}
      style={imageStyle}
      quality={sizeConfig.quality}
      lazy={lazy}
      cacheKey={`${cacheKey}_${size}`}
      fadeDuration={200}
      resizeMode="cover"
      onError={(error) => {
        console.log(`Book cover load error for ${book?.title}:`, error?.message);
      }}
      {...props}
    />
  );
};

export default LazyBookCover;