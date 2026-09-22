// core/badges.js
// Fusion des systèmes de badges de vinted2beebs et vinted2leboncoin- (doublon
// quasi total dans les deux extensions d'origine : même page, même logique de
// scan, seul le style visuel changeait).
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.Badges = (function () {
  const SCANNED_ATTR = "data-ms-scanned";

  function extractItemIdFromHref(href) {
    const m = (href || "").match(/\/items\/(\d+)/);
    return m ? m[1] : null;
  }

  function findCardContainer(link) {
    // Vinted change régulièrement ses data-testid ; plusieurs sélecteurs
    // plausibles avant de retomber sur le lien lui-même.
    return (
      link.closest('[data-testid*="grid-item"]') ||
      link.closest('[data-testid*="item-box"]') ||
      link.closest("article") ||
      link.closest("div") ||
      link
    );
  }

  function addBadge(card, className, label, title) {
    if (!card || card.querySelector(`.${className}`)) return;
    if (getComputedStyle(card).position === "static") card.style.position = "relative";
    const badge = document.createElement("div");
    badge.className = className;
    badge.textContent = label;
    badge.title = title;
    card.appendChild(badge);
  }

  function removeBadge(card, className) {
    card?.querySelector(`.${className}`)?.remove();
  }

  // Scanne les liens /items/ visibles et pose un badge pour chaque item déjà
  // exporté vers `destination` (interroge le background).
  async function scanGridForBadges({ destination, className, label, title, root = document }) {
    const links = root.querySelectorAll(`a[href*="/items/"]:not([${SCANNED_ATTR}])`);
    if (links.length === 0) return;

    let exportedIds = [];
    try {
      const res = await chrome.runtime.sendMessage({ type: "MS_GET_ALL_EXPORTED", payload: { destination } });
      exportedIds = res && res.success ? res.data : [];
    } catch (e) {
      return; // service worker pas encore prêt, on retentera au prochain scan
    }
    const exportedSet = new Set(exportedIds);

    links.forEach((link) => {
      link.setAttribute(SCANNED_ATTR, "1");
      const itemId = extractItemIdFromHref(link.getAttribute("href"));
      if (!itemId) return;
      if (exportedSet.has(itemId)) {
        addBadge(findCardContainer(link), className, label, title);
      }
    });
  }

  function updateBadgeForItem(itemId, exported, { className, label, title }) {
    document.querySelectorAll(`a[href*="/items/${itemId}"]`).forEach((link) => {
      const card = findCardContainer(link);
      if (exported) addBadge(card, className, label, title);
      else removeBadge(card, className);
    });
  }

  return { scanGridForBadges, updateBadgeForItem, addBadge, removeBadge, findCardContainer, extractItemIdFromHref };
})();
