import { Ionicons } from '@expo/vector-icons'; // Added for icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native'; // Added View
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';

const NotificationsScreen = () => {
  const { scheme } = useContext(ThemeContext);
  const fallback = 'light';
  const theme = Colors[scheme || fallback] ?? Colors.light;

  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem('bookimbiber_notifications');
      const hist = raw ? JSON.parse(raw) : [];
      setItems(hist);
    } catch (e) {
      console.warn('Failed loading notifications', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      const next = items.map((i) => (i.id === id ? { ...i, read: true } : i));
      setItems(next);
      await AsyncStorage.setItem(
        'bookimbiber_notifications',
        JSON.stringify(next)
      );
    } catch (e) {
      console.warn('Failed to mark notification as read', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      await AsyncStorage.setItem(
        'bookimbiber_notifications',
        JSON.stringify(next)
      );
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => markRead(item.id)}
            style={[
              styles.card,
              {
                backgroundColor: item.read
                  ? theme.activeBackground
                  : theme.buttonBackgroundFocused,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <ThemedText title={true} style={styles.title}>
                  {item.author} — {item.books.map((b) => b.title).join(', ')}
                </ThemedText>
                <ThemedText style={styles.timestamp}>
                  {new Date(item.ts).toLocaleString()}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={Colors.warning}
                />
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <ThemedText style={[styles.fallbackText, { color: theme.textColor }]}>
            No notifications
          </ThemedText>
        }
      />
    </ThemedView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'berlin-sans-fb-bold',
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});
