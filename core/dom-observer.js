// core/dom-observer.js
// MutationObserver générique avec debounce, remplace les 3 observers
// dupliqués trouvés dans vinted2beebs et vinted2leboncoin.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.observeMutations = function observeMutations(callback, { debounceMs = 500, root = document.body, maxDurationMs = null } = {}) {
  let timeout = null;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, debounceMs);
  });
  observer.observe(root, { childList: true, subtree: true });

  if (maxDurationMs) {
    setTimeout(() => observer.disconnect(), maxDurationMs);
  }

  return observer;
};
