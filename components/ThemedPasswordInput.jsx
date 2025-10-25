import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemedPasswordInput({
  style,
  placeholderTextColor,
  ...props
}) {
  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.passwordContainer, style]}>
      <TextInput
        {...props}
        secureTextEntry={!showPassword}
        placeholderTextColor={placeholderTextColor || `${theme.text}B3`}
        autoCapitalize='none'
        style={[
          {
            backgroundColor: theme.uiBackground,
            color: theme.text,
            paddingVertical: 20,
            paddingLeft: 10,
            borderRadius: 5,
            alignSelf: 'center',
            width: '100%',
            maxWidth: 500,
            borderColor: theme.uiBorder,
            borderWidth: 0.5,
            fontFamily: 'berlin-sans-fb',
            letterSpacing: 1,
            fontSize: 16,
          },
        ]}
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={styles.eyeIcon}
      >
        <Ionicons
          name={showPassword ? 'eye-off' : 'eye'}
          size={24}
          color='#aaa'
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    marginTop: 65,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 450,
    padding: 24,
    borderRadius: 8,
    borderWidth: 0.5,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  eyeIcon: {
    marginLeft: -40,
    zIndex: 1,
  },
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary800,
    textAlign: 'center',
    marginTop: 16,
  },
  buttonText: {
    textTransform: 'uppercase',
    textAlign: 'center',
    color: Colors.white100,
    fontSize: 16,
    fontWeight: '200',
    fontFamily: 'open-sans',
    letterSpacing: 1.5,
  },
  switchText: {
    textAlign: 'center',
    fontFamily: 'open-sans',
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: 5,
    color: Colors.white100,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 16,
  },
});
