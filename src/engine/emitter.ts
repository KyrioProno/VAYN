export type Listener<T = any> = (payload: T) => void;

/** Petit bus d'événements typé de manière souple. */
export class Emitter {
  private listeners = new Map<string, Set<Listener>>();

  on<T = any>(ev: string, fn: Listener<T>): () => void {
    let set = this.listeners.get(ev);
    if (!set) {
      set = new Set();
      this.listeners.set(ev, set);
    }
    set.add(fn as Listener);
    return () => set!.delete(fn as Listener);
  }

  emit<T = any>(ev: string, payload?: T): void {
    const set = this.listeners.get(ev);
    if (set) for (const fn of [...set]) fn(payload);
    const all = this.listeners.get('*');
    if (all && ev !== '*') for (const fn of [...all]) fn({ ev, payload });
  }

  clearListeners(): void {
    this.listeners.clear();
  }
}
