import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useContext } from 'react';
import { Pressable, View, useColorScheme } from 'react-native';
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
    <Pressable
      onPress={() => navigation.toggleDrawer()}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
      accessibilityLabel="Open drawer"
    >
      <Ionicons name="menu" size={24} color={theme.iconColor} />
    </Pressable>
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
        headerStyle: {
          backgroundColor: theme.navBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.title,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: 'berlin-sans-fb',
          fontSize: 18,
          letterSpacing: 2,
        },
        drawerActiveBackgroundColor: theme.activeBackground,
        drawerActiveTintColor: theme.activeText,
        drawerInactiveTintColor: theme.text,
        drawerStyle: {
          backgroundColor: theme.background,
          width: 250,
          borderTopRightRadius: 25,
          borderBottomRightRadius: 25,
          overflow: 'hidden', // Critical for border radius to work
        },
        drawerLabelStyle: {
          fontFamily: 'berlin-sans-fb',
          fontSize: 16,
          letterSpacing: 2,
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
          title: '',
          drawerLabel: 'Books',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bookshelf"
              size={size}
              color={color}
            />
          ),
          headerRight: () => <ThemeToggle />,
        }}
      />
      {/* Create book screen */}
      <Drawer.Screen
        name="create"
        options={{
          title: 'Create Book',
          headerTitle: '',
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
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          drawerLabel: 'Notifications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
