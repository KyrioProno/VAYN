import './ui/styles.css';
import { App } from './app/App';

const app = new App();
(window as unknown as { vayn: App }).vayn = app;
app.boot().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;inset:0;z-index:999;color:#f88;background:#000;padding:20px;white-space:pre-wrap">Erreur au démarrage :\n${String(e?.stack ?? e)}</pre>`);
});
