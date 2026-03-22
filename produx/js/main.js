/* ══════════════════════════════════════
   main.js
   Entry point — Router + Panoramica
══════════════════════════════════════ */

import { initDarkMode, initClock, todos, notes, events, timerState, chiaveData } from './utils.js';
import { renderCalendar } from './calendar.js';
import { renderTimer }    from './timer.js';
import { renderTodo }     from './todo.js';
import { renderNote }     from './notes.js';

// ══════════════════════════════════════
// INIZIALIZZAZIONE
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initClock();
  _impostaData();
  _initRouter();
  naviga('overview');
});

// ══════════════════════════════════════
// ROUTER
// ══════════════════════════════════════
const VISTE = {
  overview: { titolo: 'Panoramica',  render: renderOverview },
  calendar: { titolo: 'Calendario',  render: renderCalendar },
  timer:    { titolo: 'Timer Focus', render: renderTimer },
  todo:     { titolo: 'Attività',    render: renderTodo },
  notes:    { titolo: 'Note',        render: renderNote },
};

export function naviga(view) {
  // Aggiorna nav attiva — sidebar desktop + bottom nav mobile
  document.querySelectorAll('[data-view]').forEach(el =>
    el.classList.toggle('active', el.dataset.view === view)
  );

  // Aggiorna titoli
  const titolo = VISTE[view]?.titolo ?? view;
  const topbarTitle = document.getElementById('topbarTitle');
  const mobTitle    = document.getElementById('mobTitle');
  if (topbarTitle) topbarTitle.textContent = titolo;
  if (mobTitle)    mobTitle.textContent    = titolo;

  // Monta il componente
  const area = document.getElementById('contentArea');
  if (!area) return;
  area.innerHTML = '';
  VISTE[view]?.render(area);
}

function _initRouter() {
  document.querySelectorAll('[data-view]').forEach(el =>
    el.addEventListener('click', () => naviga(el.dataset.view))
  );
}

// ══════════════════════════════════════
// DATA NELLA TOPBAR
// ══════════════════════════════════════
function _impostaData() {
  const el = document.getElementById('topbarDate');
  if (el) {
    el.textContent = new Date().toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}

// ══════════════════════════════════════
// PANORAMICA
// ══════════════════════════════════════
function renderOverview(root) {
  const attivi   = todos.value.filter(t => !t.done).length;
  const fatti    = todos.value.filter(t =>  t.done).length;
  const nNote    = notes.value.length;
  const oggiK    = chiaveData(new Date());
  const evOggi   = (events.value[oggiK] || []).length;
  const sessioni = timerState.value.sessions;

  root.innerHTML = `
    <div class="overview-grid">
      <div class="stat-card">
        <div class="stat-label">Attività attive</div>
        <div class="stat-value" style="color:var(--accent)">${attivi}</div>
        <div class="stat-sub">${fatti} completate</div>
        <svg class="stat-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      </div>
      <div class="stat-card">
        <div class="stat-label">Eventi di oggi</div>
        <div class="stat-value" style="color:var(--blue)">${evOggi}</div>
        <div class="stat-sub">programmati oggi</div>
        <svg class="stat-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <div class="stat-card">
        <div class="stat-label">Note salvate</div>
        <div class="stat-value" style="color:var(--purple)">${nNote}</div>
        <div class="stat-sub">promemoria attivi</div>
        <svg class="stat-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessioni Pomodoro</div>
        <div class="stat-value" style="color:var(--green)">${sessioni}</div>
        <div class="stat-sub">completate oggi</div>
        <svg class="stat-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:18px">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px">
        Accesso rapido
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${[['calendar','Calendario'],['timer','Timer Focus'],['todo','Attività'],['notes','Note']]
          .map(([v, n]) => `
            <button
              data-quick="${v}"
              style="background:var(--bg-surface);border:1px solid var(--border);border-radius:6px;
                     padding:10px 16px;font-size:12px;color:var(--text-secondary);
                     font-family:var(--font-mono);cursor:pointer;transition:.18s"
              onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
              onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-secondary)'">
              ${n} →
            </button>`).join('')}
      </div>
    </div>`;

  // Accesso rapido: usa naviga() invece di inline onclick
  root.querySelectorAll('[data-quick]').forEach(btn =>
    btn.addEventListener('click', () => naviga(btn.dataset.quick))
  );
}
