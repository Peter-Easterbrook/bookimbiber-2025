import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert, StyleSheet, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';
import { useUser } from '../hooks/useUser';
import ThemedLogo from './ThemedLogo';
import ThemedText from './ThemedText';

export default function CustomDrawerContent(props) {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // After logout, navigate to login screen
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to navigate to login
      router.replace('/login');
    }
  };

  const handleDeleteBooks = () => {
    Alert.alert(
      'Delete All Books',
      'Are you sure you want to delete all books? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement delete books functionality here
            console.log('Delete all books');
          },
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.background }}
    >
      <View style={styles.drawerHeader}>
        <ThemedLogo width={80} height={80} />
        <ThemedText style={styles.appName} title={true}>
          Book Imbiber
        </ThemedText>
        {user && (
          <ThemedText style={styles.userName}>Hello, {user.name}</ThemedText>
        )}
      </View>

      {/* Default drawer items will use the drawer theme colors */}
      <DrawerItemList {...props} />

      {user && (
        <>
          <View
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: theme.borderColor || 'rgba(0,0,0,0.2)',
              marginVertical: 10,
              marginHorizontal: 15,
            }}
          />
          <DrawerItem
            label="Delete All Books"
            onPress={handleDeleteBooks}
            icon={({ size }) => (
              <MaterialIcons
                name="delete-outline"
                size={size}
                color={theme.text}
              />
            )}
            labelStyle={{ color: theme.text }}
          />
          <DrawerItem
            label="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
            icon={({ size }) => (
              <MaterialIcons name="policy" size={size} color={theme.text} />
            )}
            labelStyle={{ color: theme.text }}
          />
          <DrawerItem
            label="Logout"
            onPress={handleLogout}
            icon={({ size }) => (
              <AntDesign name="logout" size={size} color={theme.text} />
            )}
            labelStyle={{ color: theme.text }}
          />
        </>
      )}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontFamily: 'berlin-sans-fb',
    fontSize: 20,
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    marginTop: 5,
  },
});
