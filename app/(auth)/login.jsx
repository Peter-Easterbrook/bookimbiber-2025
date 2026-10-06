import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useRouter();
  const { login, sendPasswordRecovery } = useUser();

  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;

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
      setError(error.message || 'Please check your input.');
    }
  };

  const handleForgotPasswordClick = () => {
    setRecoveryEmail(email);
    setShowForgotPassword(true);
  };

  const handleForgotPassword = async () => {
    if (!recoveryEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordRecovery(recoveryEmail);
      setShowForgotPassword(false);
      Alert.alert(
        'Check Your Email',
        'If an account exists for this email, we have sent a link to reset your password. Check your spam folder if it does not arrive.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send recovery email');
    } finally {
      setIsSubmitting(false);
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
        <Pressable
          style={{ width: '100%', alignItems: 'center', paddingHorizontal: 0 }}
          onPress={Keyboard.dismiss}
        >
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
            <Spacer height={20} />
            <Pressable
              onPress={handleForgotPasswordClick}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <ThemedText style={styles.forgotPasswordLink}>
                Forgot your password?
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAwareScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowForgotPassword(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.uiBackground },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText title={true} style={styles.modalTitle}>
              Reset Password
            </ThemedText>
            <Spacer height={10} />
            <ThemedText style={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your
              password.
            </ThemedText>
            <Spacer height={20} />
            <ThemedTextInput
              style={styles.modalInput}
              placeholder="Email address"
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Spacer height={20} />
            <View style={styles.modalButtons}>
              <ThemedButton
                onPress={() => setShowForgotPassword(false)}
                style={[styles.modalButton, { opacity: 0.7 }]}
              >
                <ThemedText>Cancel</ThemedText>
              </ThemedButton>
              <ThemedButton
                onPress={handleForgotPassword}
                style={styles.modalButton}
                disabled={isSubmitting}
              >
                <ThemedText>
                  {isSubmitting ? 'Sending...' : 'Send Link'}
                </ThemedText>
              </ThemedButton>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
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
  forgotPasswordLink: {
    fontSize: 14,
    textAlign: 'center',
    // textDecorationLine: 'underline',
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 10,
    padding: 16,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  modalInput: {
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
});
