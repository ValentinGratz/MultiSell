// core/router.js
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.detectPlatform = function detectPlatform() {
  const host = location.hostname;
  if (host.includes("vinted")) return "vinted";
  if (host.includes("beebs.app")) return "beebs";
  if (host.includes("leboncoin.fr")) return "leboncoin";
  // Opla et Shopify : non implémentés (phases 8 et 9 du plan de migration).
  return null;
};
