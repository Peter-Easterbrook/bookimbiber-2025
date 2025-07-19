import { useContext } from 'react';
import { Image, useColorScheme } from 'react-native';
import DarkLogo from '../assets/img/myBooks_dark.png';
import LightLogo from '../assets/img/myBooks_light.png';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedLogoMyBooks = ({ width = 250, height = 250, style, ...props }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const finalScheme = scheme || fallback;
  const logo = finalScheme === 'dark' ? DarkLogo : LightLogo;

  return (
    <Image
      source={logo}
      style={[{ width, height, resizeMode: 'contain' }, style]}
      accessibilityLabel="Logo"
      accessibilityRole="image"
      {...props}
    />
  );
};

export default ThemedLogoMyBooks;
