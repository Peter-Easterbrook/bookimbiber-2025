import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../../hooks/useUser';

export default function LogoutScreen() {
  const { logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Call logout and redirect to login or home
    logout();
    // Optionally, you can redirect to login or home after logout
    console.log('Logout successful!');
    setTimeout(() => {
      router.replace('/login');
    }, 500);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' />
    </View>
  );
}
