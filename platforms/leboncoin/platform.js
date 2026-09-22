// platforms/leboncoin/platform.js
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.LeboncoinPlatform = (function () {
  function showBanner(message) {
    let banner = document.getElementById("ms-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "ms-banner";
      const textSpan = document.createElement("span");
      textSpan.id = "ms-banner-text";
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕";
      closeBtn.addEventListener("click", () => banner.remove());
      banner.appendChild(textSpan);
      banner.appendChild(closeBtn);
      document.body.appendChild(banner);
    }
    document.getElementById("ms-banner-text").textContent = message;
  }

  function notifyProgress(state) {
    const parts = [];
    if (state.filledTitle) parts.push("titre");
    if (state.filledDescription) parts.push("description");
    if (state.filledPrice) parts.push("prix");
    if (state.filledImages) parts.push("photos");

    if (parts.length === 0 && !state.imagesAttemptFailed) return;

    let message = parts.length > 0 ? `Pré-rempli depuis Vinted (MultiSell) : ${parts.join(", ")}.` : "Pré-remplissage en cours...";
    if (state.imagesAttemptFailed) message += " Photos non importées automatiquement (upload manuel requis).";
    message += " Vérifie avant de publier.";
    showBanner(message);
  }

  async function init() {
    const res = await chrome.runtime.sendMessage({ type: "MS_GET_PENDING_TRANSFER", payload: { destination: "leboncoin" } });
    const pending = res && res.success ? res.data : null;
    if (!pending) return; // rien à faire, navigation libre sur Leboncoin

    const state = MultiSell.LeboncoinForm.createState();
    showBanner("Données Vinted prêtes (MultiSell) — en attente du formulaire...");

    async function runFill() {
      await MultiSell.LeboncoinForm.attemptFill(state, pending);
      notifyProgress(state);
      const allDone = state.filledTitle && state.filledDescription && (state.filledImages || state.imagesAttemptFailed);
      if (allDone) {
        await chrome.runtime.sendMessage({ type: "MS_CLEAR_PENDING_TRANSFER", payload: { destination: "leboncoin" } });
      }
    }

    runFill();
    // Le wizard Leboncoin charge ses champs à des moments différents selon
    // l'étape (catégorie -> photos -> titre/description IA -> prix -> ...).
    // On surveille en continu, avec un filet de sécurité à 10 minutes.
    MultiSell.observeMutations(runFill, { debounceMs: 500, maxDurationMs: 10 * 60 * 1000 });
  }

  return { init };
})();
