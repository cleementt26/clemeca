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


## Extension du 16 septembre 2026 — quatre outils

Références croisées avec les cours consultés de mécanique des fluides (Arts et Métiers, T. Marcel-Mathey), Actionneurs (ISTP/ENSAM) et Vibrations (GMP, F. Toussaint). Aucun document de cours privé n’est publié.

- Vérins : surfaces pleine/annulaire, pressions relatives et frottement explicite. Référence fabricant : https://labvolt.festo.com/downloads/89791_F0.pdf ; complément : https://www.festo.com/net/supportportal/files/10203/actuators . Cas 50/20 mm à 6 bar sans contre-pression : 1178,097245 N en sortie. Le frottement n’est pas fixé arbitrairement à 10 %.
- Pertes de charge : Darcy–Weisbach, λ=64/Re et résolution de Colebrook par bissection. Références : https://www.energy.gov/ehss/articles/doe-hdbk-10123-92 et https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2294.pdf . Vérification indépendante laminaire par Hagen–Poiseuille (81,487331 Pa pour 0,036 m³/h, D=10 mm, L=2 m, μ=1 mPa·s). Cas Colebrook Re=100000, ε/D=0,0001 : λ=0,0185138661. Zone 2300≤Re<4000 exclue ; aucun mélange arbitraire des corrélations.
- Pompes : bilan ρgQH, rendements pompe et moteur distincts. Référence : https://www1.eere.energy.gov/manufacturing/tech_assistance/pdfs/pump.pdf . À 3,6 m³/h et 10 m, ρ=1000 : 98,1 W hydrauliques ; rendements 50 % et 80 % : 245,25 W électriques. Hors sélection constructeur et NPSH.
- Vibrations : oscillateur linéaire à 1 ddl, réponse à une force harmonique, amplitude crête et retard de phase avec atan2. Référence P. Steeneken (TU Delft), section 13.4, équation 13.65 : https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Introductory_Dynamics%3A_2D_Kinematics_and_Kinetics_of_Point_Masses_and_Rigid_Bodies_%28Steeneken%29/04%3A_Vibrations_and_Strategy/13%3A_Vibrations/13.04%3A_Forced_vibrations . Cas m=1 kg, k=100 N/m, c=2 N·s/m, F=10 N à ω=10 rad/s : X=0,5 m et retard 90°. La résonance non amortie avec force non nulle est refusée. Fréquence libre amortie non affichée pour ζ≥1.

Validation : 43 assertions numériques/cas limites supplémentaires et 48 assertions nouvelles de pages, rapports, navigation, champs invalides et résultats périmés. Les 113 assertions numériques et 135 assertions fonctionnelles existantes restent applicables. Ces tests vérifient les modèles explicités, pas une certification de dimensionnement industriel.


## Extension des ajustements — 17 septembre 2026

43 classes, domaine 0 < D ≤ 500 mm, bornes supérieures incluses.
Trous : D8/D9, E7/E8/E9, F6/F7/F8, G6/G7, H6/H7/H8/H9, JS6/JS7, K6/K7, M6/M7, N6/N7, P6/P7.
Arbres : d8/d9, e7/e8/e9, f6/f7/f8, g6, h6/h7/h8/h9, js6/js7, k6, m6, n6, p6.
Écarts entiers ou demi-entiers en micromètres, sans approximation ni extrapolation. Les trous K/M/N/P utilisent leurs tables propres à chaque qualité, et non une symétrie des arbres.
Source principale : [MISUMI, catalogue 2024, JIS B0401-2 (1998)](https://sg.c.misumi-ec.com/book/MSEA_EconomySeries_e-Catalogue202401/files/basic-html/page1575.html). Contrôle croisé des classes communes sur [NSK, Super Precision Bearings, pp. 284–287](https://www.nsk.com/content/dam/nsk/common/catalogs/ctrgPdf/bearings/e1254.pdf). Comparaison complémentaire MISUMI 1986 : ne pas reprendre les anciennes valeurs js7 arrondies ; utiliser les demi-micromètres de 1998.
Mode tabulé H7/h6 par défaut et après réinitialisation. Qualités non intégrées désactivées. Tests : 884 contrôles numériques et de bornes ; toutes les classes parcourues dans le formulaire avec génération du rapport, bascule manuelle et réinitialisation.


## 17 septembre 2026 — puissance, dilatation et zones de tolérance
- Puissance mécanique : P = T × 2πn/60, conversion W/kW exacte, trois inconnues possibles. Sources : [OpenStax §10.8](https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion), croisement de la conversion avec [PHT Vertex, transmission mécanique](https://www.vtx-precision.com/knowledge/knowledge-precise-gear-rack/mechanical-transmitting-gear-rack.html) : facteur 9549,297 arrondi ; le code conserve 60 000/(2π).
- Dilatation libre : ΔL = αL₀ΔT et inversion pour T₂. [OpenStax §1.3](https://openstax.org/books/university-physics-volume-2/pages/1-3-thermal-expansion), contrôle des hypothèses de coefficient moyen avec [NIST, métrologie thermique](https://emtoolbox.nist.gov/Faq/Faq.asp). Aucun matériau universel attribué au coefficient exemple. Températures sous le zéro absolu et dimensions finales non positives rejetées.
- Diagramme des ajustements : écarts déjà validés, convertis de mm en µm ; zéro commun, échelle verticale commune ; masqué dès modification ou erreur.
- 46 contrôles nouveaux (valeurs connues, inversions, zéros, signes, champs vides, domaines numériques, rapports et diagramme), 136 contrôles des pages et rapports existants, 43 sélections de classes et réinitialisation vérifiés.
- Signature : Clément VINCENT sur toutes les pages. Bibliothèque : 16 outils.


## 17 septembre 2026 — chaînes de cotes
- Nouveau calculateur linéaire 1D, 2 à 20 cotes, signes ±1, écarts inférieurs/supérieurs asymétriques en mm, condition facultative.
- Au pire des cas : chaque contribution négative inverse ses bornes. Le contrôle de condition reste fondé sur cet intervalle, même en mode RSS.
- RSS : centre calculé à partir du milieu réel de chaque intervalle (pas du nominal si les écarts sont asymétriques) ; demi-largeur quadratique obtenue avec hypot. Hypothèses affichées : indépendance, normalité, centrage et demi-largeur individuelle = 3σ. Pas de garantie de montage par RSS.
- Références croisées : [H7g6, cotation fonctionnelle](https://www.h7g6.fr/data/article/24/cotation-fonctionnelle), [S. Bensaada, Université de Biskra](https://www.univ-biskra.dz/enseignant/bensaada/COTATION%20FONCTIONNELLE.pdf), [F. Scholz, Boeing, Tolerance Stack Analysis Methods](https://faculty.washington.edu/fscholz/Reports/babytol.pdf), méthodes arithmétiques et RSS.
- Validation : 195 contrôles, dont énumération indépendante des 32 combinaisons extrêmes de 40 chaînes asymétriques, exemple publié de Biskra 40 H7/g6 → [0,009 ; 0,050] mm, exemple 50−20−29,5 = 0,5 mm avec bornes [0,3 ; 0,7], recentrage des tolérances unilatérales, domaines invalides, export des cotes actives uniquement, 20 cotes, sauvegarde/restauration et invalidation du schéma.
- Le schéma est recalculé à partir des cotes nominales, sans animation décorative ; il montre la somme orientée et non une géométrie d’assemblage.
