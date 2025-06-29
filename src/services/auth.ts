import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Initialize providers - Only Google and Facebook
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      provider: 'email',
      plan: 'free',
      used_today: 0,
      recommendation_limit: 1,
      subscriptionId: null,
      school: 'default',
      createdAt: serverTimestamp(),
      isAdmin: false
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: 'google',
        plan: 'free',
        used_today: 0,
        recommendation_limit: 1,
        subscriptionId: null,
        school: 'default',
        createdAt: serverTimestamp(),
        isAdmin: false
      });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: 'facebook',
        plan: 'free',
        used_today: 0,
        recommendation_limit: 1,
        subscriptionId: null,
        school: 'default',
        createdAt: serverTimestamp(),
        isAdmin: false
      });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const updateUserPassword = async (newPassword: string) => {
  try {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }
  } catch (error) {
    throw error;
  }
};