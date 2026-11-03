import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserRole, UserStatus, ActivityLog } from "../types";

export interface UserProfileData {
  id: string;
  uid?: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
  businessId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Standard Firebase Login Function
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", result.user.uid);
    const profile = await getUserProfile(result.user.uid);
    if (profile && profile.status === 'suspended') {
      await signOut(auth);
      throw new Error('This account has been suspended by platform administration.');
    }
    return result.user;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Login error:", err.message);
    throw error;
  }
};

/**
 * Google Authentication Login / Registration
 */
export const loginWithGoogle = async (defaultRole: UserRole = 'customer'): Promise<{ user: FirebaseUser; role: UserRole; isNew: boolean }> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user profile already exists in Firestore
    const existingProfile = await getUserProfile(user.uid);
    let assignedRole: UserRole = defaultRole;
    let isNew = false;

    if (existingProfile && existingProfile.role) {
      assignedRole = existingProfile.role;
    } else {
      isNew = true;
      // Prohibit admin self-registration
      if (assignedRole === 'admin') assignedRole = 'customer';

      const businessId =
        assignedRole === 'restaurant_owner' || assignedRole === 'hotel_owner'
          ? 'biz-restaurant-1'
          : assignedRole === 'vendor'
          ? 'biz-vendor-1'
          : undefined;

      const userDocRef = doc(db, "users", user.uid);
      const profilePayload: Record<string, unknown> = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'Google User',
        role: assignedRole,
        phone: user.phoneNumber || '+91 98201 12345',
        status: 'active',
        avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (businessId) {
        profilePayload.businessId = businessId;
      }

      try {
        await setDoc(userDocRef, profilePayload);
      } catch (err) {
        console.warn("[Firebase] Could not write Google user profile to Firestore:", err);
      }
    }

    return { user, role: assignedRole, isNew };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Google Auth error:", err.message);
    throw error;
  }
};

/**
 * Password Reset Function
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`[Firebase] Password reset email sent to ${email}`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Password reset error:", err.message);
    throw error;
  }
};

/**
 * Standard Firebase Registration Function
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName?: string,
  role: UserRole = 'customer',
  phone?: string
): Promise<FirebaseUser> => {
  // CRITICAL SECURITY GUARD: Prohibit public administration account creation
  if (role === 'admin') {
    throw new Error('Administration accounts cannot be registered publicly. Please contact platform operations.');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Persist user role profile in Firestore `users/{uid}`
    try {
      const userDocRef = doc(db, "users", user.uid);
      const businessId =
        role === 'restaurant_owner' || role === 'hotel_owner'
          ? 'biz-restaurant-1'
          : role === 'vendor'
          ? 'biz-vendor-1'
          : undefined;

      // All registration roles receive active status immediately (no pending approval required)
      const initialStatus: UserStatus = 'active';

      const profilePayload: Record<string, unknown> = {
        id: user.uid,
        email: user.email || email,
        name: displayName || user.email?.split('@')[0] || 'User',
        role,
        phone: phone || '+91 98201 12345',
        status: initialStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (businessId) {
        profilePayload.businessId = businessId;
      }

      await setDoc(userDocRef, profilePayload);
      console.log(`[Firebase] User profile created in Firestore for ${user.uid} with role ${role} (status: ${initialStatus})`);
    } catch (firestoreErr) {
      console.warn("[Firebase] Could not write user profile to Firestore (check rules/network):", firestoreErr);
    }

    return user;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Registration error:", err.message);
    throw error;
  }
};

/**
 * Standard Firebase Logout Function
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Logout error:", err.message);
    throw error;
  }
};

/**
 * Fetch or initialize User Profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch user profile from Firestore:", err);
    return null;
  }
};

/**
 * Update User Status (Admin Feature: Approve, Suspend, Reactivate)
 */
export const updateUserStatus = async (uid: string, status: UserStatus): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    console.log(`[Firebase] User ${uid} status updated to ${status}`);
  } catch (err) {
    console.warn(`[Firebase] Could not update user ${uid} status:`, err);
    throw err;
  }
};

/**
 * Fetch All Users for Admin User Management
 */
export const getAllUsers = async (): Promise<UserProfileData[]> => {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    const list: UserProfileData[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as UserProfileData);
    });
    return list;
  } catch (err) {
    console.warn("[Firebase] Failed to fetch all users:", err);
    return [];
  }
};

/**
 * Log System Activity to Firestore activityLogs
 */
export const logActivity = async (
  actorId: string,
  actorName: string,
  action: string,
  targetId?: string,
  details?: string
): Promise<void> => {
  try {
    const logsCol = collection(db, "activityLogs");
    await addDoc(logsCol, {
      actorId,
      actorName,
      action,
      targetId: targetId || null,
      details: details || null,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("[Firebase] Could not write activity log:", err);
  }
};
