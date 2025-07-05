import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useUser } from '../../hooks/useUser';

export default function LogoutScreen() {
  const { logout } = useUser();
  const router = useRouter();
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        console.log('Logout successful!');
        // Immediate redirect without delay
        router.replace('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if logout fails
        router.replace('/login');
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator
        size='large'
        color={theme.iconColor}
        style={styles.spinner}
      />
      <Text style={[styles.text, { color: theme.text }]}>Logging out...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontFamily: 'berlin-sans-fb',
    fontSize: 16,
    letterSpacing: 1,
    opacity: 0.7,
  },
});
