# Outils de l'index CartoScan

Scripts Node.js qui produisent `cartes-pokemon-index.bin` et `cartes-pokemon-index.json`,
l'index de reconnaissance d'illustration chargé par `index.html`.

- `core.js` : cœur de reconnaissance (détection du cadre, miniature 32×44, descripteur 8×11×3 en int8, plus proches voisins). Il est copié tel quel dans l'appli : garder les deux identiques.
- `build2.js` : télécharge les images `low.jpg` des cartes et calcule les miniatures, par tranche.
- `merge.js` : fusionne les tranches en `thumbs.bin` / `thumbs.json`.
- `export.js` : calcule les descripteurs et écrit l'index.
- `gen.js`, `eval.js`, `e2e.js` : tests sur des photos simulées.

## Prérequis

Node.js 18 ou plus (pour `fetch`) et Jimp 0.x : `npm install jimp@0.22`.

Il faut aussi les catalogues de cartes de l'API TCGdex :
- `/tmp/frcards.json` : cartes en français (`https://api.tcgdex.net/v2/fr/cards`)
- `/tmp/encards.json` : cartes en anglais (`https://api.tcgdex.net/v2/en/cards`), utilisé quand une carte n'a pas d'image en français.

Chaque entrée contient au moins `id`, `localId` et `image`.

## Regénérer l'index

Lancer les commandes depuis `tools/` :

```sh
# 1. Miniatures, par tranches de 3000 (une tranche par commande, on peut les lancer en parallèle)
for a in 0 3000 6000 9000 12000 15000 18000; do node build2.js $a $((a+3000)); done
# 2. Fusion → thumbs.bin / thumbs.json
node merge.js
# 3. Export → cartes-pokemon-index.bin / .json
node export.js
```

`export.js` écrit dans `/workspace/` (la racine du repo). Changer ce chemin si besoin.
Les tranches de `merge.js` sont codées en dur : en ajouter une si le catalogue dépasse 21 000 cartes.
Les sets Pokémon TCG Pocket (`A1`, `B1`, `P-A`…) sont exclus.

Après une regénération, incrémenter `?v=1` dans les URL de l'index dans `index.html` pour contourner le cache.

## Évaluer

```sh
node gen.js    # 200 photos simulées dans sim/
node eval.js   # top-1 / top-5 sur les miniatures (thumbs.*)
```

`e2e.js` teste la décision complète de l'appli sur plusieurs images. Il lit le code depuis un `app.js`
(le script de `index.html`) et les photos depuis `ocr/sim/` : adapter ces chemins avant de le lancer.
