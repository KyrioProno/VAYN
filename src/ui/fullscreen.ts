// Plein écran du navigateur.
// Disponible sur Android et sur ordinateur. Pas sur iPhone : Safari ne l'autorise que pour la vidéo
// (sur iPhone, « Ajouter à l'écran d'accueil » ouvre le jeu sans la barre d'adresse).
// Dans l'application native (Capacitor), le jeu occupe déjà tout l'écran.
import { btn } from './dom';

type FsDoc = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type Orient = { lock?: (o: string) => Promise<void> };

export function canFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

export function isFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

/** Bascule le plein écran. Renvoie l'état obtenu (jamais d'exception). */
export async function toggleFullscreen(): Promise<boolean> {
  const d = document as FsDoc;
  try {
    if (isFullscreen()) {
      if (d.exitFullscreen) await d.exitFullscreen();
      else await d.webkitExitFullscreen?.();
      return false;
    }
    const el = document.documentElement as FsEl;
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else await el.webkitRequestFullscreen?.();
    // Sur Android, le verrouillage en paysage n'est accepté qu'en plein écran.
    const o = (screen as unknown as { orientation?: Orient }).orientation;
    await o?.lock?.('landscape').catch(() => undefined);
  } catch {
    // Refus du navigateur (iframe sans autorisation, geste non reconnu…) : on reste tel quel.
  }
  return isFullscreen();
}

export function fullscreenLabel(): string {
  return isFullscreen() ? 'Quitter le plein écran' : 'Plein écran';
}

/** Bouton « Plein écran » qui suit l'état réel ; null si le navigateur ne le permet pas. */
export function fullscreenButton(cls = 'btn'): HTMLButtonElement | null {
  if (!canFullscreen()) return null;
  const b = btn(fullscreenLabel(), () => {
    void toggleFullscreen().then(() => { b.textContent = fullscreenLabel(); });
  }, cls);
  const sync = () => {
    if (!b.isConnected) {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
      return;
    }
    b.textContent = fullscreenLabel();
  };
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  return b;
}
