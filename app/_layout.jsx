import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ThemedView from '../components/ThemedView';
import { Colors } from '../constants/Colors';
import { AuthorProvider } from '../contexts/AuthorContext';
import { BooksProvider } from '../contexts/BooksContext';
import { ThemeContext, ThemeProvider } from '../contexts/ThemeContext';
import { UserContext, UserProvider } from '../contexts/UserContext';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <BooksProvider>
            <AuthorProvider>
              <RootLayoutContent />
            </AuthorProvider>
          </BooksProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutContent() {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { authChecked } = useContext(UserContext);

  const [fontsLoaded] = useFonts({
    'berlin-sans-fb': require('../assets/fonts/Berlinsans.otf'),
    'berlin-sans-fb-bold': require('../assets/fonts/Berlinsans_bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authChecked]);

  if (!fontsLoaded || !authChecked) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color={theme.iconColor} />
      </ThemedView>
    );
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen
          name="privacy-policy"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
