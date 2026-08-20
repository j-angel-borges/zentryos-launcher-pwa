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
  limit,
  setDoc,
  getDoc
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

export class ZentryLauncherSync {
  private deviceId: string = DEFAULT_DEVICE_ID;
  private unsubscribeDevice: (() => void) | null = null;
  private unsubscribeCommands: (() => void) | null = null;
  private heartbeatInterval: number | null = null;
  private onStateChangeCallback: ((state: DeviceFirestoreState) => void) | null = null;

  public init(
    deviceId: string = DEFAULT_DEVICE_ID,
    onStateChange?: (state: DeviceFirestoreState) => void
  ) {
    this.deviceId = deviceId;
    if (onStateChange) this.onStateChangeCallback = onStateChange;

    this.startListening();
    this.startHeartbeat();
  }

  private startListening() {
    const devRef = doc(db, 'devices', this.deviceId);

    // Listen to real-time Device Lock status & Policy changes
    this.unsubscribeDevice = onSnapshot(
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

        if (this.onStateChangeCallback) {
          this.onStateChangeCallback({
            deviceId: this.deviceId,
            isLocked,
            lockReason,
            batteryLevel,
            networkStatus,
            lastSeenAt
          });
        }
      },
      (err) => console.warn('Firestore device listener warning:', err)
    );

    // Listen to C&C commands queue
    const commandsCol = collection(db, 'devices', this.deviceId, 'commands');
    const q = query(commandsCol, orderBy('issuedAt', 'desc'), limit(5));

    this.unsubscribeCommands = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const docData = change.doc.data();
          if (docData.status === 'pending') {
            console.log('⚡ Comando C&C recibido en Launcher PWA:', docData.type);
            // Mark as applied
            try {
              await updateDoc(change.doc.ref, {
                status: 'applied',
                deliveredAt: serverTimestamp(),
                appliedAt: serverTimestamp()
              });
            } catch (e) {
              console.warn('Command ack error:', e);
            }
          }
        }
      });
    });
  }

  private startHeartbeat() {
    const sendPulse = async () => {
      try {
        const devRef = doc(db, 'devices', this.deviceId);
        await updateDoc(devRef, {
          lastSeenAt: serverTimestamp(),
          networkStatus: 'online'
        });
      } catch (err) {
        // Doc might need initialization
      }
    };

    sendPulse();
    this.heartbeatInterval = window.setInterval(sendPulse, 45000);
  }

  public cleanup() {
    if (this.unsubscribeDevice) this.unsubscribeDevice();
    if (this.unsubscribeCommands) this.unsubscribeCommands();
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}

export const launcherSync = new ZentryLauncherSync();
