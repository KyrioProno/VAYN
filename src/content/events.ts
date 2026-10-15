import type { ScriptedEventDef, TimedEventDef } from '../engine/types';

export const TIMED: TimedEventDef[] = [
  // --- Repas
  { id: 'repas_matin', at: 'd1@08:00', fx: ['set:repas=matin', 'toast:La cantine sert le petit-déjeuner jusqu’à 09:30.'] },
  { id: 'repas_matin_fin', at: 'd1@09:30', fx: ['clr:repas'] },
  { id: 'repas_midi', at: 'd1@12:00', fx: ['set:repas=midi', 'toast:Déjeuner servi à la cantine jusqu’à 13:30.'] },
  { id: 'repas_midi_fin', at: 'd1@13:30', fx: ['clr:repas'] },
  { id: 'repas_soir', at: 'd1@19:00', fx: ['set:repas=soir', 'toast:Dîner servi à la cantine jusqu’à 20:30.'] },
  { id: 'repas_soir_fin', at: 'd1@20:30', fx: ['clr:repas'] },
  { id: 'repas_midi2', at: 'd2@12:30', if: 'zone:train', fx: ['set:repas=midi2', 'toast:Rosa sert un déjeuner de départ.'] },
  { id: 'repas_midi2_fin', at: 'd2@14:00', fx: ['clr:repas'] },
  // --- Jour 1
  { id: 'aide_machines', at: 'd1@10:15', if: '!e:c_alarmes', fx: ['toast:La voiture des machines, en tête du train, garde peut-être la mémoire de la panne.'] },
  { id: 'rosa_soute', at: 'd1@11:00', if: 'door:d_cage=locked', fx: ['unlock:d_cage', 'set:grille_rosa', 'toast:Rosa descend à la soute : la grille de la réserve reste ouverte jusqu’à 11:30.'] },
  { id: 'rosa_soute_fin', at: 'd1@11:30', if: 'f:grille_rosa & !has:cle_reserve', fx: ['ev:rosa_ferme'] },
  { id: 'aide_theo', at: 'd1@13:00', if: '!e:t_noe_saut & !e:c_carnet_theo & !e:t_castel_version', fx: ['toast:Quelqu’un a forcément vu Théo cette nuit. Les dortoirs ne dorment jamais vraiment.'] },
  { id: 'annonce_fouille', at: 'd1@15:30', if: '!f:mara_libre', fx: ['warn:Castel annonce une fouille de la soute à 16:00.'] },
  { id: 'fouille_capture', at: 'd1@16:00', if: '!f:mara_libre & !f:mara_cachee_ailleurs & !f:fouille_detournee', fx: ['set:mara_capturee', 'set:cache_ouverte', 'met:mara', 'conseq:cq_mara_capturee', 'warn:Castel a trouvé une clandestine dans la soute ! Elle est en cellule.'] },
  { id: 'fouille_vide', at: 'd1@16:00', if: 'f:mara_cachee_ailleurs | f:fouille_detournee', fx: ['toast:La fouille de Castel ne donne rien. Il en est vert de rage.'] },
  { id: 'fouille_sorel', at: 'd1@16:00', if: 'f:mara_libre', fx: ['toast:Castel fouille la soute pour la forme : la fille de la docteure est sous sa protection.'] },
  { id: 'rappel_conseil', at: 'd1@16:30', fx: ['warn:Le conseil des quatre se réunit à 17:00 à la cantine.'] },
  { id: 'conseil', at: 'd1@17:00', fx: ['ev:conseil'] },
  { id: 'soir_radio', at: 'd1@21:00', if: 'e:c_relais_radio & !f:k3_retire_radio', fx: ['toast:21:00. L’heure de Clairval, d’après Mara. La radio est en salle radio.'] },
  { id: 'soir', at: 'd1@21:30', fx: ['toast:La nuit tombe sur Saint-Aubin. L’expédition part à l’aube : il faudra dormir.'] },
  { id: 'couvre_feu', at: 'd1@23:45', if: '!f:dort', fx: ['ev:couvre_feu'] },
  // --- Jour 2
  { id: 'reveil', at: 'd2@05:30', fx: ['ev:reveil'] },
  { id: 'brume', at: 'd2@10:00', if: 'zone:exterior', fx: ['warn:La brume monte depuis la vallée, à l’est. Elle avance vers la gare.'] },
  { id: 'sirene1', at: 'd2@11:00', fx: ['sfx:horn', 'warn:Sirène du VAYN : départ dans une heure.'] },
  { id: 'sirene2', at: 'd2@11:30', fx: ['sfx:horn', 'warn:Deuxième sirène : départ dans trente minutes.'] },
  { id: 'sirene3', at: 'd2@11:50', fx: ['sfx:horn', 'warn:Dernier appel ! Le VAYN part dans dix minutes.'] },
  { id: 'depart', at: 'd2@12:00', fx: ['ev:depart_train'] },
  { id: 'assemblee', at: 'd2@15:00', if: 'zone:train', fx: ['ev:assemblee'] },
];

export const SCRIPTED: Record<string, ScriptedEventDef> = {
  conseil: { id: 'conseil', ui: 'council' },
  rosa_ferme: { id: 'rosa_ferme', ui: 'rosa_lock' },
  couvre_feu: { id: 'couvre_feu', ui: 'forced_sleep' },
  reveil: { id: 'reveil', ui: 'expedition_prep' },
  expedition_depart: { id: 'expedition_depart', fx: ['obj:q_main.dormir'] },
  depart_train: { id: 'depart_train', ui: 'departure' },
  assemblee: { id: 'assemblee', ui: 'assembly' },
  fin: { id: 'fin', ui: 'ending' },
};
