import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import GuestOnly from '../../components/auth/GuestOnly';
import ThemedView from '../../components/ThemedView';

export default function AuthLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <GuestOnly>
        <StatusBar style='auto' />
        <Stack
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        />
      </GuestOnly>
    </ThemedView>
  );
}
