// core/form.js
// Fusion des techniques de remplissage de vinted2beebs (setReact, avec
// _valueTracker) et de vinted2leboncoin- (remontée de prototype pour trouver
// le setter natif). Couvre plus de cas que chacune des deux implémentations
// prises séparément.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.Form = (function () {
  function getNativeValueSetter(element) {
    let proto = Object.getPrototypeOf(element);
    while (proto) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      if (descriptor && descriptor.set) return descriptor.set;
      proto = Object.getPrototypeOf(proto);
    }
    return null;
  }

  // Remplit un champ input/textarea de façon compatible avec les frameworks
  // basés sur React (Vinted, Leboncoin, Beebs le sont tous). Ne fait rien si
  // la valeur est vide/nulle : un champ non rempli reste vide plutôt que
  // d'écraser avec une chaîne vide.
  function setReactValue(el, value) {
    if (!el || value === undefined || value === null || value === "") return false;

    const previousValue = el.value;
    el.focus();

    const setter = getNativeValueSetter(el);
    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }

    // React garde une trace interne de la dernière valeur "vue" ; sans ce
    // reset, certains composants ignorent l'événement "input" suivant.
    if (el._valueTracker) el._valueTracker.setValue(previousValue);

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  // Cherche le premier élément correspondant à une liste de sélecteurs,
  // dans l'ordre (du plus spécifique au plus générique).
  function findField(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) {
        // sélecteur invalide sur cette page, on continue
      }
    }
    return null;
  }

  // Injecte une liste de File dans un <input type="file"> via DataTransfer.
  // Identique dans les deux extensions d'origine, aucune divergence à gérer.
  function injectFiles(inputEl, files) {
    if (!inputEl || !files || files.length === 0) return false;
    try {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      inputEl.files = dt.files;
      inputEl.dispatchEvent(new Event("change", { bubbles: true }));
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    } catch (e) {
      console.warn("[MultiSell] injectFiles a échoué:", e.message);
      return false;
    }
  }

  // Reconstruit des objets File à partir des dataURL renvoyées par le
  // background (fetch CORS déjà fait côté service worker).
  async function dataUrlsToFiles(images, filenamePrefix = "photo") {
    const files = [];
    let i = 0;
    for (const img of images || []) {
      i++;
      if (!img || !img.dataUrl) continue;
      try {
        const res = await fetch(img.dataUrl); // fetch sur data: URL -> jamais de CORS
        const blob = await res.blob();
        files.push(new File([blob], img.filename || `${filenamePrefix}-${i}.jpg`, { type: blob.type || "image/jpeg" }));
      } catch (e) {
        console.warn("[MultiSell] Échec reconstruction fichier pour", img.filename, e.message);
      }
    }
    return files;
  }

  return { setReactValue, findField, injectFiles, dataUrlsToFiles };
})();
