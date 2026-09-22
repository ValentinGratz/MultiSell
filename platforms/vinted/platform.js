// platforms/vinted/platform.js
// Point d'assemblage côté Vinted : remplace les deux panneaux séparés (un
// par extension d'origine) par un seul panneau MultiSell listant toutes les
// destinations disponibles, comme prévu dans l'interface cible (section 8
// du brief).
var MultiSell = window.MultiSell || (window.MultiSell = {});

// Phase 3/4 uniquement : Opla et Shopify ne sont pas des destinations tant
// que leur étude technique (phases 8/9) n'a pas été faite.
const MS_DESTINATIONS = [
  { id: "beebs", label: "Beebs" },
  { id: "leboncoin", label: "Leboncoin" },
];

async function msSendMessage(type, payload) {
  return chrome.runtime.sendMessage({ type, payload });
}

function msRemovePanel() {
  document.getElementById("ms-panel")?.remove();
}

async function msRenderPanel(listing) {
  msRemovePanel();
  const box = document.createElement("div");
  box.id = "ms-panel";
  document.body.appendChild(box);

  const exportedFlags = {};
  for (const dest of MS_DESTINATIONS) {
    const res = await msSendMessage("MS_CHECK_EXPORTED", { destination: dest.id, sourceId: listing.sourceId });
    exportedFlags[dest.id] = !!(res && res.data);
  }

  function renderButtons() {
    return MS_DESTINATIONS.map((dest) => {
      const done = exportedFlags[dest.id];
      return `<button class="ms-dest-btn" data-dest="${dest.id}" ${done ? "disabled" : ""}>${
        done ? `✅ Exporté vers ${dest.label}` : `🚀 Préparer vers ${dest.label}`
      }</button>`;
    }).join("");
  }

  box.innerHTML = `
    <b>⚡ MultiSell</b>
    <div class="ms-line">📷 ${listing.photos.length} photos</div>
    <div class="ms-line">📝 ${listing.title.slice(0, 60)}</div>
    <div class="ms-line">💰 ${listing.price || "?"}</div>
    ${renderButtons()}
    <div class="ms-diag" id="ms-diag"></div>
  `;
  box.querySelector("#ms-diag").textContent = MultiSell.Diagnostics.buildExtractionReport(listing);

  box.querySelectorAll(".ms-dest-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.disabled) return;
      const destId = btn.dataset.dest;
      btn.disabled = true;
      btn.textContent = "Préparation...";

      const res = await msSendMessage("MS_PREPARE_TRANSFER", { listing, destination: destId });
      if (!res || !res.success) {
        btn.disabled = false;
        btn.textContent = `Erreur — réessayer (${destId})`;
        return;
      }

      const destUrl = destId === "beebs" ? "https://www.beebs.app/fr/listing" : "https://www.leboncoin.fr/deposer-une-annonce";
      window.open(destUrl, "_blank");
      exportedFlags[destId] = true;
      btn.textContent = `✅ Exporté vers ${MS_DESTINATIONS.find((d) => d.id === destId).label}`;
    });
  });
}

async function msInitSingleItemPage() {
  const listing = MultiSell.VintedExtractor.extractSingleItemData();
  if (!listing.sourceId) return;
  await msRenderPanel(listing);
}

function msInitGridPage() {
  MultiSell.VintedGrid.syncScrapedItems();
  MS_DESTINATIONS.forEach((dest) => {
    MultiSell.Badges.scanGridForBadges({
      destination: dest.id,
      className: "ms-grid-badge",
      label: "⚡",
      title: `Déjà exporté vers ${dest.label}`,
    });
  });
}

MultiSell.VintedPlatform = { msInitSingleItemPage, msInitGridPage };
