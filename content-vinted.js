// content-vinted.js
console.log("[MultiSell] chargé sur", location.hostname);

function msRunVinted() {
  if (MultiSell.VintedExtractor.isSingleItemPage()) {
    MultiSell.VintedPlatform.msInitSingleItemPage();
  } else {
    MultiSell.VintedPlatform.msInitGridPage();
  }
}

setTimeout(msRunVinted, 1000); // laisse la SPA Vinted finir son rendu initial

// Vinted est une SPA : navigation interne sans rechargement de page, il faut
// donc réagir aux changements du DOM (scroll infini, changement d'annonce).
MultiSell.observeMutations(msRunVinted, { debounceMs: 800 });
