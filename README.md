# MultiSell (v0.1.0)

Extension Chrome de cross-listing modulaire. Extrait une annonce Vinted et
prépare son transfert vers Beebs et/ou Leboncoin : préremplissage des
formulaires, **jamais de publication automatique**.

Ce projet est **indépendant** de `vinted2beebs` et `vinted2leboncoin-` : les
deux extensions d'origine restent installées et inchangées. MultiSell en est
inspiré (audit détaillé fait au préalable) mais réécrit dans une architecture
CORE + adaptateurs par plateforme.

## Installation (mode développeur)

1. `chrome://extensions`
2. Activer "Mode développeur"
3. "Charger l'extension non empaquetée" → sélectionner le dossier `multisell/`

## Portée de cette version (phases 1 à 4 du plan)

- ✅ CORE : storage IndexedDB, fetch photos CORS, remplissage de formulaire
  React-aware, badges de grille, diagnostics
- ✅ Vinted : extraction fiche produit (JSON-LD + fallback DOM) + scraping des
  grilles (dressing/favoris/recherche)
- ✅ Vinted → Beebs : préremplissage titre/description/prix/photos
- ✅ Vinted → Leboncoin : préremplissage progressif du wizard multi-étapes
- ⛔ Opla : **non implémenté**. Le brief demande explicitement d'étudier la
  plateforme avant tout code (phase 8) — site officiel, structure du
  formulaire, faisabilité d'injection de fichiers. Rien n'a été supposé.
- ⛔ Shopify : **non implémenté**. Cas différent (API + OAuth, pas de scraping
  DOM) — phase 9 du plan, nécessite une architecture propre (module API
  séparé, jamais de mot de passe demandé).
- ⚠️ `core/categories.js` : table de correspondance **vide**. Aucun mapping de
  catégorie n'a été supposé — le module transporte la catégorie source telle
  quelle et la marque `verified: false` tant qu'un vrai tableau de
  correspondance n'a pas été construit avec des exemples réels.

## Ce qui n'a pas encore été testé en conditions réelles

Le code reprend et fusionne les techniques déjà validées dans
`vinted2beebs` et `vinted2leboncoin-` (sélecteurs, extraction JSON-LD,
remplissage React), mais n'a pas encore tourné sur les sites réels. À
vérifier en priorité à l'installation :

- Les sélecteurs CSS Vinted/Beebs/Leboncoin peuvent avoir changé depuis
  l'audit (fait sur le code des deux extensions, pas sur les sites en
  direct)
- Le panneau MultiSell peut se superposer visuellement à l'UI des deux
  anciennes extensions si elles sont actives sur la même page — c'est prévu
  (Beebs détectait déjà Leboncoin dans son propre code), mais pas re-testé
  avec ce nouveau panneau

## Prochaine étape suggérée

Tester Phase 3 (Vinted→Beebs) et Phase 4 (Vinted→Leboncoin) sur des annonces
réelles, en parallèle des deux extensions existantes, avant d'envisager la
Phase 5 (bidirectionnel).
