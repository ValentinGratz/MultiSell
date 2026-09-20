# Mission Claude — Projet MultiSell

Tu travailles sur mon nouveau projet :

# MultiSell

MultiSell est une extension Chrome destinée à faciliter le cross-listing entre différentes plateformes de vente.

Je possède déjà deux projets qui servent de base :

* https://github.com/ValentinGratz/vinted2beebs
* https://github.com/ValentinGratz/vinted2leboncoin

Je veux progressivement transformer ces travaux en une seule extension modulaire appelée **MultiSell**.

---

# ⚠️ IMPORTANT — NE CODE PAS IMMÉDIATEMENT

Avant de créer ou modifier du code, commence par analyser les projets existants.

Je veux d'abord comprendre :

1. ce qui peut être réutilisé ;
2. ce qui doit être refactorisé ;
3. ce qui est spécifique à chaque plateforme ;
4. ce qui doit devenir un module commun ;
5. les limites techniques de chaque plateforme.

Ne lance pas immédiatement une grosse refonte.

Commence par un audit technique.

---

# 1. ANALYSER LES PROJETS EXISTANTS

Analyse complètement :

## vinted2beebs

https://github.com/ValentinGratz/vinted2beebs

## vinted2leboncoin

https://github.com/ValentinGratz/vinted2leboncoin

Examine notamment :

* manifest.json
* permissions
* content scripts
* background/service worker
* popup
* stockage
* communication entre scripts
* extraction des annonces
* extraction des photos
* téléchargement des photos
* injection des photos
* remplissage des formulaires
* gestion des formulaires React
* événements DOM
* détection des pages
* détection des plateformes
* gestion des erreurs
* logs
* interface utilisateur
* éventuels scripts Tampermonkey
* structure générale du code

Je veux une analyse comparative des deux projets.

---

# 2. IDENTIFIER LE CODE COMMUN

Repère tout ce qui est actuellement dupliqué entre les deux extensions.

Par exemple :

* stockage local
* récupération d'images
* conversion d'images
* gestion des annonces
* interface utilisateur
* communication background/content
* logs
* détection de page
* gestion des erreurs

Explique ce qui pourrait devenir un module du CORE de MultiSell.

---

# 3. ARCHITECTURE MULTISELL

Je veux une architecture modulaire.

Le principe est :

```text
                  ┌── Vinted
                  │
                  ├── Beebs
CORE MultiSell ───┼── Leboncoin
                  │
                  ├── Opla
                  │
                  └── Shopify
```

Le CORE gère les données communes.

Chaque plateforme possède son propre adaptateur.

Exemple possible :

```text
src/
├── core/
│   ├── listing.js
│   ├── storage.js
│   ├── images.js
│   ├── router.js
│   ├── categories.js
│   └── diagnostics.js
│
├── platforms/
│   ├── vinted/
│   │   ├── extractor.js
│   │   ├── form.js
│   │   └── platform.js
│   │
│   ├── beebs/
│   │   ├── extractor.js
│   │   ├── form.js
│   │   └── platform.js
│   │
│   ├── leboncoin/
│   │   ├── extractor.js
│   │   ├── form.js
│   │   └── platform.js
│   │
│   ├── opla/
│   │   ├── extractor.js
│   │   ├── form.js
│   │   └── platform.js
│   │
│   └── shopify/
│       ├── extractor.js
│       ├── form.js
│       └── platform.js
│
├── background.js
├── content.js
└── popup.html
```

Cette structure est un exemple.

Si tu proposes une meilleure architecture, explique-la avant de l'utiliser.

---

# 4. MODÈLE DE DONNÉES UNIVERSEL

Crée un modèle commun représentant une annonce.

Exemple :

```javascript
{
  title: "",
  description: "",
  price: "",
  currency: "EUR",
  photos: [],
  category: "",
  brand: "",
  size: "",
  condition: "",
  color: "",
  material: "",
  gender: "",
  sourcePlatform: "",
  sourceUrl: "",
  sourceId: ""
}
```

