import { Ionicons } from '@expo/vector-icons'; // Added for icons
import { useContext } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native'; // Added View
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuthors } from '../../hooks/useAuthors';

const NotificationsScreen = () => {
  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;

  const { notifications, markNotificationRead, deleteNotification } =
    useAuthors();

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => markNotificationRead(item.id)}
            style={[
              styles.card,
              {
                backgroundColor: item.read
                  ? theme.activeBackground
                  : theme.buttonBackgroundFocused,
              },
            ]}
            android_ripple={{
              color: 'rgba(255, 255, 240, 0.4)',
              foreground: true,
            }}
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
                onPress={() => deleteNotification(item.id)}
                style={styles.deleteButton}
                android_ripple={{
                  color: 'rgba(255, 255, 240, 0.4)',
                  foreground: true,
                }}
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
