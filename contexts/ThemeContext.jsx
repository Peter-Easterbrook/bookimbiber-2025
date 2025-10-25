import { createContext, useState } from 'react';

export const ThemeContext = createContext({
  scheme: 'dark',
  toggleScheme: () => {},
});

export function ThemeProvider({ children }) {
  const [scheme, setScheme] = useState('dark');

  // Simple toggle between light and dark
  const toggleScheme = () => {
    setScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    console.log('Theme toggled to:', scheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ scheme, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
