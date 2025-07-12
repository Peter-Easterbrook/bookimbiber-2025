import { Stack } from 'expo-router';
import GuestOnly from '../../components/auth/GuestOnly';
import ThemedView from '../../components/ThemedView';

export default function AuthLayout() {
  return (
    <GuestOnly>
      <ThemedView style={{ flex: 1 }}>
        <Stack
          screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
        />
      </ThemedView>
    </GuestOnly>
  );
}
