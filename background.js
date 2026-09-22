// background.js
// Seul fichier autorisé à toucher IndexedDB et à faire les fetch CORS
// (host_permissions du manifest). Routeur de messages inspiré du modèle de
// vinted2leboncoin- (un type par capacité), généralisé pour plusieurs
// destinations (Beebs, Leboncoin, ...) au lieu d'être câblé en dur sur une
// seule.
importScripts("core/storage-idb.js", "core/images-bg.js");

const StorageIDB = self.MultiSell.StorageIDB;
const ImagesBG = self.MultiSell.ImagesBG;

// ---------------------------------------------------------------------------
// Flags "exporté vers {destination}" — stockés dans chrome.storage.local
// sous une clé unique pour limiter le nombre d'accès au storage.
// Forme : { [destination]: { [sourceId]: { date, url } } }
// ---------------------------------------------------------------------------

const EXPORTED_KEY = "multisell_exported";
const PENDING_KEY_PREFIX = "multisell_pending_"; // + destination

async function getExportedMap() {
  const { [EXPORTED_KEY]: map } = await chrome.storage.local.get([EXPORTED_KEY]);
  return map || {};
}

function isQuotaError(err) {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return msg.includes("quota_bytes") || msg.includes("quota exceeded");
}

async function safeStorageSet(data) {
  try {
    await chrome.storage.local.set(data);
    return { success: true };
  } catch (err) {
    if (!isQuotaError(err)) return { success: false, error: err.message || String(err) };
    try {
      const deletedCount = await StorageIDB.deleteOldestPercent(0.2);
      await chrome.storage.local.set(data);
      return { success: true, warning: `Quota dépassé, ${deletedCount} annonces les plus anciennes supprimées d'IndexedDB` };
    } catch (retryErr) {
      return { success: false, error: `Retry après quota échoué: ${retryErr.message || retryErr}` };
    }
  }
}

async function markExported(destination, sourceId, url) {
  const map = await getExportedMap();
  map[destination] = map[destination] || {};
  map[destination][sourceId] = { date: new Date().toISOString(), url };
  return safeStorageSet({ [EXPORTED_KEY]: map });
}

async function unmarkExported(destination, sourceId) {
  const map = await getExportedMap();
  if (map[destination]) delete map[destination][sourceId];
  await chrome.storage.local.set({ [EXPORTED_KEY]: map });
  return { success: true };
}

async function checkExported(destination, sourceId) {
  const map = await getExportedMap();
  return !!(map[destination] && map[destination][sourceId]);
}

async function getAllExported(destination) {
  const map = await getExportedMap();
  return Object.keys(map[destination] || {});
}

// ---------------------------------------------------------------------------
// Routeur de messages
// ---------------------------------------------------------------------------

async function handleMessage(message) {
  const { type, payload } = message || {};

  switch (type) {
    case "MS_FETCH_IMAGES": {
      const data = await ImagesBG.fetchAsDataUrls(payload && payload.urls);
      return { success: true, data };
    }

    case "MS_SAVE_LISTING": {
      const data = await StorageIDB.put(payload);
      return { success: true, data };
    }

    case "MS_GET_ALL_LISTINGS": {
      const data = await StorageIDB.getAll();
      return { success: true, data };
    }

    case "MS_COUNT_LISTINGS": {
      const data = await StorageIDB.count();
      return { success: true, data };
    }

    case "MS_CLEAR_LISTINGS": {
      const data = await StorageIDB.clear();
      return { success: true, data };
    }

    // Prépare un transfert vers `destination` : récupère les photos en
    // dataURL (CORS géré ici) et stocke le tout comme "en attente" pour que
    // le content script de la destination le récupère à l'ouverture.
    case "MS_PREPARE_TRANSFER": {
      const { listing, destination } = payload || {};
      if (!listing || !listing.title) {
        return { success: false, error: "MS_PREPARE_TRANSFER: titre manquant dans le listing" };
      }
      if (!destination) {
        return { success: false, error: "MS_PREPARE_TRANSFER: destination manquante" };
      }

      const images = await ImagesBG.fetchAsDataUrls(listing.photos);
      const enriched = { ...listing, images };
      await chrome.storage.local.set({ [PENDING_KEY_PREFIX + destination]: enriched });
      await markExported(destination, listing.sourceId, listing.sourceUrl);
      return { success: true, data: enriched };
    }

    case "MS_GET_PENDING_TRANSFER": {
      const { destination } = payload || {};
      const key = PENDING_KEY_PREFIX + destination;
      const res = await chrome.storage.local.get([key]);
      return { success: true, data: res[key] || null };
    }

    case "MS_CLEAR_PENDING_TRANSFER": {
      const { destination } = payload || {};
      await chrome.storage.local.remove(PENDING_KEY_PREFIX + destination);
      return { success: true };
    }

    case "MS_MARK_EXPORTED": {
      const { destination, sourceId, url } = payload || {};
      return markExported(destination, sourceId, url);
    }

    case "MS_UNMARK_EXPORTED": {
      const { destination, sourceId } = payload || {};
      return unmarkExported(destination, sourceId);
    }

    case "MS_CHECK_EXPORTED": {
      const { destination, sourceId } = payload || {};
      const data = await checkExported(destination, sourceId);
      return { success: true, data };
    }

    case "MS_GET_ALL_EXPORTED": {
      const { destination } = payload || {};
      const data = await getAllExported(destination);
      return { success: true, data };
    }

    case "MS_GET_USAGE": {
      const bytes = await new Promise((resolve) => {
        if (chrome.storage.local.getBytesInUse) chrome.storage.local.getBytesInUse(null, resolve);
        else resolve(0);
      });
      const count = await StorageIDB.count();
      return { success: true, data: { bytes, mb: bytes / (1024 * 1024), count } };
    }

    default:
      return { success: false, error: `Type de message inconnu: ${type}` };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse(result))
    .catch((err) => sendResponse({ success: false, error: err.message || String(err) }));
  return true; // garde le service worker vivant le temps de la réponse async
});
