import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Simple helpers for local notifications used by AuthorContext
export async function ensureNotificationPermissions() {
  try {
    if (!Device.isDevice) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Notification permission check failed', e);
    return false;
  }
}

export async function sendLocalNotification({ title, body }) {
  try {
    const ok = await ensureNotificationPermissions();
    if (!ok) return false;

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });

    return true;
  } catch (e) {
    console.warn('Failed to send local notification', e);
    return false;
  }
}

// small helper to store badge count (optional)
export async function incrementNotificationCount() {
  try {
    const key = 'bookimbiber_unread_count';
    const raw = await AsyncStorage.getItem(key);
    const count = raw ? parseInt(raw, 10) : 0;
    await AsyncStorage.setItem(key, String(count + 1));
  } catch (e) {
    // ignore
  }
}

export async function clearNotificationCount() {
  try {
    await AsyncStorage.setItem('bookimbiber_unread_count', '0');
  } catch (e) {}
}

export async function getNotificationCount() {
  try {
    const raw = await AsyncStorage.getItem('bookimbiber_unread_count');
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    return 0;
  }
}
