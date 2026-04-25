import { openDB } from 'idb';

const DB_NAME = 'MindWellOffline';
const STORE_NAME = 'pendingEntries';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// Save an entry locally when offline
export const saveOfflineEntry = async (entry) => {
  const db = await initDB();
  return db.add(STORE_NAME, { ...entry, createdAt: new Date().toISOString() });
};

// Get all entries that haven't been sent to the server yet
export const getOfflineEntries = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// Clear the "waiting room" after successful sync
export const clearOfflineEntries = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
};