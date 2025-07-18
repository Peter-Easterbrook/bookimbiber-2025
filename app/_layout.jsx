import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ThemedView from '../components/ThemedView';
import ThemeToggle from '../components/ThemeToggle';
import { Colors } from '../constants/Colors';
import { BooksProvider } from '../contexts/BooksContext';
import { ThemeContext, ThemeProvider } from '../contexts/ThemeContext';
import { UserContext, UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <BooksProvider>
            <RootLayoutContent />
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
  const { user, authChecked } = useContext(UserContext);

  const [fontsLoaded] = useFonts({
    'berlin-sans-fb': require('../assets/fonts/Berlinsans.otf'),
    'berlin-sans-fb-bold': require('../assets/fonts/Berlinsans_bold.ttf'),
  });

  if (!fontsLoaded || !authChecked) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size='large' color={theme.iconColor} />
      </ThemedView>
    );
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <InnerLayout />
    </>
  );
}

function InnerLayout() {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { user } = useContext(UserContext);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        animation: 'fade_from_bottom',
      }}
    >
      {/* Always declare all screens */}
      <Stack.Screen name='(auth)' options={{ headerShown: false }} />
      <Stack.Screen name='(dashboard)' options={{ headerShown: false }} />
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
          title: 'home',
          headerTitle: '',
          headerLeft: () => (
            <Link href='/create' style={{ marginLeft: 16 }}>
              <MaterialCommunityIcons
                name='book-edit-outline'
                size={24}
                color={theme.iconColor}
              />
            </Link>
          ),
          headerRight: () => <ThemeToggle />,
        }}
      />
      <Stack.Screen
        name='privacy-policy'
        options={{
          title: '',
          headerLeft: () => (
            <Link href='/'>
              <Ionicons
                name='arrow-back-sharp'
                size={24}
                color={theme.iconColor}
              />
            </Link>
          ),
        }}
      />
    </Stack>
  );
}