Ce modèle doit rester flexible.

Une plateforme peut ne pas fournir certains champs.

Ne fabrique jamais une information qui n'existe pas.

---

# 5. EXTRACTION

Chaque plateforme doit pouvoir implémenter quelque chose comme :

```javascript
extractListing()
```

qui retourne les informations disponibles dans le modèle universel.

Exemple :

```text
Vinted
 ↓
extractListing()
 ↓
Listing universel
```

Puis :

```text
Listing universel
 ↓
Beebs adapter
 ↓
formulaire Beebs
```

---

# 6. CATÉGORIES

Les catégories sont différentes selon les plateformes.

Il faut donc créer un système de mapping.

Exemple :

```text
Vinted
Vêtements > Homme > Vestes

        ↓

Catégorie universelle

        ↓

Leboncoin
Mode > Homme > Vestes
```

Mais attention :

Ne suppose jamais qu'une catégorie est équivalente sans preuve.

Si le mapping est incertain, l'utilisateur doit pouvoir choisir/corriger la catégorie.

---

# 7. PHOTOS

Réutilise autant que possible le mécanisme existant de `vinted2beebs`.

Architecture souhaitée :

```text
extractPhotos()
      ↓
downloadPhotos()
      ↓
File / Blob
      ↓
uploadPhotos(destination)
```

Gère correctement :

* CORS
* URLs temporaires
* erreurs réseau
* formats d'image
* fichiers volumineux
* limites éventuelles des plateformes

Si une plateforme ne permet pas une injection fiable des fichiers, ne force pas le système.

Prévois un fallback manuel.

---

# 8. INTERFACE

Je veux une interface simple.

Exemple :

```text
MultiSell

Annonce détectée

📷 8 photos
📝 Nike Air Max
💰 45 €

Préparer vers :

[ Vinted ]
[ Beebs ]
[ Leboncoin ]
[ Opla ]
[ Shopify ]
```

La plateforme actuelle doit être identifiée.

Exemple :

```text
Source : Vinted ✓

Beebs       [Préparer]
Leboncoin   [Préparer]
Opla        [Préparer]
Shopify     [Préparer]
```

---

# 9. FONCTIONNEMENT BIDIRECTIONNEL

Je ne veux pas uniquement :

```text
Vinted → Beebs
Vinted → Leboncoin
```

Je veux progressivement :

```text
Vinted ↔ Beebs
Vinted ↔ Leboncoin
Beebs ↔ Leboncoin
```

puis éventuellement :

```text
Vinted ↔ Opla
Beebs ↔ Opla
Leboncoin ↔ Opla
```

et :

```text
annonce → Shopify
```

Cependant, ne développe pas toutes les directions immédiatement.

Chaque plateforme doit idéalement savoir :

```javascript
extractListing()
prepareListing()
```

---

# 10. OPLA

Étudie Opla avant toute implémentation.

Détermine :

* quel est le site officiel ;
* comment fonctionne la création d'annonce ;
* si les annonces sont accessibles via une interface web ;
* quels champs existent ;
* si les photos peuvent être injectées ;
* si une intégration Chrome est techniquement réaliste.

Si l'intégration est impossible ou trop fragile :

**ne prétends pas qu'elle fonctionne.**

Crée éventuellement un module expérimental séparé.

---

# 11. SHOPIFY

Shopify doit être considéré comme un cas différent.

Une annonce pourrait être transformée en fiche produit :

```text
Annonce
 ↓
Produit Shopify

title
description
price
images
product type
vendor
tags
SKU
```

Mais ne traite pas Shopify comme Vinted.

Étudie :

* Shopify Admin
* API Shopify
* authentification
* permissions
* OAuth
* boutiques de développement
* domaines Shopify personnalisés

Ne demande jamais le mot de passe Shopify.

Ne contourne jamais l'authentification.

Si une API est nécessaire, explique l'architecture appropriée.

---

# 12. DÉTECTION DES PLATEFORMES

