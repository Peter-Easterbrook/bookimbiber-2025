import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import ThemedView from '../../components/ThemedView';

export default function AuthLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar style='auto' />
      <Stack
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </ThemedView>
  );
}
