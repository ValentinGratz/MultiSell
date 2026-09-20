# MultiSell

**MultiSell** est une extension Chrome destinée à faciliter le cross-listing d'annonces entre différentes plateformes de vente en ligne.

L'objectif est de permettre à l'utilisateur de partir d'une annonce existante sur une plateforme et de préparer rapidement sa publication sur une autre.

## 🚧 Projet en développement

Le projet est actuellement au stade de conception.

Il reprend notamment les bases de deux extensions existantes :

* Vinted → Beebs
* Vinted → Leboncoin

L'objectif est progressivement de réunir ces fonctionnalités dans une seule extension modulaire.

## 🎯 Objectif

À terme, MultiSell pourra interconnecter plusieurs plateformes :

* Vinted
* Beebs
* Leboncoin
* Opla
* Shopify
* et potentiellement d'autres plateformes

Le principe :

```text
                 ┌──→ Vinted
                 │
                 ├──→ Beebs
Annonce ─────────┼──→ Leboncoin
                 │
                 ├──→ Opla
                 │
                 └──→ Shopify
```

L'utilisateur pourra récupérer les informations d'une annonce existante puis choisir vers quelle plateforme il souhaite la préparer.

## 📦 Informations pouvant être récupérées

Selon les possibilités offertes par chaque plateforme :

* Photos
* Titre
* Description
* Prix
* Catégorie
* Marque
* Taille
* État
* Couleur
* Matière
* Genre
* URL de l'annonce
* Identifiant de l'annonce
* autres informations disponibles

Toutes les plateformes ne proposent pas les mêmes champs. MultiSell devra donc utiliser un modèle de données commun tout en conservant les spécificités de chaque plateforme.

## 🔄 Principe de fonctionnement

```text
Annonce existante
       ↓
Détection de la plateforme
       ↓
Extraction des informations
       ↓
Stockage temporaire
       ↓
Choix de la plateforme destination
       ↓
Adaptation des informations
       ↓
Préremplissage de l'annonce
       ↓
Vérification par l'utilisateur
       ↓
Publication manuelle
```

MultiSell est conçu comme un **assistant de cross-listing**.

L'objectif n'est pas de créer un bot autonome publiant massivement des annonces à la place de l'utilisateur.

## 🧩 Architecture envisagée

Chaque plateforme devra fonctionner comme un module indépendant.

Exemple :

```text
src/
├── core/
│   ├── listing.js
│   ├── storage.js
│   ├── images.js
│   └── router.js
│
├── platforms/
│   ├── vinted/
│   ├── beebs/
│   ├── leboncoin/
│   ├── opla/
│   └── shopify/
│
├── background.js
├── content.js
└── popup.html
```

Cette architecture pourra être modifiée si une meilleure solution est identifiée pendant l'analyse technique.

## 🏗️ Plateformes

### Vinted

Base existante provenant du projet `vinted2beebs` et des travaux `vinted2leboncoin`.

### Beebs

Extraction et préparation des annonces Beebs vers les autres plateformes.

### Leboncoin

Extraction et préparation des annonces Leboncoin vers les autres plateformes.

### Opla

Intégration à étudier.

Aucune intégration ne sera ajoutée sans vérifier au préalable les possibilités techniques réelles du site.

### Shopify

Cas particulier.

Shopify n'est pas une marketplace de petites annonces classique. Une éventuelle intégration devra plutôt permettre de transformer une annonce en fiche produit Shopify.

L'authentification et les API Shopify devront être étudiées séparément.

## 🔐 Sécurité

MultiSell ne doit pas :

* demander les mots de passe des utilisateurs ;
* contourner les CAPTCHA ;
* contourner les systèmes anti-bot ;
* contourner les restrictions d'accès ;
* publier massivement des annonces automatiquement ;
* effectuer des actions importantes sans validation de l'utilisateur.

L'utilisateur doit conserver le contrôle de la publication finale.

## 🐛 Diagnostic

Le projet devra disposer d'un système de diagnostic permettant d'identifier rapidement les problèmes d'intégration.

Exemple :

```text
MultiSell Diagnostic

Platform: Vinted
Page type: Listing

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
Photo upload: ✓
```

Cela permettra notamment de diagnostiquer rapidement les changements d'interface d'une plateforme.

## 📚 Projets d'origine

MultiSell reprend notamment les travaux réalisés dans :

* `vinted2beebs`
* `vinted2leboncoin`

Les anciens projets resteront indépendants afin de conserver des versions fonctionnelles de référence.

## 🗺️ Roadmap

* [ ] Analyse des extensions existantes
* [ ] Définition de l'architecture MultiSell
* [ ] Modèle de données universel
* [ ] Module Vinted
* [ ] Module Beebs
* [ ] Module Leboncoin
* [ ] Beebs → Vinted
* [ ] Leboncoin → Vinted
* [ ] Système de mapping des catégories
* [ ] Système de diagnostic
* [ ] Interface MultiSell
* [ ] Étude Opla
* [ ] Étude Shopify
* [ ] Ajout éventuel d'autres plateformes

## ⚠️ Statut

**Prototype / développement initial**

MultiSell n'est pas encore une extension Chrome prête à l'emploi.
