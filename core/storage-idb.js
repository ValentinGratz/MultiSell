// core/storage-idb.js — utilisé UNIQUEMENT dans le service worker (background.js
// via importScripts). C'est la version la plus mature trouvée dans les deux
// extensions d'origine (vinted2leboncoin-), reprise quasi telle quelle et
// généralisée pour stocker n'importe quel type d'annonce scrapée.
self.MultiSell = self.MultiSell || {};

self.MultiSell.StorageIDB = (function () {
  const DB_NAME = "multisell";
  const DB_VERSION = 1;
  const STORE_NAME = "listings";

  let dbPromise = null;

  function getDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("ts", "ts", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        db.onclose = () => { dbPromise = null; };
        resolve(db);
      };

      request.onerror = (event) => {
        dbPromise = null;
        reject(event.target.error || new Error("IndexedDB open failed"));
      };
    });
    return dbPromise;
  }

  function fallbackId(item) {
    if (item && item.id) return item.id;
    if (item && item.sourceUrl) {
      const m = item.sourceUrl.match(/\/items\/(\d+)/);
      if (m) return m[1];
    }
    return Date.now().toString() + Math.random().toString(36).slice(2);
  }

  async function put(rawItem) {
    const item = { ts: Date.now(), ...rawItem };
    item.id = fallbackId(item); // jamais undefined -> jamais rejeté par keyPath
    const db = await getDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return item;
  }

  async function getAll() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function count() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  }

  async function clear() {
    const db = await getDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  }

  // Éviction LRU en cas de dépassement de quota côté chrome.storage.local
  // (le quota ne concerne pas IndexedDB lui-même, mais l'index d'IDs qu'on
  // maintient à côté — voir background.js).
  async function deleteOldestPercent(percent) {
    const all = await getAll();
    if (all.length === 0) return 0;
    const sorted = all.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
    const nToDelete = Math.max(1, Math.ceil(sorted.length * percent));
    const toDelete = sorted.slice(0, nToDelete);

    const db = await getDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      toDelete.forEach((item) => store.delete(item.id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return toDelete.length;
  }

  return { put, getAll, count, clear, deleteOldestPercent };
})();
