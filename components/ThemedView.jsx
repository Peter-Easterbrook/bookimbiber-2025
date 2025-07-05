import { LinearGradient } from 'expo-linear-gradient';
import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { blueShades, cornShades } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedView = ({ style, safe = false, ...props }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const gradientColors =
    (scheme || fallback) === 'dark' ? blueShades : cornShades;

  if (!safe)
    return (
      <LinearGradient
        colors={gradientColors}
        style={[{ flex: 1 }, style]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        {...props}
      />
    );
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={gradientColors}
      style={[
        { flex: 1 },
        style,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      {...props}
    />
  );
};

export default ThemedView;
