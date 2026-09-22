// core/images-bg.js — utilisé UNIQUEMENT dans le service worker.
// Fusion des deux implémentations trouvées : la conversion par chunks de
// vinted2leboncoin- (blobToBase64) est plus sûre en service worker MV3 que le
// FileReader de vinted2beebs (pas garanti disponible dans tous les contextes
// de service worker), donc c'est celle-ci qui est reprise.
self.MultiSell = self.MultiSell || {};

self.MultiSell.ImagesBG = (function () {
  async function blobToBase64(blob) {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return `data:${blob.type || "image/jpeg"};base64,${btoa(binary)}`;
  }

  // Récupère une liste d'URLs d'images (contourne le CORS en fetchant depuis
  // le service worker, qui a les host_permissions nécessaires) et renvoie
  // des dataURL prêtes à être réinjectées comme File côté content script.
  async function fetchAsDataUrls(urls) {
    const out = [];
    for (const url of (urls || []).slice(0, 20)) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`[MultiSell] HTTP ${res.status} pour ${url}`);
          continue;
        }
        const blob = await res.blob();
        const dataUrl = await blobToBase64(blob);
        const filename = url.split("/").pop().split("?")[0] || `photo-${Date.now()}.jpg`;
        out.push({ url, dataUrl, filename });
      } catch (err) {
        // Si ce fetch échoue même en background, le domaine de l'image n'est
        // probablement pas couvert par host_permissions (voir manifest.json).
        console.warn(`[MultiSell] Échec fetch background pour ${url}`, err.message);
      }
    }
    return out;
  }

  return { fetchAsDataUrls };
})();
