import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
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
import { useBooks } from '../hooks/useBooks';
import { useUser } from '../hooks/useUser';
import ThemedLogo from './ThemedLogo';
import ThemedText from './ThemedText';

export default function CustomDrawerContent(props) {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;
  const { user, logout } = useUser();
  const router = useRouter();
  const { deleteBooks } = useBooks();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
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
          onPress: async () => {
            try {
              await deleteBooks(); // Call the actual function
              Alert.alert('Success!', 'All the books have been deleted.');
              // Refresh the books list
              router.replace('/books');
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete books. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  // Create a consistent label style
  const customLabelStyle = {
    color: theme.text,
    fontFamily: 'berlin-sans-fb',
    letterSpacing: 2,
    fontSize: 16,
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
              borderBottomColor: theme.uiBorder,
              marginVertical: 10,
              marginHorizontal: 15,
            }}
          />
          <DrawerItem
            label="Delete All Books"
            onPress={handleDeleteBooks}
            icon={({ size }) => (
              <Ionicons name="trash-outline" size={size} color={theme.text} />
            )}
            labelStyle={customLabelStyle}
          />
          <DrawerItem
            label="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
            icon={({ size }) => (
              <MaterialIcons name="policy" size={size} color={theme.text} />
            )}
            labelStyle={customLabelStyle}
          />
          <DrawerItem
            label="Logout"
            onPress={handleLogout}
            icon={({ size }) => (
              <AntDesign name="logout" size={size} color={theme.text} />
            )}
            labelStyle={customLabelStyle}
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
    letterSpacing: 2,
  },
  userName: {
    fontSize: 16,
    letterSpacing: 2,
    marginTop: 5,
  },
});
