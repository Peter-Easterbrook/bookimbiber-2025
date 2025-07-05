import { useContext } from 'react';
import { Text, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedText = ({ style, title = false, ...props }) => {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  const textColor = title ? theme.title : theme.text;

  return (
    <Text
      style={[
        style,
        {
          color: textColor,
          fontFamily: 'berlin-sans-fb-bold',
          letterSpacing: 1,
        },
      ]}
      {...props}
    />
  );
};

export default ThemedText;
