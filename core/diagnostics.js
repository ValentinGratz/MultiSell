// core/diagnostics.js
// Ni vinted2beebs ni vinted2leboncoin- n'avaient de diagnostic formel (juste
// des console.log épars). Ce module produit un rapport structuré pour
// comprendre rapidement pourquoi une intégration ne fonctionne plus.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.Diagnostics = (function () {
  function checkmark(bool) {
    return bool ? "✓" : "✗";
  }

  function buildExtractionReport(listing) {
    return [
      `Platform: ${listing.sourcePlatform}`,
      `Title: ${checkmark(!!listing.title)}`,
      `Description: ${checkmark(!!listing.description)}`,
      `Price: ${checkmark(!!listing.price)}`,
      `Photos: ${listing.photos.length}`,
      `Brand: ${checkmark(!!listing.brand)}`,
      `Category: ${checkmark(!!listing.category)}`,
    ].join("\n");
  }

  function buildFormFillReport(destination, state) {
    return [
      `Destination: ${destination}`,
      `Title field: ${checkmark(state.filledTitle)}`,
      `Description field: ${checkmark(state.filledDescription)}`,
      `Price field: ${checkmark(state.filledPrice)}`,
      `Photos upload: ${checkmark(state.filledImages)}${state.imagesAttemptFailed ? " (échec, upload manuel requis)" : ""}`,
    ].join("\n");
  }

  return { buildExtractionReport, buildFormFillReport };
})();
