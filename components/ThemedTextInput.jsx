import { useContext } from 'react';
import { TextInput, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemedTextInput({
  style,
  placeholderTextColor,
  ...props
}) {
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  return (
    <TextInput
      // use 50% opacity placeholder by default
      placeholderTextColor={placeholderTextColor || `${theme.text}B3`}
      autoCapitalize="none"
      style={[
        {
          backgroundColor: theme.uiBackground,
          color: theme.text, // entered text stays fully opaque
          paddingVertical: 16,
          paddingLeft: 10,
          borderRadius: 5,
          alignSelf: 'center',
          width: '100%',
          maxWidth: 500,
          borderColor: theme.uiBorder,
          borderWidth: 0.5,
          fontFamily: 'berlin-sans-fb',
          opacity: 1,
          letterSpacing: 1,
          fontSize: 18,
        },
        style,
      ]}
      {...props}
    />
  );
}
