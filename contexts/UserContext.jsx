import { createContext, useEffect, useState } from 'react';
import { ID } from 'react-native-appwrite';
import { account } from '../lib/appwrite';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  console.log('🔄 UserProvider rendered', { user: !!user, authChecked });

  async function login(email, password) {
    try {
      await account.createEmailPasswordSession(email, password);
      const response = await account.get();
      setUser(response);
    } catch (error) {
      console.error('Error creating account:', error);
      throw Error('Please check your input.');
    }
  }

  async function register(name, email, password) {
    try {
      console.log('Registering user:', { name, email }); // Don't log password

      // Validate inputs locally first
      if (!name || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific Appwrite error codes
      if (error.code === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.code === 400) {
        throw new Error('Invalid input. Please check your details');
      } else if (error.message.includes('password')) {
        throw new Error('Password must be at least 8 characters long');
      } else if (error.message.includes('email')) {
        throw new Error('Please enter a valid email address');
      } else {
        // Throw the actual error message instead of generic one
        throw new Error(
          error.message || 'Registration failed. Please try again.'
        );
      }
    }
  }

  async function logout() {
    await account.deleteSession('current');
    setUser(null);
  }

  async function getInitialUserValue() {
    if (isInitializing) {
      console.log('⚠️ Already initializing, skipping...');
      return;
    }

    setIsInitializing(true);
    console.log('🚀 getInitialUserValue called');

    try {
      // First check if there's an active session
      const session = await account.getSession('current');

      if (session) {
        // Only call account.get() if there's an active session
        const response = await account.get();
        console.log('✅ Appwrite session found:', response);
        setUser(response);
      } else {
        console.log('ℹ️ No active session found');
        setUser(null);
      }
    } catch (error) {
      // Handle both session and account.get() errors gracefully
      if (error.code === 401 || error.message.includes('missing scope')) {
        console.log('ℹ️ No authenticated user, setting user to null');
        setUser(null);
      } else {
        console.error('❌ Unexpected Appwrite error:', error);
        setUser(null);
      }
    } finally {
      console.log('🏁 Setting authChecked to true');
      setAuthChecked(true);
      setIsInitializing(false);
    }
  }

  useEffect(() => {
    console.log('🎯 useEffect triggered');
    getInitialUserValue();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, login, register, logout, authChecked }}
    >
      {children}
    </UserContext.Provider>
  );
};
