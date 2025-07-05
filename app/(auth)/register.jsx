import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedLogo from '../../components/ThemedLogo';
import ThemedPasswordInput from '../../components/ThemedPasswordInput';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedView from '../../components/ThemedView';
import { Colors } from '../../constants/Colors';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useUser } from '../../hooks/useUser';

const Register = () => {
  const navigation = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { user, register } = useUser();
  const { scheme } = useContext(ThemeContext);
  const fallback = useColorScheme();
  const theme = Colors[scheme || fallback] ?? Colors.light;

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email || !password) {
      setError('Please check your input.');
      return;
    }
    try {
      await register(name, email, password);
      navigation.navigate('/profile');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <ThemedView style={styles.container}>
            <ThemedLogo width={200} height={200} />
            <Spacer height={30} />
            <View style={styles.headerIconBlock}>
              <ThemedText title={true} style={styles.title}>
                Register for an account
              </ThemedText>
              <Ionicons
                name='person-circle-outline'
                size={30}
                color={theme.iconColor}
              />
            </View>
            <Spacer height={20} />
            <View style={styles.inputBlock}>
              <ThemedTextInput
                style={{ marginBottom: 20 }}
                placeholder='Name...'
                value={name}
                onChangeText={setName}
                autoCapitalize='words'
              />
              <ThemedTextInput
                style={{ marginBottom: 20 }}
                placeholder='Email...'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
              />
              <ThemedPasswordInput
                style={{ marginBottom: 20 }}
                placeholder='Password...'
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.buttons}>
                <ThemedButton
                  href='/login'
                  style={[{ opacity: 0.8 }, styles.themedButton]}
                >
                  <ThemedText>Login</ThemedText>
                  <AntDesign name='login' size={24} color={theme.iconColor} />
                </ThemedButton>
                <ThemedButton
                  onPress={handleSubmit}
                  style={[{ opacity: 1.2 }, styles.themedButton]}
                >
                  <ThemedText>Register</ThemedText>
                  <Entypo name='feather' size={24} color={theme.iconColor} />
                </ThemedButton>
              </View>
              <Spacer />
              {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            </View>
          </ThemedView>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
  },
  headerIconBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputBlock: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  title: {
    fontWeight: '300',
    fontSize: 18,
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 18,
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
  pressed: {
    opacity: 0.75,
  },
  error: {
    color: Colors.warning,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderRadius: 5,
    letterSpacing: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.warningBackground,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
});
