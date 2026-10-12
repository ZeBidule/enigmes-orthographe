# Plume & Cie : L'Affaire du Manuscrit Perdu

Petit jeu d'énigmes pour réviser l'orthographe française au collège.
Le précieux manuscrit de Lord Dictée a disparu : 50 mystères à résoudre, dans l'ordre,
de plus en plus difficiles (homophones, pluriels, conjugaison, participes passés, pièges d'experts).

**Jouer : https://zebidule.github.io/enigmes-orthographe/** (téléphone ou ordinateur, aucun install).

## Principe

- 5 chapitres de 10 mystères ; un mystère se débloque quand le précédent est résolu.
- 3 types d'énigmes : trouver les mots fautifs, compléter des trous, taper la réponse au clavier
  (les accents comptent ; une barre d'accents aide sur ordinateur).
- Chaque mystère rapporte des **écus** (15 à 35 selon le chapitre, -20 % par erreur).
  Les écus servent à acheter des indices et, dans la boutique, des vêtements pour le professeur
  et des objets pour sa maison.
- La progression est enregistrée automatiquement dans le navigateur (localStorage).
- **💾 Sauvegarder** (écran maison) télécharge un fichier `plume-et-cie-sauvegarde-AAAA-MM-JJ.json`
  contenant les mystères résolus, les écus et les objets achetés/portés.
  **📂 Charger** (écran titre ou maison) recharge ce fichier, par exemple sur un autre appareil.

## Répartition des énigmes

### Par type

| Chapitre | Trouver les fautes | Compléter les trous | Réponse à taper | Total |
|---|---|---|---|---|
| 1 — Le manoir | 3 | 5 | 2 | 10 |
| 2 — Le village | 3 | 4 | 3 | 10 |
| 3 — La gare | 3 | 4 | 3 | 10 |
| 4 — Le château | 2 | 4 | 4 | 10 |
| 5 — Le grenier | 2 | 4 | 4 | 10 |
| **Total** | **13 (26 %)** | **21 (42 %)** | **16 (32 %)** | **50** |

### Par catégorie

| Catégorie | Nb | Énigmes | Notions |
|---|---|---|---|
| Homophones grammaticaux | 12 | 1-10, 43, 49 | et/est, a/à, son/sont, on/ont, ces/ses, ou/où, ce/se, c'est/s'est, mes/mais, la/là/l'a, peu/peut, quand/quant, leur/leurs, sans/s'en, dans/d'en, quel que/quelque |
| Participes passés | 13 | 31-40, 45, 46, 48 | avec être, avec avoir (COD placé avant ou après), voix passive, verbes pronominaux, formes irrégulières |
| Conjugaison | 10 | 21-30 | -er/-é, présent, imparfait, futur, conditionnel, passé simple, subjonctif, impératif, verbes irréguliers |
| Pluriels et accords dans le groupe du nom | 8 | 11-18 | pluriels en -al/-ou, œil/yeux, adjectifs de couleur, féminins particuliers, tout/tous/toute/toutes |
| Orthographe des mots | 5 | 41, 42, 44, 47, 50 | consonnes doubles, accueil, dilemme, -emment, mots invariables, cédille |
| Nombres en lettres | 2 | 19, 20 | accord de vingt et cent |

Certaines énigmes mélangent plusieurs notions ; elles sont classées selon la notion principale
(9 : aussi un accord du déterminant ; 21 : aussi un homophone ; 33 : aussi près de/prêt et aucun ;
49 : aussi l'accord de « eux-mêmes »).

## Menu de test

Pour tester le jeu sans tout résoudre : bouton **🔑** du menu principal (écran titre), mot de passe `tes1`.
Le mode test débloque tous les mystères, rend les écus illimités et ajoute un bouton **🧪 Solution**
qui valide le mystère. Il se désactive depuis le même menu.
Le mot de passe est dans le code source : c'est une commodité, pas une protection.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page et styles |
| `js/puzzles.js` | Les 50 énigmes (format décrit en tête de fichier) |
| `js/shop.js` | Objets de la boutique et dessins SVG du professeur et de sa maison |
| `js/game.js` | Moteur : progression, écus, indices, boutique |
| `test/check.js` | Vérification des énigmes, du moteur et du format de sauvegarde |
| `test/e2e.js` | Test navigateur : écran titre, partie, sauvegarde/chargement, menu de test |

## Tests

```bash
node test/check.js

# test navigateur (Playwright + Chromium)
npx -y playwright install chromium
PLAYWRIGHT=$(dirname $(find ~/.npm/_npx -path '*node_modules/playwright/package.json' | head -1)) node test/e2e.js
```

## Jouer en local

Ouvrir `index.html` dans un navigateur, ou `python3 -m http.server` puis http://localhost:8000.
