# Parcours exécutés (moteur réel, sans rendu)

Fichier généré par `audit-narratif/outils/parcours.audit.test.ts`. Ne pas modifier à la main.

Chaque parcours joue le chapitre dans le vrai moteur (`src/engine`) avec le vrai contenu (`src/content`).
Les séquences de l’application (conseil, nuit, expédition, retour, départ, assemblée) sont recopiées de `src/app/App.ts`.
La marche est approchée en ligne droite ; les PNJ sont placés selon leur emploi du temps. Aucun rendu, aucune interface.

### P1-principale-controleur — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- début [J1 07:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- fin de matinée [J1 08:21] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- retour à bord [J2 08:34] HUD : « Trouver ce qui a fait tomber la filtration. » — 9 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 9 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 10 entrées
Carnet final (10) : c_billet_cabine0, c_alarmes, c_socle_vide, c_pompe_secours, c_bon_sortie, t_castel_version, c_traces_theo, c_armoire_k, f_depot, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_filtration
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### P1-principale-passager — Le Passager
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- début [J1 07:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- fin de matinée [J1 08:15] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 6 entrées
- retour à bord [J2 08:34] HUD : « Trouver ce qui a fait tomber la filtration. » — 9 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 9 entrées
- fin [J2 15:00] HUD : « Parler à la docteure Sorel de l'état de Lou. » — 10 entrées
Carnet final (10) : c_alarmes, c_socle_vide, c_pompe_secours, c_bon_sortie, t_castel_version, t_noe_saut, c_traces_theo, c_armoire_k, f_depot, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=active [·sorel ·trouver ·soigner]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_filtration
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Passager : Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.

### P1-principale-majordome — Le Majordome
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- début [J1 07:05] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- fin de matinée [J1 08:37] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- retour à bord [J2 08:34] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 8 entrées
- fin [J2 15:00] HUD : « Remettre la lettre à Marchetti… ou en décider autrement. » — 9 entrées
Carnet final (9) : c_alarmes, c_socle_vide, c_pompe_secours, c_bon_sortie, t_castel_version, c_traces_theo, c_armoire_k, f_depot, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_majordome=active [·remettre ·garcon]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_filtration
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Majordome : La lettre dort au fond de votre poche, comme une décision qu’on remet au lendemain.

### P1-principale-mecanicien — Le Mécanicien
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- début [J1 07:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- fin de matinée [J1 08:09] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 5 entrées
- retour à bord [J2 08:33] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 8 entrées
- fin [J2 15:00] HUD : « Relire le carnet d'entretien (établi de l'atelier). » — 9 entrées
Carnet final (9) : c_alarmes, c_socle_vide, c_pompe_secours, c_bon_sortie, t_castel_version, c_traces_theo, c_armoire_k, f_depot, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_mecanicien=active [·voir ·vasseur ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_filtration
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Mécanicien : Votre signature est toujours au bas de la page. Personne ne l’a encore lue. Personne, pour l’instant.

### P2-explorateur-controleur — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"audit","k3_radio":"filtration","direction":"clairval"} ; arguments : expedition.e_theo_vivant, expedition.e_theo_castel, expedition.e_mara_guide, rationnement.r_detournement, rationnement.r_trafic_castel, direction.d_mur, direction.d_mere, direction.d_theo
Révélations possibles à l’assemblée : rev_radio, rev_pompe, rev_theo ; faites : rev_radio, rev_pompe, rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- avant le conseil [J1 14:37] HUD : « Assister au conseil de 17:00 (cantine). » — 39 entrées
- conseil (avant) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 39 entrées
- conseil (après) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 39 entrées
- aube (préparation) [J2 05:30] HUD : « Décider quoi dire à Rosa. » — 39 entrées
- retour à bord [J2 11:57] HUD : « Décider quoi dire à Rosa. » — 45 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 45 entrées
- fin [J2 15:00] HUD : « Décider quoi dire à Rosa. » — 46 entrées
Carnet final (46) : c_billet_cabine0, c_carnet_entretien, c_couchette_theo, c_alarmes, c_socle_vide, c_pompe_secours, c_cabine_horaire, c_bon_sortie, f_pompe_morte, t_vasseur_theo, t_vasseur_pompe, c_carnet_theo, f_k3_radio, f_panne, c_medaillon_sorel, t_sorel_fille, c_tableau_rations, t_rosa_portions, t_vic_k3, c_cache, t_mara_theo, t_mara_clairval, t_mara_mere, c_medaillon_mara, f_theo_cachait, t_noe_saut, t_castel_version, c_registre_passagers, t_hotesse_castel, c_compteur_eau, c_registre_cabine0, f_detournement, c_registre_radio, c_relais_radio, f_signal_cache, f_depot, f_chronologie, t_castel_aveu, f_mere, c_mur_messages, c_traces_theo, c_armoire_k, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ✓reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [✓registre ✓cabine0 ✓cabine ✓choix] | q_ration=active [✓enquete ·decider] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_mere_reunie, cq_rationnement_audit, cq_marchetti_destitue, cq_k3_rendu, cq_filtration, cq_signal_rouge, cq_theo_sauve, cq_radio_publique, cq_vasseur_exposee
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. Dans la cabine de conduite, le pupitre s’allume tout seul. Message prioritaire, canal de service : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées. Rosa tient les comptes de la réserve. Les parts sont égales, le Salon grince des dents.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence. Tout le train sait désormais que Castel a caché Clairval. Il a gardé son brassard, mais plus personne ne baisse les yeux devant lui.
Épilogue — Le Contrôleur : Dans la cabine, vous avez recopié l’horaire du VAYN-2 sur une page de votre carnet. Une ligne fantôme, avec un mois d’avance sur vous. Quelqu’un, quelque part, a écrit votre trajet avant vous. La « cabine 0 » a été rayée du registre. Pour la première fois depuis le départ, les comptes tombent juste.

### P2-explorateur-passager — Le Passager
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","k3_radio":"filtration","direction":"clairval"} ; arguments : expedition.e_theo_vivant, expedition.e_theo_castel, expedition.e_mara_guide, rationnement.r_detournement, rationnement.r_trafic_castel, direction.d_mur, direction.d_mere, direction.d_theo
Révélations possibles à l’assemblée : rev_radio, rev_pompe, rev_trafic, rev_theo ; faites : rev_radio, rev_pompe, rev_trafic, rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- avant le conseil [J1 14:31] HUD : « Assister au conseil de 17:00 (cantine). » — 36 entrées
- conseil (avant) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 36 entrées
- conseil (après) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 36 entrées
- aube (préparation) [J2 05:30] HUD : « — » — 36 entrées
- retour à bord [J2 11:57] HUD : « — » — 42 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 42 entrées
- fin [J2 15:00] HUD : « — » — 43 entrées
Carnet final (43) : c_carnet_entretien, c_couchette_theo, c_alarmes, c_socle_vide, c_pompe_secours, c_bon_sortie, f_pompe_morte, t_vasseur_theo, t_vasseur_pompe, c_carnet_theo, f_k3_radio, f_panne, c_medaillon_sorel, t_sorel_fille, c_tableau_rations, t_rosa_portions, t_vic_k3, t_agathe_soute, c_cache, t_mara_theo, t_mara_clairval, t_mara_mere, c_medaillon_mara, f_theo_cachait, t_noe_saut, t_castel_version, t_hotesse_castel, c_compteur_eau, c_registre_cabine0, f_detournement, c_registre_radio, f_signal_cache, f_depot, f_chronologie, t_castel_aveu, f_mere, c_mur_messages, c_traces_theo, c_armoire_k, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ✓reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=done [✓sorel ✓trouver ✓soigner] | q_ration=done [✓enquete ✓decider] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_mere_reunie, cq_lou_soignee, cq_ration_couvert, cq_rationnement_quota, cq_k3_rendu, cq_filtration, cq_signal_rouge, cq_theo_sauve, cq_radio_publique, cq_vasseur_exposee, cq_marchetti_destitue
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. Dans la cabine de conduite, le pupitre s’allume tout seul. Message prioritaire, canal de service : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées. Rosa tient les comptes de la réserve. Le train mange désormais au mérite : les dortoirs ont vu leur portion diminuer, et ils l’ont retenu.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence. Tout le train sait désormais que Castel a caché Clairval. Il a gardé son brassard, mais plus personne ne baisse les yeux devant lui.
Épilogue — Le Passager : La fièvre de Lou est tombée dans la nuit. Elle a réclamé de la confiture, qu’il n’y a plus nulle part. Vous avez ri comme un idiot.

### P2-explorateur-majordome — Le Majordome
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"audit","k3_radio":"filtration","direction":"clairval"} ; arguments : expedition.e_theo_vivant, expedition.e_theo_castel, expedition.e_mara_guide, rationnement.r_detournement, rationnement.r_trafic_castel, direction.d_mur, direction.d_mere, direction.d_theo
Révélations possibles à l’assemblée : rev_radio, rev_pompe, rev_theo ; faites : rev_radio, rev_pompe, rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- avant le conseil [J1 14:36] HUD : « Assister au conseil de 17:00 (cantine). » — 39 entrées
- conseil (avant) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 39 entrées
- conseil (après) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 39 entrées
- aube (préparation) [J2 05:30] HUD : « Décider quoi dire à Rosa. » — 39 entrées
- retour à bord [J2 11:56] HUD : « Décider quoi dire à Rosa. » — 45 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 45 entrées
- fin [J2 15:00] HUD : « Décider quoi dire à Rosa. » — 46 entrées
Carnet final (46) : c_carnet_entretien, c_couchette_theo, c_alarmes, c_socle_vide, c_pompe_secours, c_bon_sortie, f_pompe_morte, t_vasseur_theo, t_vasseur_pompe, c_carnet_theo, f_k3_radio, f_panne, c_medaillon_sorel, t_sorel_fille, c_tableau_rations, t_rosa_portions, t_vic_k3, c_cache, t_mara_theo, t_mara_clairval, t_mara_mere, c_medaillon_mara, f_theo_cachait, t_noe_saut, t_castel_version, t_hotesse_castel, t_villiers_theo, c_lettre_madame, c_compteur_eau, c_registre_cabine0, f_detournement, c_registre_radio, c_relais_radio, f_signal_cache, f_depot, f_chronologie, t_castel_aveu, c_gardemanger_salon, f_mere, c_mur_messages, c_traces_theo, c_armoire_k, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ✓reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_majordome=done [✓remettre ✓garcon] | q_ration=active [✓enquete ·decider] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_lettre_remise_lue, cq_mere_reunie, cq_rationnement_audit, cq_marchetti_destitue, cq_k3_rendu, cq_filtration, cq_signal_rouge, cq_theo_sauve, cq_radio_publique, cq_vasseur_exposee
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. Dans la cabine de conduite, le pupitre s’allume tout seul. Message prioritaire, canal de service : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées. Rosa tient les comptes de la réserve. Les parts sont égales, le Salon grince des dents.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence. Tout le train sait désormais que Castel a caché Clairval. Il a gardé son brassard, mais plus personne ne baisse les yeux devant lui.
Épilogue — Le Majordome : Vous avez lu la lettre avant de la remettre : Marchetti a vu le cachet brisé, et il n’a rien dit. Noé a reçu des rations pour se taire. Vous êtes resté un bon domestique — vous n’êtes pas certain d’être resté quelqu’un de bien.

### P2-explorateur-mecanicien — Le Mécanicien
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","k3_radio":"filtration","direction":"clairval"} ; arguments : expedition.e_theo_vivant, expedition.e_theo_castel, expedition.e_mara_guide, rationnement.r_detournement, rationnement.r_trafic_castel, direction.d_mur, direction.d_mere, direction.d_theo
Révélations possibles à l’assemblée : rev_radio, rev_trafic, rev_theo ; faites : rev_radio, rev_trafic, rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- avant le conseil [J1 14:26] HUD : « Assister au conseil de 17:00 (cantine). » — 39 entrées
- conseil (avant) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 39 entrées
- conseil (après) [J1 17:00] HUD : « Dormir avant l'expédition de l'aube (votre couchette). » — 39 entrées
- aube (préparation) [J2 05:30] HUD : « Décider quoi dire à Rosa. » — 39 entrées
- retour à bord [J2 11:56] HUD : « Décider quoi dire à Rosa. » — 45 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 45 entrées
- fin [J2 15:00] HUD : « Décider quoi dire à Rosa. » — 46 entrées
Carnet final (46) : c_carnet_entretien, c_couchette_theo, c_alarmes, c_socle_vide, c_pompe_secours, c_cabine_horaire, c_bon_sortie, f_pompe_morte, t_vasseur_theo, t_vasseur_pompe, c_carnet_theo, f_k3_radio, f_panne, c_medaillon_sorel, t_sorel_fille, c_tableau_rations, t_rosa_portions, t_vic_k3, t_agathe_soute, c_cache, t_mara_theo, t_mara_clairval, t_mara_mere, c_medaillon_mara, f_theo_cachait, t_noe_saut, t_castel_version, t_hotesse_castel, c_compteur_eau, c_registre_cabine0, f_detournement, c_registre_radio, c_relais_radio, f_signal_cache, f_depot, f_chronologie, t_castel_aveu, c_gardemanger_salon, f_mere, c_mur_messages, c_traces_theo, c_armoire_k, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ✓reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_mecanicien=done [✓voir ✓vasseur ✓choix] | q_ration=active [✓enquete ·decider] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_malo_aveu, cq_mere_reunie, cq_rationnement_quota, cq_k3_rendu, cq_filtration, cq_signal_rouge, cq_theo_sauve, cq_radio_publique, cq_marchetti_destitue
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. Dans la cabine de conduite, le pupitre s’allume tout seul. Message prioritaire, canal de service : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration ronronne. On recommence à boire sans compter les gorgées. Rosa tient les comptes de la réserve. Le train mange désormais au mérite : les dortoirs ont vu leur portion diminuer, et ils l’ont retenu.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence. Tout le train sait désormais que Castel a caché Clairval. Il a gardé son brassard, mais plus personne ne baisse les yeux devant lui.
Épilogue — Le Mécanicien : Vous avez avoué votre signature. On vous regarde autrement à l’atelier : comme quelqu’un sur qui on peut compter, justement parce qu’il s’est trompé une fois.

### P3-refus-passager — Le Passager
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- retour à bord [J2 09:39] HUD : « Gagner la confiance de Mara. » — 14 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 14 entrées
- fin [J2 15:00] HUD : « Gagner la confiance de Mara. » — 15 entrées
Carnet final (15) : c_alarmes, c_socle_vide, c_pompe_secours, t_vasseur_theo, t_castel_version, t_rosa_portions, c_cache, t_mara_theo, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=active [·sorel ·trouver ·soigner] | q_mara=active [✓trouver ·confiance ·mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_theo_laisse
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo est resté au poste d’aiguillage, avec Anselme et son fusil. Vous avez choisi de partir sans lui. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Passager : Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.

### P3-refus-majordome — Le Majordome
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- retour à bord [J2 09:40] HUD : « Gagner la confiance de Mara. » — 14 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 14 entrées
- fin [J2 15:00] HUD : « Gagner la confiance de Mara. » — 15 entrées
Carnet final (15) : c_alarmes, c_socle_vide, c_pompe_secours, t_vasseur_theo, t_castel_version, t_rosa_portions, c_cache, t_mara_theo, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_majordome=done [✓remettre ·garcon] | q_mara=active [✓trouver ·confiance ·mere ·reunion ✓proteger]
Conséquences : cq_lettre_brulee, cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_theo_laisse
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo est resté au poste d’aiguillage, avec Anselme et son fusil. Vous avez choisi de partir sans lui. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Majordome : La lettre a brûlé dans le poêle des dortoirs. Madame vous sonne toujours, mais vous prenez votre temps pour répondre.

### P4-oppose-controleur — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"eau","rationnement":"quota","clandestin":"expulsion","direction":"sud"} ; arguments : expedition.e_eau_citerne, direction.d_boucle, direction.d_vayn2
Révélations possibles à l’assemblée : rev_trafic, rev_theo ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 13 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 13 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 13 entrées
- retour à bord [J2 10:46] HUD : « Gagner la confiance de Mara. » — 20 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 20 entrées
- fin [J2 15:00] HUD : « Gagner la confiance de Mara. » — 21 entrées
Carnet final (21) : c_billet_cabine0, c_alarmes, c_socle_vide, c_pompe_secours, c_tableau_rations, t_hotesse_castel, t_castel_version, t_castel_aveu, c_compteur_eau, c_registre_cabine0, f_detournement, c_cache, t_mara_clairval, c_mur_messages, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ✓reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ✓cabine0 ·cabine ·choix] | q_mara=active [✓trouver ·confiance ·mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_expulsee(+anselme), cq_signal_rouge, cq_eau_tour, cq_theo_sauve
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara a été débarquée à Saint-Aubin. Au poste d’aiguillage, Anselme lui a donné de l’eau et une couverture : elle est repartie seule vers la vallée, avant l’aube.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### P4-oppose-mecanicien — Le Mécanicien
Chapitre terminé.
Votes : {"expedition":"eau","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : expedition.e_eau_citerne, direction.d_boucle, direction.d_vayn2
Révélations possibles à l’assemblée : rev_trafic, rev_theo ; faites : aucune
Malaises : 0 ; minutes dans la brume : 18
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 11 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 11 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 11 entrées
- retour à bord [J2 12:07] HUD : « Assister à l'assemblée de 15:00. » — 18 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 18 entrées
- fin [J2 15:00] HUD : « Gagner la confiance de Mara. » — 19 entrées
Carnet final (19) : c_alarmes, c_socle_vide, c_pompe_secours, c_tableau_rations, t_hotesse_castel, t_castel_version, c_compteur_eau, c_registre_cabine0, f_detournement, c_cache, t_mara_clairval, c_mur_messages, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ✓reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_mecanicien=active [·voir ·vasseur ·choix] | q_mara=active [✓trouver ·confiance ·mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_signal_rouge, cq_eau_tour, cq_theo_sauve
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Mécanicien : Votre signature est toujours au bas de la page. Personne ne l’a encore lue. Personne, pour l’instant.

### P5-indices-manques-mecanicien — Le Mécanicien
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 1 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 1 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 1 entrées
- retour à bord [J2 10:33] HUD : « Relire le carnet d'entretien (établi de l'atelier). » — 7 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 7 entrées
- fin [J2 15:00] HUD : « Relire le carnet d'entretien (établi de l'atelier). » — 8 entrées
Carnet final (8) : c_alarmes, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_mecanicien=active [·voir ·vasseur ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_theo_sauve
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Mécanicien : Votre signature est toujours au bas de la page. Personne ne l’a encore lue. Personne, pour l’instant.

### P5-indices-manques-majordome — Le Majordome
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 1 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 1 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 1 entrées
- retour à bord [J2 10:33] HUD : « Remettre la lettre à Marchetti… ou en décider autrement. » — 7 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 7 entrées
- fin [J2 15:00] HUD : « Remettre la lettre à Marchetti… ou en décider autrement. » — 8 entrées
Carnet final (8) : c_alarmes, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_majordome=active [·remettre ·garcon]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_theo_sauve
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Majordome : La lettre dort au fond de votre poche, comme une décision qu’on remet au lendemain.

### P6-mefiant-passager — Le Passager
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : expedition.e_filtration, rationnement.r_quota_injuste, direction.d_boucle, direction.d_vayn2
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 8 entrées
- retour à bord [J2 09:54] HUD : « Retrouver la personne qu'elle cherche. » — 14 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 14 entrées
- fin [J2 15:00] HUD : « Retrouver la personne qu'elle cherche. » — 15 entrées
Carnet final (15) : c_alarmes, c_socle_vide, c_pompe_secours, t_castel_version, c_cache, t_mara_clairval, t_mara_theo, t_mara_mere, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=active [·sorel ·trouver ·soigner] | q_mara=active [✓trouver ✓confiance ·mere ·reunion ✓proteger] | q_ration=done [✓enquete ✓decider]
Conséquences : cq_ration_noe_denonce, cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Passager : Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.

### P6-mefiant-controleur — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : expedition.e_filtration, rationnement.r_quota_injuste, direction.d_boucle, direction.d_vayn2
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 9 entrées
- conseil (après) [J1 17:00] HUD : « Trouver ce qui a fait tomber la filtration. » — 9 entrées
- aube (préparation) [J2 05:30] HUD : « Trouver ce qui a fait tomber la filtration. » — 9 entrées
- retour à bord [J2 09:55] HUD : « Retrouver la personne qu'elle cherche. » — 15 entrées
- assemblée (avant) [J2 15:00] HUD : « Assister à l'assemblée de 15:00. » — 15 entrées
- fin [J2 15:00] HUD : « Retrouver la personne qu'elle cherche. » — 16 entrées
Carnet final (16) : c_billet_cabine0, c_alarmes, c_socle_vide, c_pompe_secours, t_castel_version, c_cache, t_mara_clairval, t_mara_theo, t_mara_mere, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [✓machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=active [✓trouver ✓confiance ·mere ·reunion ✓proteger] | q_ration=done [✓enquete ✓decider]
Conséquences : cq_ration_noe_denonce, cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C1-revelation-au-conseil — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","clandestin":"accueil","direction":"sud"} ; arguments : expedition.e_mara_guide, clandestin.m_mere, clandestin.m_mere_marchetti, clandestin.m_theo, direction.d_mere
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- retour à bord [J2 06:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 8 entrées
Carnet final (8) : c_billet_cabine0, c_medaillon_sorel, c_cache, t_mara_theo, t_mara_mere, c_medaillon_mara, f_mere, c_vayn2
Missions : q_main=done [·machines ·panne ·theo ·reserves ✓conseil ✓dormir ·expedition ·theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_accueil, cq_mere_reunie
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C2-castel-cellule — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- retour à bord [J2 06:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 8 entrées
Carnet final (8) : c_billet_cabine0, c_medaillon_sorel, c_cache, t_mara_theo, t_mara_mere, c_medaillon_mara, f_mere, c_vayn2
Missions : q_main=done [·machines ·panne ·theo ·reserves ✓conseil ✓dormir ·expedition ·theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_mere_reunie, cq_rationnement_quota
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C3-cellule-puis-expedition — Le Passager
Chapitre terminé.
Votes : {"expedition":"eau","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : direction.d_boucle, direction.d_vayn2
Révélations possibles à l’assemblée : rev_theo ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- retour à bord [J2 09:40] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 8 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 8 entrées
- fin [J2 15:00] HUD : « Gagner la confiance de Mara. » — 9 entrées
Carnet final (9) : c_cache, t_mara_theo, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=active [·sorel ·trouver ·soigner] | q_mara=active [✓trouver ·confiance ·mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Passager : Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.

### C4b-theo-ramene-direct — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- retour à bord [J2 10:08] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 3 entrées
Carnet final (3) : c_billet_cabine0, c_traces_theo, c_vayn2
Missions : q_main=done [·machines ·panne ✓theo ·reserves ✓conseil ✓dormir ·expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_theo_sauve
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C5-radio-sans-mara — Le Mécanicien
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 21:05] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- conseil (après) [J1 21:05] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- retour à bord [J2 06:31] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 2 entrées
- fin [J2 15:00] HUD : « Relire le carnet d'entretien (établi de l'atelier). » — 3 entrées
Carnet final (3) : c_relais_radio, c_voix_clairval, c_vayn2
Missions : q_main=done [·machines ·panne ✓theo ·reserves ✓conseil ✓dormir ·expedition ✓theo_dehors ✓assemblee] | qp_mecanicien=active [·voir ·vasseur ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Mécanicien : Votre signature est toujours au bas de la page. Personne ne l’a encore lue. Personne, pour l’instant.

### C6-promesse-castel — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 4 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 4 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 4 entrées
- retour à bord [J2 10:48] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 10 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 10 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 11 entrées
Carnet final (11) : c_billet_cabine0, t_hotesse_castel, t_castel_version, t_castel_aveu, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_theo_sauve, cq_castel_trahie
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi. Vous avez promis à Castel que son aveu ne sortirait pas de son bureau, et vous l’ai dit devant deux cents personnes. Il ne vous le pardonnera pas. Vous le savez.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C7-vol-antibio — Le Passager
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- retour à bord [J2 06:31] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- fin [J2 15:00] HUD : « — » — 1 entrées
Carnet final (1) : c_vayn2
Missions : q_main=done [·machines ·panne ·theo ·reserves ✓conseil ✓dormir ·expedition ·theo_dehors ✓assemblee] | qp_passager=done [✓sorel ·trouver ✓soigner]
Conséquences : cq_lou_soignee, cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Passager : La fièvre de Lou est tombée dans la nuit. Elle a réclamé de la confiture, qu’il n’y a plus nulle part. Vous avez ri comme un idiot. Quelqu’un, plus haut sur la liste, n’a pas eu sa boîte. Vous ne demandez pas qui.

### C8-mara-meurt — Le Passager
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","direction":"clairval"} ; arguments : expedition.e_mara_guide, direction.d_theo
Révélations possibles à l’assemblée : rev_theo ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 6 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 6 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 6 entrées
- retour à bord [J2 09:55] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 12 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 12 entrées
- fin [J2 15:00] HUD : « Parler à la docteure Sorel de l'état de Lou. » — 13 entrées
Carnet final (13) : c_medaillon_sorel, c_cache, t_mara_theo, t_mara_mere, c_medaillon_mara, f_mere, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=active [·sorel ·trouver ·soigner] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_mere_reunie, cq_rationnement_quota, cq_comp_mort
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara n’a pas reparu de Saint-Aubin. Sorel, à l’infirmerie, a recommencé à préparer le dîner pour deux, chaque soir. Saint-Aubin a gardé Mara. On a vidé son casier sans en parler à personne.
Épilogue — Le Passager : Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.

### C9-vasseur-meurt — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- retour à bord [J2 09:49] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 8 entrées
Carnet final (8) : c_billet_cabine0, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_comp_mort
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute. L’atelier tourne sans Vasseur : les pièces se perdent, les retards s’empilent, et personne ne signe la révision.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi. Saint-Aubin a gardé Odile Vasseur. On a vidé son casier sans en parler à personne.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C10-mara-premiere-fois-en-cellule — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- retour à bord [J2 06:31] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 1 entrées
- fin [J2 15:00] HUD : « Gagner la confiance de Mara. » — 2 entrées
Carnet final (2) : c_billet_cabine0, c_vayn2
Missions : q_main=done [·machines ·panne ·theo ·reserves ✓conseil ✓dormir ·expedition ·theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=active [✓trouver ·confiance ·mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C11-theo-signal-rouge — Le Passager
Chapitre terminé.
Votes : {"expedition":"pieces","rationnement":"quota","clandestin":"cellule","direction":"sud"} ; arguments : aucun
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 0 entrées
- retour à bord [J2 09:52] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 6 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 6 entrées
- fin [J2 15:00] HUD : « Parler à la docteure Sorel de l'état de Lou. » — 7 entrées
Carnet final (7) : c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_passager=active [·sorel ·trouver ·soigner]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_signal_rouge, cq_theo_sauve
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau. Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.
Épilogue — Le Passager : Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.

### C12-mere-revelee-au-conseil — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","clandestin":"accueil","direction":"sud"} ; arguments : expedition.e_mara_guide, clandestin.m_mere, clandestin.m_mere_marchetti, clandestin.m_theo, direction.d_mere
Révélations possibles à l’assemblée : aucune ; faites : aucune
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 7 entrées
- retour à bord [J2 08:48] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 10 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 10 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 11 entrées
Carnet final (11) : c_billet_cabine0, c_medaillon_sorel, c_cache, t_mara_theo, t_mara_mere, c_medaillon_mara, f_mere, c_traces_theo, c_armoire_k, f_depot, c_vayn2
Missions : q_main=done [·machines ·panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=done [✓trouver ✓confiance ✓mere ✓reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_accueil, cq_mere_reunie
Fin (découverte) : 16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses. Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C13-revelation-puis-cellule — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","clandestin":"cellule","direction":"clairval"} ; arguments : expedition.e_theo_castel, expedition.e_mara_guide, clandestin.m_mere, direction.d_theo
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 16 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 16 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 16 entrées
- retour à bord [J2 09:39] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 22 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 22 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 23 entrées
Carnet final (23) : c_billet_cabine0, c_pompe_secours, c_bon_sortie, f_pompe_morte, t_vasseur_pompe, c_medaillon_sorel, c_cache, t_mara_theo, t_mara_clairval, t_mara_mere, c_medaillon_mara, f_mere, t_hotesse_castel, t_castel_version, t_castel_aveu, c_registre_radio, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=active [✓trouver ✓confiance ✓mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule, cq_castel_trahie
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara attend dans sa cellule. Vous avez dit au conseil qui était sa mère ; la porte, elle, est restée fermée. Vous avez promis à Castel que son aveu ne sortirait pas de son bureau, et vous l’ai dit devant deux cents personnes. Il ne vous le pardonnera pas. Vous le savez.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

### C14-revelation-puis-expulsion — Le Contrôleur
Chapitre terminé.
Votes : {"expedition":"theo","rationnement":"quota","clandestin":"expulsion","direction":"clairval"} ; arguments : expedition.e_theo_castel, expedition.e_mara_guide, clandestin.m_mere, direction.d_theo
Révélations possibles à l’assemblée : rev_theo ; faites : rev_theo
Malaises : 0 ; minutes dans la brume : 0
Instantanés (heure — objectif affiché dans le HUD — entrées) :
- conseil (avant) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 12 entrées
- conseil (après) [J1 17:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 12 entrées
- aube (préparation) [J2 05:30] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 12 entrées
- retour à bord [J2 09:40] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 18 entrées
- assemblée (avant) [J2 15:00] HUD : « Comprendre l'arrêt du train (voiture des machines, en tête). » — 18 entrées
- fin [J2 15:00] HUD : « Consulter le registre des passagers (bureau du Contrôle). » — 19 entrées
Carnet final (19) : c_billet_cabine0, c_medaillon_sorel, c_cache, t_mara_theo, t_mara_clairval, t_mara_mere, c_medaillon_mara, f_mere, t_hotesse_castel, t_castel_version, t_castel_aveu, c_registre_radio, c_traces_theo, c_armoire_k, f_depot, t_anselme, c_emission_clairval, t_theo_recit, c_vayn2
Missions : q_main=done [·machines ✓panne ✓theo ·reserves ✓conseil ✓dormir ✓expedition ✓theo_dehors ✓assemblee] | qp_controleur=active [·registre ·cabine0 ·cabine ·choix] | q_mara=active [✓trouver ✓confiance ✓mere ·reunion ✓proteger]
Conséquences : cq_mara_capturee, cq_rationnement_quota, cq_mara_expulsee(+anselme), cq_castel_trahie
Fin (découverte) : 16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval. En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante : « …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… » Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre. Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.
Épilogue — Le train : La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.
Épilogue — Les gens : Vous avez entendu Théo, vivant, et il ignore encore ce que vous avez fait de sa nuit. Ça ne se rattrape pas. Mara a été débarquée à Saint-Aubin. Au poste d’aiguillage, Anselme lui a donné de l’eau et une couverture : elle est repartie seule vers la vallée, avant l’aube. Vous avez promis à Castel que son aveu ne sortirait pas de son bureau, et vous l’ai dit devant deux cents personnes. Il ne vous le pardonnera pas. Vous le savez.
Épilogue — Le Contrôleur : La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.

## Grille de compréhension

| Parcours | Panne : cause | Théo : ce qui lui est arrivé | Réserves : où va l’eau | Clandestine : qui, pourquoi | Clairval : existe ? | Castel a caché Clairval | VAYN-2 : préparé ? |
|---|---|---|---|---|---|---|---|
| P1-principale-controleur | non | partielle | non | rencontrée | non | non | découverte brute |
| P1-principale-passager | non | partielle | non | rencontrée | non | non | découverte brute |
| P1-principale-majordome | non | partielle | non | rencontrée | non | non | découverte brute |
| P1-principale-mecanicien | non | partielle | non | rencontrée | non | non | découverte brute |
| P2-explorateur-controleur | oui | oui (récit de Théo) | oui (sans le motif) | oui | indices + doute (boucle) | oui | préparé |
| P2-explorateur-passager | oui | oui (récit de Théo) | oui (sans le motif) | oui | indices + doute (boucle) | oui | préparé |
| P2-explorateur-majordome | oui | oui (récit de Théo) | oui (sans le motif) | oui | indices + doute (boucle) | oui | préparé |
| P2-explorateur-mecanicien | oui | oui (récit de Théo) | oui (sans le motif) | oui | indices + doute (boucle) | oui | préparé |
| P3-refus-passager | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| P3-refus-majordome | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| P4-oppose-controleur | oui | oui (récit de Théo) | oui (sans le motif) | rencontrée | indices + doute (boucle) | non | préparé |
| P4-oppose-mecanicien | oui | oui (récit de Théo) | oui (sans le motif) | rencontrée | indices + doute (boucle) | non | préparé |
| P5-indices-manques-mecanicien | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| P5-indices-manques-majordome | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| P6-mefiant-passager | oui | oui (récit de Théo) | non | motif connu | indices + doute (boucle) | non | préparé |
| P6-mefiant-controleur | oui | oui (récit de Théo) | non | motif connu | indices + doute (boucle) | non | préparé |
| C1-revelation-au-conseil | non | non | non | oui | non | non | découverte brute |
| C2-castel-cellule | non | non | non | oui | non | non | découverte brute |
| C3-cellule-puis-expedition | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| C4b-theo-ramene-direct | non | partielle | non | rencontrée | non | non | découverte brute |
| C5-radio-sans-mara | non | non | non | rencontrée | non | non | découverte brute |
| C6-promesse-castel | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| C7-vol-antibio | non | non | non | rencontrée | non | non | découverte brute |
| C8-mara-meurt | oui | oui (récit de Théo) | non | oui | boucle seule (doute) | non | préparé |
| C9-vasseur-meurt | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| C10-mara-premiere-fois-en-cellule | non | non | non | rencontrée | non | non | découverte brute |
| C11-theo-signal-rouge | oui | oui (récit de Théo) | non | rencontrée | boucle seule (doute) | non | préparé |
| C12-mere-revelee-au-conseil | non | partielle | non | oui | non | non | découverte brute |
| C13-revelation-puis-cellule | oui | oui (récit de Théo) | non | oui | indices + doute (boucle) | indice | préparé |
| C14-revelation-puis-expulsion | oui | oui (récit de Théo) | non | oui | indices + doute (boucle) | indice | préparé |
