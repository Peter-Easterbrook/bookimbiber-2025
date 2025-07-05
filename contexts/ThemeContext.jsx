import { createContext, useState } from 'react';
import { useColorScheme as RNUseColorScheme } from 'react-native';

export const ThemeContext = createContext({
  scheme: 'light',
  toggleScheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = RNUseColorScheme();
  const [overrideScheme, setOverrideScheme] = useState('light');
  const scheme = overrideScheme;

  // Simple toggle between light and dark
  const toggleScheme = () => {
    setOverrideScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ scheme, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
