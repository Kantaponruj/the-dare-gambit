import {
  initializeApp,
  cert,
  getApps,
  applicationDefault,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: applicationDefault(),
    });
    console.log("Firebase Admin initialized with default credentials");
  } catch (error) {
    console.warn(
      "Failed to initialize Firebase Admin with default credentials. Attempts to use Firestore will fail.",
      error
    );
  }
}

export const db = getFirestore();
export const auth = getAuth();
