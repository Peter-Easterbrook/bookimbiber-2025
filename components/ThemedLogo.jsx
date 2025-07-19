import { Image } from 'react-native';
import Logo from '../assets/icon.png'; // Assuming you have a logo image

const ThemedLogo = ({ width = 250, height = 250, style, ...props }) => {
  return (
    <Image
      source={Logo}
      {...props}
      style={[{ width, height, resizeMode: 'contain' }, style]}
      accessibilityLabel="Logo"
      accessibilityRole="image"
    />
  );
};

export default ThemedLogo;
