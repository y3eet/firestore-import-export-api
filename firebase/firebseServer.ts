import {
  ServiceAccount,
  initializeApp,
  cert,
  getApps,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { STORAGE_BUCKET_URL } from "../secretKey";
import serviceAccount from "../serviceAccountKey.json";
const currentApps = getApps();
const app =
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    storageBucket: STORAGE_BUCKET_URL,
  }) ?? currentApps[0];
const adminFirestore = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminFirestore, adminAuth, adminStorage };
