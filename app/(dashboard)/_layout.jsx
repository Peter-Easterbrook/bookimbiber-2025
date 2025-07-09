import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import UserOnly from '../../components/auth/UserOnly';
import ThemeToggle from '../../components/ThemeToggle';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';

export default function DashboardLayout() {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  return (
    <UserOnly>
      <Tabs
        key={scheme}
        screenOptions={() => ({
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
          headerShadowVisible: false,
          tabBarAnimation: 'shift',
          headerShown: true,
          headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20,
            letterSpacing: 1,
            fontWeight: '300',
            textShadow: '0px 1px 1px rgba(0,0,0,0.2)',
          },
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
          },
          tabBarIconStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0,
            height: '100%',
          },
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0,
            height: '100%',
          },
        })}
      >
        <Tabs.Screen
          name='profile'
          options={{
            // title: 'Profile',
            tabBarShowLabel: false,
            headerTitle: '',
            headerLeft: () => (
              <Link href='/' style={{ marginLeft: 16 }}>
                <Ionicons
                  name='home-outline'
                  size={24}
                  color={theme.iconColor}
                />
              </Link>
            ),
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'person' : 'person-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='books'
          options={{
            // title: 'Books',
            tabBarShowLabel: false,
            headerTitle: '',
            headerTransparent: true,
            headerBlurEffect: 'systemChromeMaterial',
            headerLeft: () => (
              <Link href='/' style={{ marginLeft: 16 }}>
                <Ionicons
                  name='home-outline'
                  size={24}
                  color={theme.iconColor}
                />
              </Link>
            ),
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'book' : 'book-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='create'
          options={{
            // title: 'Create',
            tabBarShowLabel: false,
            headerTitle: '',
            headerLeft: () => (
              <Link href='/' style={{ marginLeft: 16 }}>
                <Ionicons
                  name='home-outline'
                  size={24}
                  color={theme.iconColor}
                />
              </Link>
            ),
            headerRight: () => <ThemeToggle />,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                size={24}
                name={focused ? 'book-edit' : 'book-edit-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='logout'
          options={{
            // title: 'Log out',
            tabBarShowLabel: false,
            headerTitle: '',
            tabBarIcon: ({ color, size, props }) => (
              <AntDesign name='logout' size={24} color={theme.iconColor} />
            ),
          }}
        />
        <Tabs.Screen
          name='books/[id]'
          options={{
            href: null,
            headerShown: true,
            title: '',
            tabBarShowLabel: false,
            headerLeft: () => (
              <Link href='/books' style={{ marginLeft: 16 }}>
                <Ionicons
                  name='arrow-back-circle-outline'
                  size={24}
                  color={theme.iconColor}
                />
              </Link>
            ),
            headerStyle: { backgroundColor: theme.navBackground },
            headerTintColor: theme.title,
            headerTitleAlign: 'center',
          }}
        />
      </Tabs>
    </UserOnly>
  );
}
