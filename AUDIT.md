# CléMéca — vérification des calculateurs

Vérification du 16 septembre 2026, à partir de `site_utilitaire_calculs_optimise.zip` fourni dans Google Drive.

## Corrections principales

- **Clavette** : la section cisaillée est b × L, et non b × L / 2. L’ancienne formule doublait la contrainte. Le couple négatif est traité en valeur absolue pour les contraintes ; un seuil absent ne produit plus de verdict favorable.
- **Ajustements** : remplacement des approximations non fiables (y compris le signe des écarts de trous G) par des valeurs tabulées pour H6/H7/H8, G6/G7, h6/h7/h8/h9 et g6, pour 0 < D ≤ 500 mm. Les bornes supérieures des intervalles sont incluses. Les autres classes restent calculables par saisie manuelle de leurs écarts normatifs. Aucune extrapolation automatique. À Ø20 H7/h6 : jeu 0 à 0,034 mm ; H7/g6 : 0,007 à 0,041 mm.
- **Vissage** : le couple utilise le diamètre nominal de la vis. L’ancien diamètre « sous tête » n’était pas adapté au modèle KFd. Suppression du verdict de tenue basé sur la simple comparaison précharge totale / effort extérieur. Le résultat est une estimation de serrage, pas une validation d’assemblage.
- **Courroie** : inversion analytique de la relation approchée, rejet des longueurs impossibles et des poulies qui se chevauchent. L’ancien algorithme pouvait retourner un entraxe plancher même sans solution.
- **Torsion et RDM** : contraintes maximales en valeur absolue, contrôle des dimensions et des modules, distinction entre champ vide et zéro. Les faibles résultats ne sont plus arbitrairement arrondis à zéro.
- **Thermique** : contrôle des températures physiques, pression absolue et kelvins explicités, divisions par zéro bloquées. Chaleur négative conservée pour un refroidissement.
- **Taraudage** : formule D − pas présentée comme estimation pour taraud coupant. Retrait de la promesse universelle de 75 % d’engagement.
- **Roulements** : exposant rouleaux exact 10/3, interprétation de L10 comme durée nominale à 90 % de fiabilité explicitée.
- **Unités** : conversions mm/pouces des ajustements et de la RDM réparées, y compris I en longueur⁴ et charge répartie en N/longueur.
- **Rapports** : remplacement du script d’origine invalide ; capture des paramètres et résultats, notes et choix d’inclusion, impression/PDF, copie et exports texte/Markdown/CSV. Les sorties périmées sont invalidées après modification des entrées. Les textes ne sont plus arrondis par une expression régulière qui pouvait altérer les valeurs et les désignations.

## Vérifications effectuées

- 113 assertions numériques : cas de référence pour les dix calculateurs, quatre cas de poutre, quatre inconnues du gaz parfait, aller-retour longueur/entraxe de courroie, bornes des treize plages de tolérances, couples signés, champs vides et valeurs impossibles.
- 135 assertions de fonctionnement des pages : chargement de toutes les pages de calcul, résultats initiaux, étiquettes des champs, invalidation des anciens résultats, conversion des unités, douze combinaisons de sections/charges de poutre, création et restitution des rapports, affichage sûr des notes.
- Vérification des références locales et de la syntaxe JavaScript.

Ces contrôles valident l’implémentation dans les domaines décrits. Ils ne constituent pas une certification normative ou une validation industrielle complète. Fatigue, concentrations de contraintes, comportement non linéaire et critères propres à chaque assemblage restent hors des modèles proposés.

## Références

- [Takayama — tables de tolérances usuelles, JIS B 0401-2](https://www.takayama-industry.com/technology/fitaxis/)
- [KHK — géométrie des engrenages](https://khkgears.net/gear-knowledge/gear-technical-reference/calculation-gear-dimensions/)
- [NPTEL / IIT Kharagpur — clavettes, cisaillement et appui](https://archive.nptel.ac.in/content/storage2/courses/112105125/pdf/Module-4_lesson-1.pdf)
- [JTEKT — durée nominale des roulements](https://koyo.jtekt.co.jp/en/support/bearing-knowledge/5-2000.html)
- [NASA — Fastener Design Manual](https://ntrs.nasa.gov/citations/19900009424)
- [OSG — tableaux de perçage pour taraudage](https://osgtool.com/literature/charts/)
