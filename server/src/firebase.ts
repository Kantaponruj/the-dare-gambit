import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _initialized = false;

function ensureInitialized(): void {
  if (_initialized) return;

  if (getApps().length === 0) {
    try {
      const projectId =
        process.env.FIRESTORE_PROJECT_ID ||
        process.env.GCP_PROJECT_ID ||
        "the-dare-gambit-480815";
      console.log(
        `Initializing Firebase Admin for project: ${projectId || "(default)"}`
      );

      initializeApp({
        projectId: projectId,
      });
      console.log("Firebase Admin initialized with default credentials");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
      throw error;
    }
  }

  _initialized = true;
}

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    ensureInitialized();
    if (!_db) _db = getFirestore();
    return (_db as any)[prop];
  },
});

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    ensureInitialized();
    if (!_auth) _auth = getAuth();
    return (_auth as any)[prop];
  },
});
