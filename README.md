# CléMéca

Dix calculateurs de mécanique et de thermique, par Clément Vincent.

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
