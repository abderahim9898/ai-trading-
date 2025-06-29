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

// Admin user management functions
export const updateUserPlanAdmin = async (userId: string, plan: string) => {
  const planLimits = {
    free: 1,
    pro: 5,
    elite: 15
  };
  
  await updateDoc(doc(db, 'users', userId), {
    plan,
    recommendation_limit: planLimits[plan as keyof typeof planLimits],
    used_today: 0 // Reset usage when changing plan
  });
};

export const updateUserUsage = async (userId: string, usedToday: number, recommendationLimit: number) => {
  await updateDoc(doc(db, 'users', userId), {
    used_today: usedToday,
    recommendation_limit: recommendationLimit
  });
};

export const deleteUser = async (userId: string) => {
  try {
    // Delete user document
    await deleteDoc(doc(db, 'users', userId));
    
    // Note: In a production app, you might also want to:
    // 1. Delete user's recommendations
    // 2. Cancel their subscriptions
    // 3. Clean up other related data
    
    console.log(`User ${userId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
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

// Featured Signals - Admin curated examples for homepage
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

export const getAllFeaturedSignals = async () => {
  try {
    const q = query(
      collection(db, 'featured_signals'),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all featured signals:', error);
    return [];
  }
};

export const saveFeaturedSignal = async (signal: any) => {
  try {
    const docRef = await addDoc(collection(db, 'featured_signals'), {
      ...signal,
      createdAt: serverTimestamp(),
      featured: signal.featured || false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving featured signal:', error);
    throw error;
  }
};

export const updateFeaturedSignal = async (signalId: string, updates: any) => {
  try {
    await updateDoc(doc(db, 'featured_signals', signalId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
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

// Convert user recommendation to featured signal
export const promoteToFeaturedSignal = async (recommendation: Recommendation, signalData: any) => {
  try {
    const featuredSignal = {
      pair: signalData.pair || 'UNKNOWN',
      type: signalData.type || 'hold',
      entry: signalData.entry || 0,
      stopLoss: signalData.stopLoss,
      takeProfit1: signalData.takeProfit1,
      takeProfit2: signalData.takeProfit2,
      probability: signalData.probability || 85,
      result: 'profit', // Admin can set this
      profitPips: 0, // Admin can set this
      date: new Date().toISOString().split('T')[0],
      school: recommendation.school,
      featured: true,
      originalRecommendationId: recommendation.id,
      originalUserId: recommendation.userId,
      analysis: recommendation.response
    };
    
    return await saveFeaturedSignal(featuredSignal);
  } catch (error) {
    console.error('Error promoting to featured signal:', error);
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

// Get all recommendations across all users (admin only)
export const getAllRecommendations = async (limitCount = 50) => {
  try {
    // This is a simplified approach - in production you might want to use a different structure
    // For now, we'll get recommendations from all users
    const users = await getAllUsers();
    const allRecommendations: Recommendation[] = [];
    
    for (const user of users.slice(0, 10)) { // Limit to first 10 users to avoid quota issues
      try {
        const userRecs = await getUserRecommendations(user.uid, 5);
        allRecommendations.push(...userRecs);
      } catch (error) {
        console.warn(`Failed to get recommendations for user ${user.uid}:`, error);
      }
    }
    
    // Sort by timestamp and limit
    return allRecommendations
      .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching all recommendations:', error);
    return [];
  }
};