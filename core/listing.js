// core/listing.js
// Modèle universel d'annonce. Reste volontairement plat et flexible : une
// plateforme peut ne pas fournir un champ, on ne fabrique jamais de valeur.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.Listing = (function () {
  function createEmpty() {
    return {
      title: "",
      description: "",
      price: "",
      currency: "EUR",
      photos: [], // URLs, résolues en dataURL uniquement lors de la préparation d'un transfert
      category: "",
      brand: "",
      size: "",
      condition: "",
      color: "",
      material: "",
      gender: "",
      sourcePlatform: "",
      sourceUrl: "",
      sourceId: "",
      ts: Date.now(),
    };
  }

  // Reprend la logique identique des deux extensions d'origine (extraction
  // de l'ID numérique Vinted depuis l'URL /items/{id}-slug).
  function extractSourceId(url) {
    const m = (url || "").match(/\/items\/(\d+)/);
    if (m) return m[1];
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2);
  }

  return { createEmpty, extractSourceId };
})();
