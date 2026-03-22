/* ══════════════════════════════════════
   utils.js
   Logica condivisa: Storage, Signals, Dark Mode, Orologio
══════════════════════════════════════ */

// ── LocalStorage wrapper ──────────────────────────────
export const Store = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem('produx_' + key)); }
    catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem('produx_' + key, JSON.stringify(value)); }
    catch { /* storage pieno o privato */ }
  },
};

// ── Signal (reattività minimalista) ──────────────────
export function signal(initialValue) {
  let _value = initialValue;
  const listeners = new Set();
  return {
    get value() { return _value; },
    set(newValue) {
      _value = newValue;
      listeners.forEach(fn => fn(newValue));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn); // unsubscribe
    },
  };
}

// ── Stato globale condiviso ───────────────────────────
export const darkMode = signal(Store.get('darkMode') ?? true);
export const events   = signal(Store.get('events')   ?? {});
export const todos    = signal(Store.get('todos')    ?? []);
export const notes    = signal(Store.get('notes')    ?? []);
export const timerState = signal({
  mode: 'focus',
  running: false,
  remaining: 25 * 60,
  sessions: 0,
});

// Persistenza automatica sui cambiamenti
events.subscribe(v => Store.set('events', v));
todos.subscribe(v  => Store.set('todos', v));
notes.subscribe(v  => Store.set('notes', v));
darkMode.subscribe(v => {
  Store.set('darkMode', v);
  document.documentElement.classList.toggle('dark', v);
  document.documentElement.classList.toggle('light', !v);
  // Sincronizza tutti i toggle presenti nella pagina
  document.querySelectorAll('.toggle-dark').forEach(btn =>
    btn.classList.toggle('on', v)
  );
});

// ── Inizializza Dark Mode ─────────────────────────────
export function initDarkMode() {
  document.documentElement.classList.toggle('dark', darkMode.value);
  document.documentElement.classList.toggle('light', !darkMode.value);

  document.querySelectorAll('.toggle-dark').forEach(btn => {
    btn.classList.toggle('on', darkMode.value);
    btn.addEventListener('click', () => darkMode.set(!darkMode.value));
  });
}

// ── Orologio ─────────────────────────────────────────
export function initClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;

  const aggiorna = () => {
    clockEl.textContent = new Date().toLocaleTimeString('it-IT', {
      hour: '2-digit', minute: '2-digit'
    });
  };
  aggiorna();
  setInterval(aggiorna, 1000);
}

// ── Helper: chiave data YYYY-MM-DD ────────────────────
export function chiaveData(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Costanti condivise ────────────────────────────────
export const MESI = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
];
export const GIORNI_BREVI = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
