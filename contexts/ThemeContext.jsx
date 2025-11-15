import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'bookimbiber_theme_preference';

export const ThemeContext = createContext({
  scheme: 'dark',
  toggleScheme: () => {},
});

export function ThemeProvider({ children }) {
  const [scheme, setScheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setScheme(savedTheme);
          console.log('Theme loaded from storage:', savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Toggle between light and dark and save to AsyncStorage
  const toggleScheme = async () => {
    const newScheme = scheme === 'light' ? 'dark' : 'light';
    setScheme(newScheme);
    console.log('Theme toggled to:', newScheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newScheme);
      console.log('Theme saved to storage:', newScheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ scheme, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
