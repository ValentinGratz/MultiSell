// platforms/leboncoin/form.js
// Repris quasi tel quel de vinted2leboncoin- : Leboncoin est un wizard
// multi-étapes dont on ne connaît pas l'état initial, donc remplissage
// non-destructif (un seul remplissage par champ, jamais d'écrasement d'une
// saisie manuelle) + surveillance continue tant que tout n'est pas rempli.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.LeboncoinForm = (function () {
  function createState() {
    return { filledTitle: false, filledDescription: false, filledPrice: false, filledImages: false, imagesAttemptFailed: false };
  }

  async function tryFillTitle(state, data) {
    if (state.filledTitle || !data.title) return;
    const el = MultiSell.Form.findField([
      'input[name="subject"]',
      'input[name="title"]',
      'input[id*="title"]',
      'input[placeholder*="titre" i]',
      '[data-testid*="title"] input',
    ]);
    if (el) state.filledTitle = MultiSell.Form.setReactValue(el, data.title);
  }

  async function tryFillDescription(state, data) {
    if (state.filledDescription || !data.description) return;
    const el = MultiSell.Form.findField([
      'textarea[name="body"]',
      'textarea[name="description"]',
      'textarea[id*="description"]',
      'textarea[placeholder*="description" i]',
      '[data-testid*="description"] textarea',
    ]);
    if (el) state.filledDescription = MultiSell.Form.setReactValue(el, data.description);
  }

  async function tryFillPrice(state, data) {
    if (state.filledPrice || !data.price) return;
    const el = MultiSell.Form.findField([
      'input[name="price"]',
      'input[id*="price"]',
      'input[placeholder*="prix" i]',
      '[data-testid*="price"] input',
    ]);
    if (el) state.filledPrice = MultiSell.Form.setReactValue(el, data.price);
  }

  async function tryFillImages(state, data) {
    if (state.filledImages || state.imagesAttemptFailed || !data.images || data.images.length === 0) return;

    const fileInput = document.querySelector(
      'input[type="file"][accept*="image"][multiple], input[type="file"][multiple], input[type="file"][accept*="image"], input[type="file"]'
    );
    if (!fileInput) return; // pas encore monté, on réessaiera au prochain mutation event

    const files = await MultiSell.Form.dataUrlsToFiles(data.images, "leboncoin");
    if (files.length === 0) {
      state.imagesAttemptFailed = true;
      return;
    }
    state.filledImages = MultiSell.Form.injectFiles(fileInput, files);
    if (!state.filledImages) state.imagesAttemptFailed = true;
  }

  async function attemptFill(state, data) {
    await tryFillImages(state, data);
    await tryFillTitle(state, data);
    await tryFillDescription(state, data);
    await tryFillPrice(state, data);
    return state;
  }

  return { createState, attemptFill };
})();
