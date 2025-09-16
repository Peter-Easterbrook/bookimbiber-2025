import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedLogoText from '../../components/ThemedLogoText';
import ThemedPasswordInput from '../../components/ThemedPasswordInput';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useUser } from '../../hooks/useUser';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigation = useRouter();
  const { login, user, logout } = useUser();

  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  // Theme-aware warning colors with top-level fallbacks
  const warningColor = (theme && theme.warning) || Colors.warning;
  const warningBg =
    (theme && theme.warningBackground) || Colors.warningBackground;

  const handleSubmit = async () => {
    setError(null);
    try {
      await login(email, password);
      navigation.navigate('/profile');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Please check your input.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          flexGrow: 1,
          minHeight: '100%', // ensure ScrollView content fills the screen
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingVertical: 24,
        }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'android' ? 100 : 20}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Pressable style={{ width: '100%' }} onPress={Keyboard.dismiss}>
          <ThemedLogoText width={200} height={200} />
          <Spacer height={30} />
          <View style={styles.headerIconBlock}>
            <ThemedText title={true} style={styles.title}>
              Login to your account
            </ThemedText>
            <Ionicons
              name="person-circle-outline"
              size={30}
              color={theme.iconColor}
            />
          </View>
          <Spacer height={20} />
          <View style={styles.inputBlock}>
            <ThemedTextInput
              style={{ marginBottom: 20 }}
              placeholder="Email..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <ThemedPasswordInput
              style={{ marginBottom: 20 }}
              placeholder="Password..."
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.buttons}>
              <ThemedButton
                href="/register"
                style={[{ opacity: 0.8 }, styles.themedButton]}
              >
                <ThemedText>Register</ThemedText>
                <Entypo name="feather" size={24} color={theme.iconColor} />
              </ThemedButton>
              <ThemedButton
                onPress={handleSubmit}
                style={[{ opacity: 1.2 }, styles.themedButton]}
              >
                <ThemedText>Login</ThemedText>
                <AntDesign name="login" size={24} color={theme.iconColor} />
              </ThemedButton>
            </View>
            <Spacer />
            {error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: warningBg, borderColor: warningColor },
                ]}
              >
                <ThemedText style={[styles.errorText, { color: warningColor }]}>
                  {error.includes('Rate limit') || error.includes('Too many')
                    ? '⏱️ '
                    : '❌ '}
                  {error}
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
    width: '100%',
  },
  headerIconBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 26,
    marginBottom: 20,
  },
  inputBlock: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: '300',
    fontSize: 18,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 0,
  },
  themedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 200,
    width: '49%',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  errorContainer: {
    borderWidth: 0.5,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
});
