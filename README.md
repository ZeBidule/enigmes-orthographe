# Plume & Cie : L'Affaire du Manuscrit Perdu

Petit jeu d'énigmes pour réviser l'orthographe française au collège.
Le précieux manuscrit de Lord Dictée a disparu : 96 mystères à résoudre, dans l'ordre, puis 10 mystères bonus,
de plus en plus difficiles, qui mélangent 8 catégories (homophones, participes passés, conjugaison,
accords, orthographe des mots, nombres en lettres, lettres muettes en fin de mot, un son et plusieurs écritures).

**Jouer : https://zebidule.github.io/enigmes-orthographe/** (téléphone ou ordinateur, aucun install).

## Principe

- 9 chapitres de 10 ou 11 mystères ; un mystère se débloque quand le précédent est résolu.
- 3 types d'énigmes : trouver les mots fautifs, compléter des trous, taper la réponse au clavier
  (les accents comptent ; une barre d'accents aide sur ordinateur).
- Chaque mystère rapporte des **écus** (15 à 35 selon sa difficulté, -20 % par erreur).
  Les écus servent à acheter des indices et, dans la boutique, des vêtements pour le professeur,
  des objets pour sa maison, des aménagements pour son jardin (fontaine, chêne, niche…)
  et des véhicules (vélo, voiture ancienne, montgolfière).
  Les prix sont calculés pour qu'on puisse **tout acheter** à la fin de l'histoire en prenant un indice
  toutes les 5 questions (gains maximum 2 430 écus − 19 indices × 3 = 2 373 écus ; boutique complète : 2 130 écus).
- **⭐ 10 mystères bonus** (« Les archives secrètes », niveau expert) se débloquent une fois les 96 mystères
  de l'histoire résolus. Chacun rapporte **190 écus fixes** (sans pénalité d'erreur) : avec eux, tout est
  achetable même en prenant tous les indices et en faisant beaucoup d'erreurs.
- La progression est enregistrée automatiquement dans le navigateur (localStorage).
- **💾 Sauvegarder** (écran maison) télécharge un fichier `plume-et-cie-sauvegarde-AAAA-MM-JJ.json`
  contenant les mystères résolus, les écus et les objets achetés/portés.
  **📂 Charger** (écran titre ou maison) recharge ce fichier, par exemple sur un autre appareil.

## Répartition des énigmes

Les tableaux concernent les 96 mystères de l'histoire (les 10 bonus mélangent les catégories, niveau expert).

| | Trouver les fautes | Compléter les trous | Réponse à taper | Total |
|---|---|---|---|---|
| Énigmes | 32 (33 %) | 32 (33 %) | 32 (33 %) | 96 |

| Catégorie | Nb | Notions |
|---|---|---|
| Homophones grammaticaux | 12 | et/est, a/à, son/sont, on/ont, ces/ses, ou/où, ce/se, c'est/s'est, la/là/l'a, peu/peut, quand/quant, sans/s'en, quel que/quelque, plutôt/plus tôt, quoi que, davantage |
| Participes passés | 12 | avec être, avec avoir (COD avant/après), voix passive, pronominaux, participe suivi d'un infinitif, formes irrégulières |
| Conjugaison | 12 | -er/-é, présent, imparfait, futur, conditionnel, passé simple, subjonctif, impératif, verbes irréguliers |
| Pluriels et accords | 12 | pluriels en -al/-ou, noms composés, adjectifs de couleur, féminins, tout, chaque/plusieurs, demi/nu, accord avec plusieurs noms |
| Orthographe des mots | 12 | accents, cédille, m devant m/b/p, s/ss, g/ge/gu, consonnes doubles, mots invariables |
| Nombres en lettres | 12 | vingt, cent, mille, million, « et un », nombres ordinaux |
| Lettres muettes en fin de mot | 12 | lettre muette retrouvée par la famille du mot (chat → chaton, bord → border), -oir/-oire, noms féminins en -ée/-ie/-ue et exceptions (moitié), masculins sans e (poil, fauteuil) / avec e (reste), poids/pois/pot |
| Un son, plusieurs écritures | 12 | [o] o/au/eau, [f] f/ph, [s] s/ss/c/ç/sc, [e] é/er, [ɛ̃] in/ain/aim, [k] c/qu/ch, [ɑ̃] an/en/am/em, [sjɔ̃] -tion, [ʒ] j/g/ge, [ɛ] ai/et |

### Par chapitre

Chaque chapitre mélange les 8 catégories (1 ou 2 énigmes de chacune) et les 3 types (3 ou 4 de chaque).

| Chapitre | Trouver les fautes | Compléter les trous | Réponse à taper | Homophones grammaticaux | Participes passés | Conjugaison | Pluriels et accords | Orthographe des mots | Nombres en lettres | Lettres muettes en fin de mot | Un son, plusieurs écritures | Difficulté moyenne |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chapitre 1 — Le mot sur la porte (11) | 4 | 3 | 4 | 1 | 1 | 1 | 2 | 1 | 2 | 1 | 2 | 1.3 / 5 |
| Chapitre 2 — Les premiers témoins (11) | 4 | 4 | 3 | 2 | 2 | 2 | 1 | 1 | 1 | 1 | 1 | 2.0 / 5 |
| Chapitre 3 — La piste du village (11) | 4 | 4 | 3 | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 2.2 / 5 |
| Chapitre 4 — Le train de minuit (10) | 4 | 3 | 3 | 1 | 1 | 1 | 1 | 2 | 2 | 1 | 1 | 2.6 / 5 |
| Chapitre 5 — Le bal du château (11) | 4 | 3 | 4 | 1 | 2 | 1 | 1 | 1 | 2 | 2 | 1 | 2.9 / 5 |
| Chapitre 6 — Le port dans la brume (10) | 3 | 3 | 4 | 1 | 2 | 1 | 1 | 1 | 1 | 1 | 2 | 3.3 / 5 |
| Chapitre 7 — Les secrets du musée (11) | 3 | 4 | 4 | 2 | 1 | 1 | 1 | 2 | 1 | 2 | 1 | 4.1 / 5 |
| Chapitre 8 — La nuit à l'observatoire (11) | 3 | 4 | 4 | 1 | 1 | 2 | 2 | 2 | 1 | 1 | 1 | 4.4 / 5 |
| Chapitre 9 — Le grenier du manoir (10) | 3 | 4 | 3 | 1 | 1 | 1 | 2 | 1 | 1 | 2 | 1 | 4.9 / 5 |
| **Total** | **32** | **32** | **32** | **12** | **12** | **12** | **12** | **12** | **12** | **12** | **12** | |

Certaines énigmes mélangent plusieurs notions ; elles sont classées selon la notion principale.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page et styles |
| `js/puzzles.js` | Les 96 énigmes de l'histoire, les 10 bonus (format décrit en tête de fichier) et l'ordre de jeu `CHAPTER_PLAN` |
| `tools/arrange.js` | Génère `CHAPTER_PLAN` en respectant les règles de répartition |
| `js/shop.js` | Objets de la boutique et dessins SVG du professeur, de sa maison et de son jardin |
| `js/game.js` | Moteur : progression, écus, indices, boutique |
| `test/check.js` | Vérification des énigmes, du moteur et du format de sauvegarde |
| `test/e2e.js` | Test navigateur : écran titre, partie, boutique, sauvegarde/chargement, bonus |

## Ajouter des énigmes

1. Ajouter l'énigme à la fin de `ALL_PUZZLES` (ou de `BONUS_PUZZLES` pour un bonus) avec un nouvel `id` (ne jamais renuméroter : les sauvegardes s'en servent).
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
