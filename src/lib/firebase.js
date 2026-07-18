import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, query, orderBy, limit, updateDoc, increment, where } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged as onAuthChange } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = () =>
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key-here';

let app = null;
let db = null;
let auth = null;

export function initFirebase() {
  if (!isFirebaseConfigured()) return null;
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth };
  } catch (e) {
    console.warn('[Firebase] Init failed:', e.message);
    return null;
  }
}

export function getDb() {
  if (db) return db;
  const init = initFirebase();
  return init ? init.db : null;
}

export function getFirebaseAuth() {
  if (auth) return auth;
  const init = initFirebase();
  return init ? init.auth : null;
}

// ─── Authentication ────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) throw new Error("Firebase Auth not initialized");
  
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(authInstance, provider);
    const user = result.user;
    
    // Create/update user profile in Firestore
    const db = getDb();
    if (db) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          xp: 0,
          rank: 'Pemula',
          createdAt: Date.now()
        });
      }
    }
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

export async function logOut() {
  const authInstance = getFirebaseAuth();
  if (authInstance) {
    await signOut(authInstance);
  }
}

export function onAuthStateChanged(callback) {
  const authInstance = getFirebaseAuth();
  if (authInstance) {
    return onAuthChange(authInstance, callback);
  }
  return () => {};
}

// ─── User Profile & XP ───────────────────────────────────────────────────
export async function getUserProfile(uid) {
  const database = getDb();
  if (!database || !uid) return null;
  const userRef = doc(database, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export function calculateRank(xp) {
  if (xp < 1000) return 'Pemula';
  if (xp < 3000) return 'Pelajar';
  if (xp < 7000) return 'Sarjana';
  if (xp < 15000) return 'Cendekiawan';
  if (xp < 30000) return 'Master';
  return 'Grandmaster';
}

export async function addXpToUser(uid, xpAmount) {
  const database = getDb();
  if (!database || !uid) return false;
  try {
    const userRef = doc(database, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentXp = userSnap.data().xp || 0;
      const newXp = currentXp + xpAmount;
      const newRank = calculateRank(newXp);
      
      await updateDoc(userRef, {
        xp: increment(xpAmount),
        rank: newRank
      });
      return { xp: newXp, rank: newRank };
    }
  } catch (e) {
    console.error("Error adding XP:", e);
  }
  return false;
}

// ─── Score Submission ────────────────────────────────────────────────────────
export async function submitScore(scoreData, uid = null) {
  const database = getDb();
  
  if (database && uid) {
    try {
      await addDoc(collection(database, 'scores'), {
        ...scoreData,
        uid: uid,
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
      });
      // Add XP
      if (scoreData.score) {
        await addXpToUser(uid, scoreData.score);
      }
      return { success: true, source: 'firebase' };
    } catch (e) {
      console.error('[Firebase] submitScore error:', e);
    }
  }

  // localStorage fallback
  try {
    let scores = [];
    try {
      scores = JSON.parse(localStorage.getItem('ca_scores') || '[]');
      if (!Array.isArray(scores)) scores = [];
    } catch (parseError) {
      scores = []; // Reset if corrupted
    }

    const entry = {
      ...scoreData,
      id: `local_${Date.now()}`,
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
    };
    scores.unshift(entry);
    localStorage.setItem('ca_scores', JSON.stringify(scores.slice(0, 500)));
    return { success: true, source: 'local' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── Global XP Leaderboard ─────────────────────────────────────────────────
export async function getLeaderboard() {
  const database = getDb();
  let firebaseScores = [];
  let source = 'local';
  
  if (database) {
    try {
      let q = query(
        collection(database, 'users'),
        orderBy('xp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      firebaseScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      source = 'firebase';
    } catch (e) {
      console.error('[Firebase] getLeaderboard error:', e);
    }
  }

  // Get local scores
  let localScores = [];
  try {
    let scores = [];
    try {
      scores = JSON.parse(localStorage.getItem('ca_scores') || '[]');
      if (!Array.isArray(scores)) scores = [];
    } catch (parseError) {
      scores = [];
    }
    const userMap = {};
    
    scores.forEach(s => {
      const name = s.name || 'Anonim';
      if (!userMap[name]) {
        userMap[name] = { uid: `local_${name}`, name: name, xp: 0, rank: 'Pemula', photoURL: null, school: s.school || '' };
      }
      userMap[name].xp += (s.score || 0);
    });

    localScores = Object.values(userMap);
    localScores.forEach(user => {
      user.rank = calculateRank(user.xp);
    });
  } catch (e) {
    console.error('Local leaderboard error:', e);
  }
  
  // Merge and sort
  const combined = [...firebaseScores];
  localScores.forEach(localUser => {
    // Only add local user if not already in Firebase list by name
    if (!combined.find(u => u.name === localUser.name)) {
      combined.push(localUser);
    }
  });

  combined.sort((a, b) => b.xp - a.xp);
  
  return { data: combined.slice(0, 100), source: source };
}

// ─── Get Quiz History (Local) ───────────────────────────────────────────────
export function getQuizHistory() {
  try {
    const scores = JSON.parse(localStorage.getItem('ca_scores') || '[]');
    return scores;
  } catch {
    return [];
  }
}

// ─── Custom Quizzes (User-Generated) ───────────────────────────────────────
export async function createCustomQuiz(quizData, uid) {
  const database = getDb();
  if (!database || !uid) throw new Error("Firebase Auth/DB not ready");
  
  try {
    const docRef = await addDoc(collection(database, 'quizzes'), {
      ...quizData,
      createdBy: uid,
      createdAt: Date.now(),
      plays: 0
    });
    return docRef.id;
  } catch (e) {
    console.error("Error creating quiz:", e);
    throw e;
  }
}

export async function getCustomQuiz(quizId) {
  const database = getDb();
  if (!database) return null;
  try {
    const docRef = doc(database, 'quizzes', quizId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error("Error getting quiz:", e);
    return null;
  }
}

export async function submitCustomQuizScore(quizId, scoreData, uid) {
  const database = getDb();
  if (!database) return false;
  try {
    await addDoc(collection(database, 'quiz_results'), {
      quizId,
      ...scoreData,
      uid,
      createdAt: Date.now()
    });
    // Increment play count
    const quizRef = doc(database, 'quizzes', quizId);
    await updateDoc(quizRef, { plays: increment(1) });
    
    // Add XP for playing custom quiz (e.g., base XP + score)
    if (uid) await addXpToUser(uid, scoreData.score || 100);
    
    return true;
  } catch (e) {
    console.error("Error submitting custom score:", e);
    return false;
  }
}

export async function getCustomQuizLeaderboard(quizId) {
  const database = getDb();
  if (!database) return [];
  try {
    let q = query(
      collection(database, 'quiz_results'),
      where('quizId', '==', quizId)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort in JS to avoid needing a Firebase composite index
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 50);
  } catch (e) {
    console.error("Error getting custom quiz LB:", e);
    return [];
  }
}

export { isFirebaseConfigured };