Créer un système central permettant d'identifier la plateforme actuelle.

Exemple :

```javascript
detectPlatform()
```

Il devra pouvoir reconnaître notamment :

* Vinted
* Beebs
* Leboncoin
* Opla
* Shopify

Mais les sélecteurs et traitements propres à chaque site doivent rester dans leur module.

Ne transforme pas `content.js` en énorme fichier contenant tout le code de toutes les plateformes.

---

# 13. RÉSISTANCE AUX CHANGEMENTS D'INTERFACE

Les marketplaces peuvent modifier leur interface.

Privilégie :

* labels
* aria-label
* attributs stables
* noms de champs
* structure sémantique
* fallbacks

Évite autant que possible les sélecteurs CSS ultra-fragiles.

Prévois des logs permettant de détecter rapidement ce qui ne fonctionne plus.

---

# 14. DIAGNOSTIC

Créer un système de diagnostic.

Exemple :

```text
MultiSell Diagnostic

Platform: Vinted
Page: Listing

Title: ✓
Description: ✓
Price: ✓
Photos: 8
Brand: ✓
Category: ✓

Destination: Leboncoin

Form detected: ✓
Title field: ✓
Description field: ✓
Price field: ✓
Photos upload: ✓
```

Je veux pouvoir comprendre rapidement pourquoi une intégration ne fonctionne plus.

---

# 15. SÉCURITÉ

MultiSell doit rester un assistant.

Il ne doit pas :

* demander les mots de passe ;
* contourner CAPTCHA ;
* contourner anti-bot ;
* contourner les restrictions des plateformes ;
* publier automatiquement des centaines d'annonces ;
* effectuer des actions sensibles sans validation.

Le principe est :

```text
Extraction
↓
Préparation
↓
Préremplissage
↓
Vérification humaine
↓
Publication manuelle
```

---

# 16. DÉVELOPPEMENT PAR PHASES

Ne développe surtout pas les cinq plateformes simultanément.

Ordre souhaité :

### Phase 1

Analyser les deux extensions existantes.

### Phase 2

Créer le CORE MultiSell.

### Phase 3

Migrer Vinted → Beebs.

### Phase 4

Migrer Vinted → Leboncoin.

### Phase 5

Ajouter Beebs → Vinted.

### Phase 6

Ajouter Leboncoin → Vinted.

### Phase 7

Finaliser l'architecture bidirectionnelle.

### Phase 8

Étudier Opla.

### Phase 9

Étudier Shopify.

### Phase 10

Envisager d'autres marketplaces.

À chaque étape :

* tester ;
* documenter ;
* conserver les fonctionnalités précédentes ;
* ne pas casser les intégrations existantes.

---

# 17. PREMIÈRE MISSION

Pour ta première réponse, NE CODE PAS.

Fais uniquement :

## A. Audit de vinted2beebs

## B. Audit de vinted2leboncoin

## C. Tableau comparatif

Exemple :

| Fonction         | vinted2beebs | vinted2leboncoin | Commun |
| ---------------- | ------------ | ---------------- | ------ |
| Extraction titre | ✓            | ✓                | ✓      |
| Description      | ✓            | ✓                | ✓      |
| Photos           | ✓            | ✓                | ✓      |
| Prix             | ✓            | ✓                | ✓      |
| Catégorie        | ...          | ...              | ...    |

## D. Code réutilisable

Liste précisément les fichiers/fonctions pouvant être réutilisés.

## E. Code à refactoriser

Liste ce qui doit être déplacé dans le CORE.

## F. Architecture MultiSell proposée

Montre l'arborescence finale.

## G. Limites techniques

Identifie les difficultés particulières de :

* Vinted
* Beebs
* Leboncoin
* Opla
* Shopify

## H. Plan de migration

Explique comment passer progressivement des deux anciennes extensions vers MultiSell sans les casser.

**Ne crée ou ne modifie aucun fichier avant de m'avoir présenté cette analyse.**

Le projet s'appelle :

# MultiSell

Pas CrossLister.
