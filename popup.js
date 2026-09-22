// popup.js
function sendToBackground(type, payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response || { success: false, error: "Pas de réponse" });
    });
  });
}

function setStatus(msg, isError, autoReset) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = isError ? "#f87171" : "#9ca3af";
  if (autoReset) {
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => { el.textContent = ""; }, 2500);
  }
}

async function refresh() {
  const countRes = await sendToBackground("MS_COUNT_LISTINGS");
  document.getElementById("count").textContent = countRes.success ? countRes.data : "0";

  const beebsRes = await sendToBackground("MS_GET_ALL_EXPORTED", { destination: "beebs" });
  document.getElementById("count-beebs").textContent = beebsRes.success ? beebsRes.data.length : "0";

  const lbcRes = await sendToBackground("MS_GET_ALL_EXPORTED", { destination: "leboncoin" });
  document.getElementById("count-leboncoin").textContent = lbcRes.success ? lbcRes.data.length : "0";

  const usageRes = await sendToBackground("MS_GET_USAGE");
  document.getElementById("usage").textContent = usageRes.success ? `${usageRes.data.mb.toFixed(3)} Mo` : "0 Mo";
}

document.getElementById("clearBtn").addEventListener("click", async () => {
  if (!confirm("Vider tout IndexedDB (annonces synchronisées) ? Irréversible.")) return;
  setStatus("Suppression en cours...");
  const res = await sendToBackground("MS_CLEAR_LISTINGS");
  setStatus(res.success ? "IndexedDB vidé." : `Erreur: ${res.error}`, !res.success, true);
  refresh();
});

document.getElementById("exportBtn").addEventListener("click", async () => {
  setStatus("Export en cours...");
  const res = await sendToBackground("MS_GET_ALL_LISTINGS");
  if (!res.success) {
    setStatus(`Erreur export: ${res.error}`, true, true);
    return;
  }
  const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  if (chrome.downloads) {
    chrome.downloads.download({ url, filename: `multisell_export_${Date.now()}.json` });
  } else {
    window.open(url);
  }
  setStatus(`Export lancé : ${res.data.length} annonces.`, false, true);
});

document.addEventListener("DOMContentLoaded", refresh);
