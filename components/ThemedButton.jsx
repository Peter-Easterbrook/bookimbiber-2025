import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

function ThemedButton({ style, href, onPress, children, ...props }) {
  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;
  const router = useRouter();
  const handlePress = () => {
    if (onPress) onPress();
    if (href) router.push(href);
  };
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: theme.buttonBackground,
          borderColor: theme.uiBorder,
          borderWidth: 0.5,
        },
        pressed && Platform.OS !== 'android' && styles.pressed,
        style,
      ]}
      android_ripple={{
        color: theme.rippleColor,
        borderless: false,
      }}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    // dynamic colors applied inline via theme
    maxWidth: 200,
    width: '100%',
    marginVertical: 10,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: 2,
    // boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
  pressed: {
    opacity: 0.5,
  },
});

export default ThemedButton;
