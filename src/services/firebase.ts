import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
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

export function getStoredDeviceId(): string {
  try {
    return localStorage.getItem('zentry_device_id') || DEFAULT_DEVICE_ID;
  } catch {
    return DEFAULT_DEVICE_ID;
  }
}

export function setStoredDeviceId(id: string) {
  try {
    localStorage.setItem('zentry_device_id', id.trim());
  } catch (e) {
    console.warn('Could not save device ID:', e);
  }
}

export const simulateDeviceState: DeviceFirestoreState = {
  deviceId: getStoredDeviceId(),
  isLocked: false,
  lockReason: null,
  batteryLevel: 85,
  networkStatus: 'online',
  lastSeenAt: new Date().toISOString()
};

// Start live battery & telemetry heartbeat syncing
let heartbeatInterval: any = null;

export async function syncRealDeviceTelemetry(deviceId: string = getStoredDeviceId()) {
  try {
    const devRef = doc(db, 'devices', deviceId);
    let batteryLevel = 85;
    let isCharging = false;

    // Web Battery API
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      try {
        const battery = await (navigator as any).getBattery();
        batteryLevel = Math.round(battery.level * 100);
        isCharging = battery.charging;
      } catch {}
    }

    const snap = await getDoc(devRef);
    if (snap.exists()) {
      await updateDoc(devRef, {
        batteryLevel,
        isCharging,
        networkStatus: navigator.onLine ? 'online' : 'offline',
        lastSeenAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.log('Telemetry sync note:', err);
  }
}

export function startTelemetryHeartbeat(deviceId: string = getStoredDeviceId()) {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  syncRealDeviceTelemetry(deviceId);
  heartbeatInterval = setInterval(() => {
    syncRealDeviceTelemetry(deviceId);
  }, 30000); // Every 30s
}

export function subscribeToDeviceState(
  callback: (state: DeviceFirestoreState) => void,
  deviceId: string = getStoredDeviceId()
): () => void {
  // Start heartbeat
  startTelemetryHeartbeat(deviceId);

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

// ----------------------------------------------------
// Persistencia Firestore para Microapps de Creación
// ----------------------------------------------------

/**
 * Guarda una misión completada en la subcolección de misiones del dispositivo en Firestore
 */
export async function saveMissionToFirestore(mission: {
  id: string;
  title: string;
  category: string;
  badgeReward: string;
  photoUrl?: string;
  deviceId?: string;
}) {
  const deviceId = mission.deviceId || getStoredDeviceId();
  try {
    const missionDocRef = doc(db, 'devices', deviceId, 'completed_missions', mission.id);
    await setDoc(missionDocRef, {
      ...mission,
      completedAt: serverTimestamp(),
      syncedOnline: navigator.onLine
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore mission save error (cached locally):', error);
    return false;
  }
}

/**
 * Guarda un Héroe/Personaje en Firestore
 */
export async function saveHeroToFirestore(hero: {
  id: string;
  name: string;
  archetype: string;
  comicStory?: string;
  imageUrl?: string;
  deviceId?: string;
}) {
  const deviceId = hero.deviceId || getStoredDeviceId();
  try {
    const heroDocRef = doc(db, 'devices', deviceId, 'created_heroes', hero.id);
    await setDoc(heroDocRef, {
      ...hero,
      createdAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore hero save error:', error);
    return false;
  }
}

/**
 * Guarda una ilustración del Lienzo en Firestore
 */
export async function saveArtworkToFirestore(artwork: {
  id: string;
  title?: string;
  originalDrawingUrl: string;
  reimaginedImageUrl?: string;
  storyPrompt?: string;
  deviceId?: string;
}) {
  const deviceId = artwork.deviceId || getStoredDeviceId();
  try {
    const artDocRef = doc(db, 'devices', deviceId, 'gallery_artworks', artwork.id);
    await setDoc(artDocRef, {
      ...artwork,
      createdAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore artwork save error:', error);
    return false;
  }
}

