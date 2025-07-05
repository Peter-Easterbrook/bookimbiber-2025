import { AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { blueShades, cornShades } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import { useUser } from '../hooks/useUser';

import Spacer from '../components/Spacer';
import ThemedButton from '../components/ThemedButton';
import ThemedLogo from '../components/ThemedLogo';
import ThemedText from '../components/ThemedText';
import { Colors } from '../constants/Colors';

const Home = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const finalScheme = scheme || fallback;
  const gradientColors = finalScheme === 'dark' ? blueShades : cornShades;
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { user, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <ThemedLogo width={250} height={250} />
      <Spacer />

      <ThemedText style={styles.title} title={true}>
        The No 1
      </ThemedText>

      <ThemedText style={styles.subtitle} title={true}>
        Reading List App
      </ThemedText>
      <Spacer />

      {user ? (
        // User is logged in - show Profile and Logout buttons
        <>
          <ThemedButton href='/profile' style={styles.themedButton}>
            <ThemedText>Profile</ThemedText>
            <Ionicons
              size={24}
              name={'person-outline'}
              color={theme.iconColor}
            />
          </ThemedButton>
          <ThemedButton onPress={handleLogout} style={styles.themedButton}>
            <ThemedText>Logout</ThemedText>
            <AntDesign name='logout' size={24} color={theme.iconColor} />
          </ThemedButton>
        </>
      ) : (
        // User is not logged in - show only Login button
        <ThemedButton href='/login' style={styles.themedButton}>
          <ThemedText>Login</ThemedText>
          <AntDesign name='login' size={24} color={theme.iconColor} />
        </ThemedButton>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'berlin-sans-fb',
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 1,
    marginBottom: 5,
  },
  subtitle: {
    fontFamily: 'berlin-sans-fb',
    fontWeight: '300',
    letterSpacing: 1,
    fontSize: 18,
    marginBottom: 20,
  },
  themedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 200,
    width: '49%',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
