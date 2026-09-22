// core/categories.js
// Pas de mapping fiable entre catégories Vinted/Leboncoin/Beebs pour
// l'instant : aucune des deux extensions d'origine n'en avait un, et il ne
// faut jamais supposer une équivalence sans preuve (consigne explicite du
// projet). Ce module se contente donc de transporter la catégorie source
// telle quelle, et de marquer chaque mapping comme "non vérifié" tant qu'un
// tableau de correspondance réel n'a pas été construit avec l'utilisateur.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.Categories = (function () {
  // Table vide volontairement : à remplir progressivement, un couple
  // plateforme source -> plateforme destination à la fois, une fois qu'on a
  // des exemples réels côté Leboncoin/Beebs.
  const MAPPINGS = {
    // "vinted->leboncoin": { "Vêtements > Homme > Vestes": "Mode > Homme > Vestes" },
  };

  function mapCategory(sourcePlatform, destinationPlatform, sourceCategory) {
    if (!sourceCategory) return { value: "", verified: false };
    const table = MAPPINGS[`${sourcePlatform}->${destinationPlatform}`];
    if (table && table[sourceCategory]) {
      return { value: table[sourceCategory], verified: true };
    }
    // Pas de correspondance connue : on renvoie la catégorie source brute,
    // marquée comme non vérifiée, pour que l'UI invite à une correction
    // manuelle plutôt que d'injecter une catégorie fausse dans le formulaire.
    return { value: sourceCategory, verified: false };
  }

  return { mapCategory };
})();
