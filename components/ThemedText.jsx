import { useContext } from 'react';
import { Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedText = ({ style, title = false, ...props }) => {
  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;

  const textColor = title ? theme.title : theme.text;

  return (
    <Text
      style={[
        style,
        {
          color: textColor,
          fontFamily: title ? 'berlin-sans-fb-bold' : 'berlin-sans-fb',
          letterSpacing: 1,
        },
      ]}
      {...props}
    />
  );
};

export default ThemedText;
