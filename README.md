# CléMéca

31 calculateurs de mécanique et de thermique, par Clément Vincent.

Interface en français, responsive, sans compte, sans serveur de calcul et sans suivi publicitaire. Les calculs s’effectuent dans le navigateur. Les paramètres et rapports enregistrés restent dans son stockage local ; ils ne se synchronisent pas entre appareils.

## Calculateurs

Ajustements et jeux, assemblages vissés, engrenages droits, torsion d’arbre, clavettes parallèles, durée des roulements, courroies, perçage de taraudage, résistance des matériaux et thermique.

Chaque outil expose ses formules et hypothèses. Les classes d’ajustement non tabulées sont accessibles via la saisie manuelle des écarts. Le vissage fournit une estimation du serrage, sans verdict global de résistance d’assemblage.

## Utilisation et publication

Site statique HTML/CSS/JavaScript : aucun abonnement, clé API ou processus de compilation nécessaire.

GitHub Pages publie la branche `main`, dossier racine. Modifier les fichiers puis enregistrer une modification dans cette branche déclenche la mise à jour du site. Le dépôt et le site sont publics.

Les exports PDF passent par la fenêtre d’impression du navigateur. Les rapports peuvent aussi être téléchargés pour conserver une copie hors du navigateur.

## Validation

Voir [AUDIT.md](AUDIT.md) pour les corrections, les limites et les sources techniques. Le moteur de calcul conserve la précision numérique jusqu’à l’affichage.

Les 113 assertions numériques peuvent être relancées avec Node.js : `node calculations.test.cjs`.


## Ajouts du 16 septembre 2026
Quatre calculateurs : vérins, pertes de charge, pompes et vibrations. Formules et limites accessibles sur chaque page. Validation numérique : `node extensions.test.cjs`. Les exemples sont modifiables ; les rendements, frottements et propriétés des fluides doivent correspondre au cas réel.


## Contraintes combinées — 6 octobre 2026
Arbre plein ou creux soumis à traction/compression, flexion et torsion ; ou saisie directe σx, σy, τxy au même point. Von Mises, contraintes principales, comparaison à Re avec coefficient visé, cercle de Mohr et rapports. Sources MIT/Duke et limites accessibles dans la page. Validation : `node von-mises.test.cjs` (163 contrôles numériques).

## Compléments du catalogue — 20 octobre 2026

Comparaison avec les fonctions publiquement décrites sur [h7g6](https://www.h7g6.fr/tools), sans copie de leur code ni de leur interface :

- Conversion d’unités : 13 familles, températures absolues et facteurs SI.
- Masse : jusqu’à 10 lignes de pièces simples, quantités et densités saisies.
- Temps de cycle : jusqu’à 12 mouvements ou pauses, translations et rotations, profils triangulaires/trapézoïdaux.
- Répartition d’un budget de tolérance : poids explicites, pire des cas ou allocation RSS.
- Jeu angulaire : arbre rigide dans une ou deux bagues de longueur finie, amplitude et battement au point observé.
- Distance d’approche : budget arithmétique uniquement ; coefficients et temps à établir par une personne compétente. **Ne valide pas une protection ni une conformité ISO 13855.**
- Anneaux d’arrêt : capacité fabricant saisie et contrôles idéalisés de gorge. **Pas de sélection DIN 471/472 ni de capacité catalogue déduite.**
- Vis à billes : couple, vitesse, puissance et durée nominale.
- Vis trapézoïdale : couple de montée/descente, rendement et réversibilité théorique.
- Quatre patins de guidage : répartition simplifiée de Fz/Mx/My et estimation L10 à charge constante.

Les sélecteurs commerciaux h7g6 et plusieurs résultats nécessitent une connexion : aucune équivalence numérique avec leur service ou recommandation de référence commerciale n’est revendiquée. Les nouveaux modèles sont indépendants et leurs hypothèses sont affichées dans chaque page. Les paramètres vides des deux pré-études sécurité/anneaux ne sont pas remplacés par des valeurs prétendument normatives.

Les pages conservent les rapports, téléchargements et paramètres locaux existants. Régénérer les dix nouvelles pages : `node build-library.cjs`.

Tests supplémentaires :

```sh
node h7-utilities.test.cjs
node translation-models.test.cjs
node screening-models.test.cjs
```

Pour les tests DOM, installer `jsdom@26` dans un environnement de développement (pas nécessaire au site) et lancer `node library-ui.test.cjs`. Un chemin alternatif est accepté avec `CLEMECA_JSDOM_PATH`. L’ensemble vérifie les dix nouveaux outils, les unités restaurées par lien ou paramètre enregistré, les rapports et les 21 anciennes pages.
