import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { scheme, toggleScheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.light;
  const iconName = scheme === 'dark' ? 'sunny' : 'moon-outline';

  return (
    <TouchableOpacity onPress={toggleScheme} style={styles.button}>
      <Ionicons name={iconName} size={24} color={theme.iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 16,
    padding: 4,
  },
});
