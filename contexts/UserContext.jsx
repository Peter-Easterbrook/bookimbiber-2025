import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
} from 'firebase/auth';
import { getDocs, writeBatch } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { auth, db, userCollection } from '../lib/firebase';
import { clearNotificationCount } from '../lib/notifications';

export const UserContext = createContext();

// The app-wide user shape: { id, name, email }
const toAppUser = (firebaseUser) =>
  firebaseUser
    ? {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email,
      }
    : null;

// Translate Firebase Auth error codes into messages for the user
function friendlyAuthError(error, fallback) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters long';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'For security, please log out and log in again, then retry.';
    default:
      return error?.message || fallback;
  }
}

// Delete every document in one of the user's subcollections
async function deleteUserCollection(uid, name) {
  const snapshot = await getDocs(userCollection(uid, name));
  // A batch holds up to 500 writes
  for (let i = 0; i < snapshot.docs.length; i += 500) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  async function login(email, password) {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      setUser(toAppUser(firebaseUser));
    } catch (error) {
      console.error('Error logging in:', error.code);
      throw new Error(friendlyAuthError(error, 'Login failed. Please try again.'));
    }
  }

  async function register(name, email, password) {
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

    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(firebaseUser, { displayName: name.trim() });
      setUser(toAppUser(firebaseUser));
    } catch (error) {
      console.error('Registration error:', error.code);
      throw new Error(
        friendlyAuthError(error, 'Registration failed. Please try again.')
      );
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user-specific data from AsyncStorage
      const NOTIFS_KEY = 'bookimbiber_notifications';
      await AsyncStorage.removeItem(NOTIFS_KEY);
      await clearNotificationCount();

      // Always clear the user, whether or not signOut succeeded
      setUser(null);
    }
  }

  async function updateName(newName) {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }

    if (!newName || newName.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
      const updatedUser = toAppUser(auth.currentUser);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating name:', error.code);
      throw new Error(
        friendlyAuthError(error, 'Failed to update name. Please try again.')
      );
    }
  }

  // Firebase needs a recent login for password changes and account deletion
  async function reauthenticate(currentPassword) {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
  }

  async function updatePassword(currentPassword, newPassword) {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    if (!currentPassword) {
      throw new Error('Current password is required');
    }

    try {
      await reauthenticate(currentPassword);
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error.code);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect');
      }
      throw new Error(
        friendlyAuthError(error, 'Failed to update password. Please try again.')
      );
    }
  }

  // Deletes all Bookimbiber data and the Firebase account itself.
  // The Firebase project is shared, so this also removes the login for other apps on it.
  async function deleteAccount(currentPassword) {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }

    if (!currentPassword) {
      throw new Error('Please enter your password to confirm');
    }

    try {
      await reauthenticate(currentPassword);
      const uid = auth.currentUser.uid;
      await deleteUserCollection(uid, 'books');
      await deleteUserCollection(uid, 'authors');
      await AsyncStorage.removeItem(`avatar_${uid}`);
      await AsyncStorage.removeItem(`bookimbiber_notifications_${uid}`);
      await deleteUser(auth.currentUser);
      await clearNotificationCount();
      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error.code);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Password is incorrect');
      }
      throw new Error(
        friendlyAuthError(error, 'Failed to delete account. Please try again.')
      );
    }
  }

  async function sendPasswordRecovery(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    try {
      // Firebase emails a link to its own hosted reset page
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error) {
      console.error('Error sending password recovery:', error.code);
      // For security, don't reveal whether the email exists
      if (error.code === 'auth/user-not-found') {
        return true;
      }
      throw new Error(
        friendlyAuthError(error, 'Failed to send recovery email. Please try again.')
      );
    }
  }

  // Firebase restores the persisted login and reports every sign-in/out here
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(toAppUser(firebaseUser));
      setAuthChecked(true);
    });
    return unsubscribe;
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
        deleteAccount,
        updateName,
        updatePassword,
        sendPasswordRecovery,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
