import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useRef, useState } from 'react';
import { ID } from 'react-native-appwrite';
import { account } from '../lib/appwrite';
import { clearNotificationCount } from '../lib/notifications';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false); // Add this

  async function login(email, password) {
    try {
      await account.createEmailPasswordSession(email, password);
      const response = await account.get();
      setUser(response);
    } catch (error) {
      console.error('Error creating account:', error);
      if (error.code === 429 || error.message.includes('Rate limit')) {
        throw new Error(
          'Too many login attempts. Please wait a minute and try again.'
        );
      } else if (error.code === 401) {
        throw new Error(
          'Invalid email or password. Please check your credentials.'
        );
      } else if (error.message.includes('network')) {
        throw new Error(
          'Network error. Please check your connection and try again.'
        );
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  async function register(name, email, password) {
    try {
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
      // Handle rate limiting
      if (error.code === 429 || error.message.includes('Rate limit')) {
        throw new Error(
          'Too many registration attempts. Please wait a minute and try again.'
        );
      } else if (error.code === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.code === 400) {
        throw new Error('Invalid input. Please check your details');
      } else {
        throw new Error(
          error.message || 'Registration failed. Please try again.'
        );
      }
    }
  }

  async function logout() {
    try {
      // First check if there's a valid session
      try {
        const session = await account.getSession('current');
        if (session && session.$id) {
          await account.deleteSession('current');
        } else {
          console.log('No active session found, user already logged out');
        }
      } catch (error) {
        // If error is 401 or missing scope, user is already logged out
        if (error.code === 401 || error.message?.includes('missing scope')) {
          console.log('No valid session found, user already logged out');
        } else {
          // For other errors, try to delete the session anyway
          try {
            await account.deleteSession('current');
          } catch (innerError) {
            console.error('Error during fallback logout:', innerError);
          }
        }
      }

      // Clear user-specific data from AsyncStorage
      const NOTIFS_KEY = 'bookimbiber_notifications';
      await AsyncStorage.removeItem(NOTIFS_KEY);
      await clearNotificationCount();

      // Always set user to null regardless of whether logout succeeded
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still set user to null even if there was an error
      setUser(null);
      throw error;
    }
  }

  async function updateName(newName) {
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    try {
      // Validate name
      if (!newName || newName.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      // Update name in Appwrite
      const updatedAccount = await account.updateName(newName.trim());

      // Update local user state
      setUser(updatedAccount);

      return updatedAccount;
    } catch (error) {
      console.error('Error updating name:', error);
      if (error.code === 429 || error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(error.message || 'Failed to update name. Please try again.');
    }
  }

  async function updatePassword(currentPassword, newPassword) {
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    try {
      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      if (!currentPassword) {
        throw new Error('Current password is required');
      }

      // Update password in Appwrite
      await account.updatePassword(newPassword, currentPassword);

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 429 || error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.code === 401) {
        throw new Error('Current password is incorrect');
      }
      throw new Error(error.message || 'Failed to update password. Please try again.');
    }
  }

  async function deleteBooks() {
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    try {
      // 1. First delete all user's books
      const { databases } = require('../lib/appwrite');
      const { Query } = require('react-native-appwrite');
      const DATABASE_ID = '681e133100381d53f199';
      const COLLECTION_ID = '681e13450007197b1942';

      // Query for all user's books
      const userBooks = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      // Delete each book
      for (const book of userBooks.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, book.$id);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error(
        error.message || 'Failed to delete account. Please try again.'
      );
    }
  }

  async function sendPasswordRecovery(email) {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Use app's deep link URL - when user clicks email link, it opens the app
      const recoveryUrl = 'bookimbiber2025://reset-password';

      await account.createRecovery(email, recoveryUrl);

      return true;
    } catch (error) {
      console.error('Error sending password recovery:', error);
      if (error.code === 429 || error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.code === 404) {
        // For security, don't reveal if email doesn't exist
        throw new Error('If this email exists, you will receive a recovery link.');
      }
      throw new Error(error.message || 'Failed to send recovery email. Please try again.');
    }
  }

  async function resetPassword(userId, secret, newPassword, confirmPassword) {
    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await account.updateRecovery(userId, secret, newPassword, confirmPassword);

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.code === 429 || error.message.includes('Rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.code === 401) {
        throw new Error('Invalid or expired recovery link');
      }
      throw new Error(error.message || 'Failed to reset password. Please try again.');
    }
  }

  async function getInitialUserValue() {
    if (isInitializing) {
      return;
    }
    setIsInitializing(true);

    try {
      const session = await account.getSession('current');

      if (session) {
        const response = await account.get();
        setUser(response);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Check specifically for rate limiting
      if (error.code === 429 || error.message.includes('Rate limit')) {
        console.log('🚫 STILL RATE LIMITED - waiting for ban to lift');
        setUser(null);
      } else if (
        error.code === 401 ||
        error.message.includes('missing scope')
      ) {
        setUser(null);
      } else {
        console.error('❌ Unexpected Appwrite error:', error);
        setUser(null);
      }
    } finally {
      setAuthChecked(true);
      setIsInitializing(false);
    }
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      getInitialUserValue();
    }
  }, []);

  // Automatic logout at midnight
  useEffect(() => {
    if (!user) return; // Don't set up timer if user is not logged in

    const checkMidnight = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's midnight (00:00)
      if (hours === 0 && minutes === 0) {
        console.log('Midnight reached - logging out user');
        logout();
      }
    };

    // Check immediately
    checkMidnight();

    // Check every minute
    const interval = setInterval(checkMidnight, 60000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        authChecked,
        deleteBooks,
        updateName,
        updatePassword,
        sendPasswordRecovery,
        resetPassword
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
