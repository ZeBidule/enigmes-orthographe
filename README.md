# Plume & Cie : L'Affaire du Manuscrit Perdu

Petit jeu d'énigmes pour réviser l'orthographe française au collège.
Le précieux manuscrit de Lord Dictée a disparu : 90 mystères à résoudre, dans l'ordre,
de plus en plus difficiles, qui mélangent 6 catégories (homophones, participes passés, conjugaison,
accords, orthographe des mots, nombres en lettres).

**Jouer : https://zebidule.github.io/enigmes-orthographe/** (téléphone ou ordinateur, aucun install).

## Principe

- 9 chapitres de 10 mystères ; un mystère se débloque quand le précédent est résolu.
- 3 types d'énigmes : trouver les mots fautifs, compléter des trous, taper la réponse au clavier
  (les accents comptent ; une barre d'accents aide sur ordinateur).
- Chaque mystère rapporte des **écus** (15 à 35 selon sa difficulté, -20 % par erreur).
  Les écus servent à acheter des indices et, dans la boutique, des vêtements pour le professeur,
  des objets pour sa maison, des aménagements pour son jardin (fontaine, chêne, niche…)
  et des véhicules (vélo, voiture ancienne, montgolfière).
  Les prix sont calculés pour qu'on puisse **tout acheter** en prenant un indice toutes les 5 questions
  (gains maximum 2 270 écus − 18 indices × 3 = 2 216 écus ; boutique complète : 2 130 écus).
- La progression est enregistrée automatiquement dans le navigateur (localStorage).
- **💾 Sauvegarder** (écran maison) télécharge un fichier `plume-et-cie-sauvegarde-AAAA-MM-JJ.json`
  contenant les mystères résolus, les écus et les objets achetés/portés.
  **📂 Charger** (écran titre ou maison) recharge ce fichier, par exemple sur un autre appareil.

## Répartition des énigmes

| | Trouver les fautes | Compléter les trous | Réponse à taper | Total |
|---|---|---|---|---|
| Énigmes | 30 (33 %) | 30 (33 %) | 30 (33 %) | 90 |

| Catégorie | Nb | Notions |
|---|---|---|
| Homophones grammaticaux | 15 | et/est, a/à, son/sont, on/ont, ces/ses, ou/où, ce/se, c'est/s'est, mes/mais, la/là/l'a, peu/peut, quand/quant, leur/leurs, sans/s'en, quel que/quelque, comte/conte, plutôt/plus tôt, quoi que, davantage |
| Participes passés | 15 | avec être, avec avoir (COD avant/après), voix passive, pronominaux, participe suivi d'un infinitif, formes irrégulières |
| Conjugaison | 15 | -er/-é, présent, imparfait, futur, conditionnel, passé simple, subjonctif, impératif, verbes irréguliers |
| Pluriels et accords | 15 | pluriels en -al/-ou, noms composés, adjectifs de couleur, féminins, tout, chaque/plusieurs, demi/nu, accord avec plusieurs noms |
| Orthographe des mots | 15 | accents, cédille, m devant m/b/p, s/ss, g/ge/gu, consonnes doubles, mots invariables |
| Nombres en lettres | 15 | vingt, cent, mille, million, « et un », nombres ordinaux |

### Par chapitre

Chaque chapitre mélange les 6 catégories (1 ou 2 énigmes de chacune) et les 3 types (3 ou 4 de chaque).

| Chapitre | Trouver les fautes | Compléter les trous | Réponse à taper | Homophones grammaticaux | Participes passés | Conjugaison | Pluriels et accords | Orthographe des mots | Nombres en lettres | Difficulté moyenne |
|---|---|---|---|---|---|---|---|---|---|---|
| Chapitre 1 — Le mot sur la porte | 4 | 3 | 3 | 2 | 1 | 2 | 2 | 2 | 1 | 1.4 / 5 |
| Chapitre 2 — Les premiers témoins | 3 | 3 | 4 | 1 | 1 | 2 | 2 | 2 | 2 | 2.1 / 5 |
| Chapitre 3 — La piste du village | 4 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 1 | 2.5 / 5 |
| Chapitre 4 — Le train de minuit | 3 | 3 | 4 | 1 | 2 | 2 | 1 | 2 | 2 | 2.8 / 5 |
| Chapitre 5 — Le bal du château | 3 | 4 | 3 | 2 | 2 | 1 | 1 | 2 | 2 | 2.8 / 5 |
| Chapitre 6 — Le port dans la brume | 3 | 4 | 3 | 1 | 2 | 1 | 2 | 2 | 2 | 3.2 / 5 |
| Chapitre 7 — Les secrets du musée | 4 | 3 | 3 | 2 | 1 | 2 | 1 | 2 | 2 | 3.4 / 5 |
| Chapitre 8 — La nuit à l'observatoire | 3 | 3 | 4 | 2 | 2 | 1 | 2 | 1 | 2 | 4.3 / 5 |
| Chapitre 9 — Le grenier du manoir | 3 | 4 | 3 | 2 | 2 | 2 | 2 | 1 | 1 | 4.8 / 5 |
| **Total** | **30** | **30** | **30** | **15** | **15** | **15** | **15** | **15** | **15** | |

Certaines énigmes mélangent plusieurs notions ; elles sont classées selon la notion principale.

## Menu de test

Pour tester le jeu sans tout résoudre : bouton **🔑** du menu principal (écran titre), mot de passe `tes1`.
Le mode test débloque tous les mystères, rend les écus illimités et ajoute un bouton **🧪 Solution**
qui valide le mystère. Il se désactive depuis le même menu.
Le mot de passe est dans le code source : c'est une commodité, pas une protection.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page et styles |
| `js/puzzles.js` | Les 90 énigmes (format décrit en tête de fichier) et l'ordre de jeu `CHAPTER_PLAN` |
| `tools/arrange.js` | Génère `CHAPTER_PLAN` en respectant les règles de répartition |
| `js/shop.js` | Objets de la boutique et dessins SVG du professeur, de sa maison et de son jardin |
| `js/game.js` | Moteur : progression, écus, indices, boutique |
| `test/check.js` | Vérification des énigmes, du moteur et du format de sauvegarde |
| `test/e2e.js` | Test navigateur : écran titre, partie, sauvegarde/chargement, menu de test |

## Ajouter des énigmes

1. Ajouter l'énigme à la fin de `ALL_PUZZLES` avec un nouvel `id` (ne jamais renuméroter : les sauvegardes s'en servent).
2. Lancer `node tools/arrange.js` pour recalculer les chapitres.
3. Lancer les tests.

## Tests

```bash
node test/check.js

# test navigateur (Playwright + Chromium)
npx -y playwright install chromium
PLAYWRIGHT=$(dirname $(find ~/.npm/_npx -path '*node_modules/playwright/package.json' | head -1)) node test/e2e.js
```

## Jouer en local

Ouvrir `index.html` dans un navigateur, ou `python3 -m http.server` puis http://localhost:8000.
