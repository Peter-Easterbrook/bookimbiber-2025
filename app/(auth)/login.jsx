import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
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
  const [showResetCode, setShowResetCode] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetSecret, setResetSecret] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const navigation = useRouter();
  const { login, sendPasswordRecovery, resetPassword } = useUser();

  const { scheme } = useContext(ThemeContext);
  const theme = Colors[scheme] ?? Colors.dark;

  // Theme-aware warning colors with top-level fallbacks
  const warningColor = (theme && theme.warning) || Colors.warning;
  const warningBg =
    (theme && theme.warningBackground) || Colors.warningBackground;

  // Handle deep links from password reset emails
  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleUrl(url);
      }
    };

    handleDeepLink();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUrl = (url) => {
    const parsed = Linking.parse(url);

    // Check if this is a password reset link
    if (parsed.hostname === 'reset-password' && parsed.queryParams) {
      const { userId, secret } = parsed.queryParams;

      if (userId && secret) {
        // Auto-fill the reset form
        setResetUserId(userId);
        setResetSecret(secret);
        setShowResetCode(true);

        Alert.alert(
          'Password Reset',
          'The reset codes have been filled in automatically. Please enter your new password.',
          [{ text: 'OK' }]
        );
      }
    }
  };

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

  // TEMPORARY: Simplified forgot password for free tier
  // TODO: Re-enable full password reset flow when Appwrite platform is properly configured
  const handleForgotPasswordClick = () => {
    Alert.alert(
      'Forgot Password?',
      'Please contact support@onestepweb.dev for password reset assistance.',
      [{ text: 'OK' }]
    );
  };

  // Original forgot password handler (kept for future use)
  const handleForgotPassword = async () => {
    if (!recoveryEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordRecovery(recoveryEmail);
      setShowForgotPassword(false);
      setShowResetCode(true);
      Alert.alert(
        'Check Your Email',
        "We've sent you an email with a User ID and Secret code. Please check your email and enter the codes below to reset your password.",
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send recovery email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !resetSecret || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(
        resetUserId,
        resetSecret,
        newPassword,
        confirmNewPassword
      );
      Alert.alert(
        'Success',
        'Your password has been reset successfully! You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowResetCode(false);
              setResetUserId('');
              setResetSecret('');
              setNewPassword('');
              setConfirmNewPassword('');
              setRecoveryEmail('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reset password');
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

      {/* Reset Password with Code Modal */}
      <Modal
        visible={showResetCode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetCode(false)}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowResetCode(false)}
          >
            <Pressable
              style={[
                styles.modalContent,
                styles.largeModalContent,
                { backgroundColor: theme.uiBackground },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <ThemedText title={true} style={styles.modalTitle}>
                Enter Reset Code
              </ThemedText>
              <Spacer height={10} />
              <ThemedText style={styles.modalDescription}>
                Check your email for the User ID and Secret code, then enter
                them below with your new password.
              </ThemedText>
              <Spacer height={20} />

              <ThemedText style={styles.inputLabel}>User ID</ThemedText>
              <ThemedTextInput
                style={styles.modalInput}
                placeholder="User ID from email"
                value={resetUserId}
                onChangeText={setResetUserId}
                autoCapitalize="none"
              />
              <Spacer height={15} />

              <ThemedText style={styles.inputLabel}>Secret Code</ThemedText>
              <ThemedTextInput
                style={styles.modalInput}
                placeholder="Secret code from email"
                value={resetSecret}
                onChangeText={setResetSecret}
                autoCapitalize="none"
              />
              <Spacer height={15} />

              <ThemedText style={styles.inputLabel}>New Password</ThemedText>
              <ThemedPasswordInput
                style={styles.modalInput}
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Spacer height={15} />

              <ThemedText style={styles.inputLabel}>
                Confirm Password
              </ThemedText>
              <ThemedPasswordInput
                style={styles.modalInput}
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <Spacer height={25} />

              <View style={styles.modalButtons}>
                <ThemedButton
                  onPress={() => setShowResetCode(false)}
                  style={[styles.modalButton, { opacity: 0.7 }]}
                >
                  <ThemedText>Cancel</ThemedText>
                </ThemedButton>
                <ThemedButton
                  onPress={handleResetPassword}
                  style={styles.modalButton}
                  disabled={isSubmitting}
                >
                  <ThemedText>
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </ThemedText>
                </ThemedButton>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAwareScrollView>
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
  largeModalContent: {
    maxWidth: 450,
    maxHeight: '90%',
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.9,
  },
});
