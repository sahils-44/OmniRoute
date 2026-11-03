import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserRole } from "../types";

export interface UserProfileData {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  businessId?: string;
  createdAt?: unknown;
}

/**
 * Standard Firebase Login Function
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", result.user.uid);
    return result.user;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Login error:", err.message);
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
  role: UserRole = 'customer'
): Promise<FirebaseUser> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Persist user role profile in Firestore `users/{uid}` matching `isValidUser` schema
    try {
      const userDocRef = doc(db, "users", user.uid);
      const businessId =
        role === 'restaurant_owner'
          ? 'biz-restaurant-1'
          : role === 'vendor'
          ? 'biz-vendor-1'
          : undefined;

      const profilePayload: Record<string, unknown> = {
        id: user.uid,
        email: user.email || email,
        name: displayName || user.email?.split('@')[0] || 'User',
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (businessId) {
        profilePayload.businessId = businessId;
      }

      await setDoc(userDocRef, profilePayload);
      console.log(`[Firebase] User profile created in Firestore for ${user.uid} with role ${role}`);
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
