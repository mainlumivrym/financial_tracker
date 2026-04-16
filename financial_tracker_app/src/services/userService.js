import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';

const USERS_COLLECTION = 'users';

// Create a new user profile
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: userId, ...userData };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { id: userId, ...updates };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Check if username exists
export const checkUsernameExists = async (username) => {
  try {
    // Note: This requires a composite index on username field
    // For now, we'll skip this check, but you can add it later
    // with proper Firestore queries
    return false;
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
};

// Save FCM token for push notifications
export const saveFCMToken = async (userId) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Get Expo push token with explicit projectId
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: '5df51602-ff91-4990-8169-b1d54cf6979c'
    })).data;
    
    // Save to Firestore
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      fcmToken: token,
      updatedAt: Timestamp.now()
    });

    console.log('FCM token saved:', token);
    return token;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return null;
  }
};
