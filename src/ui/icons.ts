// Icônes SVG minimalistes (traits), pour ne dépendre d'aucune police de symboles.
const S = (body: string, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${body}</svg>`;

export const ICON = {
  carnet: S('<path d="M5 3h12l2 2v16H5z"/><path d="M9 3v18"/><path d="M12 8h4M12 12h4"/>'),
  sac: S('<path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  train: S('<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M8 21l2-4M16 21l-2-4"/><circle cx="8" cy="14" r="0.5"/><circle cx="16" cy="14" r="0.5"/>'),
  menu: S('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  wait: S('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/>', 14),
  health: S('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>', 11),
  water: S('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>', 11),
  food: S('<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>', 11),
  rest: S('<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>', 11),
  token: S('<circle cx="12" cy="12" r="8"/><path d="M12 8l3 4-3 4-3-4z"/>', 13),
  back: S('<path d="M15 5l-7 7 7 7"/>', 14),
  skip: S('<path d="M5 5l7 7-7 7M12 5l7 7-7 7"/>', 14),
  close: S('<path d="M6 6l12 12M18 6L6 18"/>', 14),
};

export function icon(name: keyof typeof ICON): HTMLElement {
  const s = document.createElement('span');
  s.className = 'ico';
  s.innerHTML = ICON[name];
  return s;
}
