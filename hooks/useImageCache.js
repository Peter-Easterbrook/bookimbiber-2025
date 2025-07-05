import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';

const CACHE_DIRECTORY = FileSystem.cacheDirectory + 'book_covers/';

export const useImageCache = () => {
  const [cacheSize, setCacheSize] = useState(0);

  const initCache = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, {
          intermediates: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize cache directory:', error);
    }
  };

  const getCacheFilename = (url) => {
    const hash = url.replace(/[^a-zA-Z0-9]/g, '_');
    return `${hash}.jpg`;
  };

  const getCachedImagePath = (url) => {
    if (!url) return null;
    return CACHE_DIRECTORY + getCacheFilename(url);
  };

  const isCached = async (url) => {
    if (!url) return false;
    try {
      const cachedPath = getCachedImagePath(url);
      const fileInfo = await FileSystem.getInfoAsync(cachedPath);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  };

  const cacheImage = async (url) => {
    if (!url) return null;

    try {
      await initCache();

      const cachedPath = getCachedImagePath(url);
      const isAlreadyCached = await isCached(url);

      if (isAlreadyCached) {
        return cachedPath;
      }

      const downloadResult = await FileSystem.downloadAsync(url, cachedPath);

      if (downloadResult.status === 200) {
        return cachedPath;
      } else {
        console.error('Failed to download image:', downloadResult.status);
        return null;
      }
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  };

  const getImageSource = async (url) => {
    if (!url) return null;

    const isAlreadyCached = await isCached(url);

    if (isAlreadyCached) {
      return { uri: getCachedImagePath(url) };
    } else {
      cacheImage(url);
      return { uri: url };
    }
  };

  const clearCache = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(CACHE_DIRECTORY);
        await initCache();
      }
      await updateCacheSize();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  };

  const updateCacheSize = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
      if (!dirInfo.exists) {
        setCacheSize(0);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(CACHE_DIRECTORY);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY + file);
        totalSize += fileInfo.size || 0;
      }

      setCacheSize(totalSize);
    } catch (error) {
      console.error('Failed to get cache size:', error);
      setCacheSize(0);
    }
  };

  useEffect(() => {
    initCache();
    updateCacheSize();
  }, []);

  return {
    cacheImage,
    getImageSource,
    clearCache,
    cacheSize,
    updateCacheSize,
  };
};
