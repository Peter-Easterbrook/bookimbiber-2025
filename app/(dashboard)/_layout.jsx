import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import ThemeToggle from '../../components/ThemeToggle';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { UserContext } from '../../contexts/UserContext';

// Hamburger menu button component
function DrawerToggleButton() {
  const navigation = useNavigation();
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  return (
    <Ionicons
      name="menu"
      size={24}
      color={theme.iconColor}
      style={{ marginLeft: 16 }}
      onPress={() => navigation.toggleDrawer()}
    />
  );
}

export default function DashboardLayout() {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { user } = useContext(UserContext);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
        headerShadowVisible: false,
        headerTitleAlign: 'center', // Center the title
        headerTitleStyle: {
          fontFamily: 'berlin-sans-fb', // Use your app's font
          fontSize: 18, // Reduce from default size
          letterSpacing: 1, // Slight spacing for readability
        },
        drawerActiveBackgroundColor: theme.activeBackground,
        drawerActiveTintColor: theme.activeText,
        drawerInactiveTintColor: theme.text,
        drawerStyle: {
          backgroundColor: theme.background,
          width: 250,
          borderTopRightRadius: 25, // Add this line
          borderBottomRightRadius: 25, // Add this line
          overflow: 'hidden', // Critical for border radius to work
        },
        headerLeft: () => <DrawerToggleButton />,
        headerRight: () => (
          <View style={{ width: 56, alignItems: 'center' }}>
            <ThemeToggle />
          </View>
        ),
      }}
    >
      {/* Book details - hidden from drawer */}
      <Drawer.Screen
        name="books/[id]"
        options={{
          title: 'Book Details',
          headerLeft: () => (
            <Link href="/books" style={{ marginLeft: 16 }}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={24}
                color={theme.iconColor}
              />
            </Link>
          ),
          drawerItemStyle: { height: 0 }, // Hide from drawer
        }}
      />

      {/* Profile screen */}
      <Drawer.Screen
        name="profile"
        options={{
          title: '',
          headerTitle: 'Profile Page',
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerRight: () => <ThemeToggle />,
        }}
      />

      {/* Books list */}
      <Drawer.Screen
        name="books"
        options={{
          title: 'My Books',
          headerTitle: 'My Books',
          drawerLabel: 'Books', // Changed from "My Books" to "Home"
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bookshelf"
              size={size}
              color={color}
            /> // Changed to home icon
          ),
          headerRight: () => <ThemeToggle />,
        }}
      />
      {/* Create book screen */}
      <Drawer.Screen
        name="create"
        options={{
          title: 'Create Book',
          headerTitle: 'Create Book Page',
          drawerLabel: 'Add Book',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-plus-outline"
              size={size}
              color={color}
            />
          ),
          headerRight: () => <ThemeToggle />,
        }}
      />
    </Drawer>
  );
}
