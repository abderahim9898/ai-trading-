import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Plan, School, Recommendation } from '../types';

// User operations
export const updateUserPlan = async (userId: string, plan: string, subscriptionId: string) => {
  const planLimits = {
    free: 1,
    pro: 5,
    elite: 15
  };
  
  await updateDoc(doc(db, 'users', userId), {
    plan,
    subscriptionId,
    recommendation_limit: planLimits[plan as keyof typeof planLimits]
  });
};

export const incrementUserUsage = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    used_today: increment(1)
  });
};

export const resetDailyUsage = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    used_today: 0
  });
};

// Recommendations - Fixed to match security rules path structure
export const saveRecommendation = async (recommendation: Omit<Recommendation, 'id'>) => {
  const { userId } = recommendation;
  
  // Create a document in the path: /recommendations/{userId}/recommendations/{autoId}
  // This matches the security rule: /recommendations/{userId}/{document=**}
  const docRef = await addDoc(collection(db, 'recommendations', userId, 'recommendations'), {
    ...recommendation,
    timestamp: serverTimestamp()
  });
  return docRef.id;
};

export const getUserRecommendations = async (userId: string, limitCount = 10) => {
  // Query from the path: /recommendations/{userId}/recommendations
  const q = query(
    collection(db, 'recommendations', userId, 'recommendations'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Recommendation[];
};

// Featured Signals - Admin curated examples
export const getFeaturedSignals = async () => {
  try {
    const q = query(
      collection(db, 'featured_signals'),
      where('featured', '==', true),
      orderBy('date', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching featured signals:', error);
    return [];
  }
};

export const saveFeaturedSignal = async (signal: any) => {
  try {
    const docRef = await addDoc(collection(db, 'featured_signals'), {
      ...signal,
      createdAt: serverTimestamp(),
      featured: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving featured signal:', error);
    throw error;
  }
};

export const updateFeaturedSignal = async (signalId: string, updates: any) => {
  try {
    await updateDoc(doc(db, 'featured_signals', signalId), updates);
  } catch (error) {
    console.error('Error updating featured signal:', error);
    throw error;
  }
};

export const deleteFeaturedSignal = async (signalId: string) => {
  try {
    await deleteDoc(doc(db, 'featured_signals', signalId));
  } catch (error) {
    console.error('Error deleting featured signal:', error);
    throw error;
  }
};

// Plans
export const getPlans = async () => {
  const snapshot = await getDocs(collection(db, 'plans'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Plan[];
};

export const createPlan = async (plan: Omit<Plan, 'id'>) => {
  const docRef = await addDoc(collection(db, 'plans'), plan);
  return docRef.id;
};

export const updatePlan = async (planId: string, updates: Partial<Omit<Plan, 'id'>>) => {
  await updateDoc(doc(db, 'plans', planId), updates);
};

export const deletePlan = async (planId: string) => {
  await deleteDoc(doc(db, 'plans', planId));
};

// Schools
export const getSchools = async () => {
  const snapshot = await getDocs(collection(db, 'schools'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
};

export const createSchool = async (school: Omit<School, 'id'>) => {
  const docRef = await addDoc(collection(db, 'schools'), school);
  return docRef.id;
};

export const updateSchool = async (schoolId: string, updates: Partial<Omit<School, 'id'>>) => {
  await updateDoc(doc(db, 'schools', schoolId), updates);
};

export const deleteSchool = async (schoolId: string) => {
  await deleteDoc(doc(db, 'schools', schoolId));
};

// Admin operations
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
};