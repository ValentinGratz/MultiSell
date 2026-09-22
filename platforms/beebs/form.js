// platforms/beebs/form.js
// Repris de vinted2beebs : sélection de champs par placeholder/name/type
// (Beebs n'expose pas de data-testid stables), remplissage via
// MultiSell.Form.setReactValue (fusion des deux techniques d'origine).
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.BeebsForm = (function () {
  async function fillForm(pending) {
    const state = { filledTitle: false, filledDescription: false, filledPrice: false, filledImages: false, imagesAttemptFailed: false };

    window.scrollTo(0, 400);
    await new Promise((r) => setTimeout(r, 200));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));

    const allInputs = [...document.querySelectorAll("input,textarea")];

    const titleEl =
      allInputs.find((i) => (i.placeholder || "").toLowerCase().includes("titre")) ||
      document.querySelector('input[name="title"]') ||
      allInputs.find((i) => i.type === "text");
    if (titleEl) {
      titleEl.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 150));
      state.filledTitle = MultiSell.Form.setReactValue(titleEl, pending.title);
    }

    const descEl = document.querySelector('textarea[name="description"]') || document.querySelector("textarea");
    if (descEl) {
      descEl.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 150));
      state.filledDescription = MultiSell.Form.setReactValue(descEl, pending.description);
    }

    const priceEl =
      document.querySelector('input[type="number"]') ||
      document.querySelector('input[inputmode="numeric"]') ||
      allInputs.find((i) => (i.placeholder || "").toLowerCase().includes("prix"));
    if (priceEl) {
      let price = (pending.price || "").toString().replace(/[^\d.,]/g, "").replace(",", ".").split(".")[0];
      if (!price) price = "2"; // Beebs veut un entier, jamais vide
      priceEl.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 150));
      state.filledPrice = MultiSell.Form.setReactValue(priceEl, price);
    }

    const files = await MultiSell.Form.dataUrlsToFiles(pending.images, "beebs");
    const fileInputs = [...document.querySelectorAll('input[type="file"]')];
    if (fileInputs.length && files.length) {
      fileInputs.forEach((inp) => MultiSell.Form.injectFiles(inp, files));
      state.filledImages = true;
    } else if (files.length === 0) {
      state.imagesAttemptFailed = true;
    }

    return state;
  }

  return { fillForm };
})();
