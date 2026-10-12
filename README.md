# Professeur Plume et le Manuscrit Perdu

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
- La progression est enregistrée dans le navigateur (localStorage).

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page et styles |
| `js/puzzles.js` | Les 50 énigmes (format décrit en tête de fichier) |
| `js/shop.js` | Objets de la boutique et dessins SVG du professeur et de sa maison |
| `js/game.js` | Moteur : progression, écus, indices, boutique |
| `test/check.js` | Vérification des énigmes et du moteur |

## Tests

```bash
node test/check.js
```

## Jouer en local

Ouvrir `index.html` dans un navigateur, ou `python3 -m http.server` puis http://localhost:8000.
