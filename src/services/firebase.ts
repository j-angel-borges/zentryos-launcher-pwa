import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import type { DeviceFirestoreState } from '../types/zentry';

export const firebaseConfig = {
  apiKey: "AIzaSyD36pVBqXzjlxSXmQD0LhVvJpQtvEp1xmk",
  authDomain: "zentryos.firebaseapp.com",
  projectId: "zentryos",
  storageBucket: "zentryos.firebasestorage.app",
  messagingSenderId: "730964985085",
  appId: "1:730964985085:web:e1be19b66ab19966566a94",
  measurementId: "G-X9D970ZWR8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const DEFAULT_DEVICE_ID = 'dev_redmi9_mateo';

export const simulateDeviceState: DeviceFirestoreState = {
  deviceId: DEFAULT_DEVICE_ID,
  isLocked: false,
  lockReason: null,
  batteryLevel: 85,
  networkStatus: 'online',
  lastSeenAt: new Date().toISOString()
};

export function subscribeToDeviceState(
  callback: (state: DeviceFirestoreState) => void,
  deviceId: string = DEFAULT_DEVICE_ID
): () => void {
  try {
    const devRef = doc(db, 'devices', deviceId);
    return onSnapshot(
      devRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        const activePolicy = data.activePolicy || {};
        const isLocked = Boolean(activePolicy.isLocked);
        const lockReason = activePolicy.lockReason || 'Bloqueo remoto por el padre';
        const batteryLevel = data.batteryLevel ?? 85;
        const networkStatus = data.networkStatus || 'online';
        const lastSeenAt = data.lastSeenAt?.toDate?.()?.toISOString?.() || new Date().toISOString();

        callback({
          deviceId,
          isLocked,
          lockReason,
          batteryLevel,
          networkStatus,
          lastSeenAt
        });
      },
      (err) => console.warn('Firestore device listener warning:', err)
    );
  } catch (err) {
    console.warn('Fallback device state simulation active:', err);
    return () => {};
  }
}
