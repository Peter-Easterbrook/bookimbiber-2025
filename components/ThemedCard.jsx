import { useContext } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedCard = ({ style, ...props }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  return (
    <View
      style={[
        {
          backgroundColor: theme.uiBackground,
          borderColor: theme.uiBorder,
          borderWidth: 0.5,
        },
        styles.card,
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    padding: 10,
    // boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
});
