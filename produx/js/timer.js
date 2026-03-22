/* ══════════════════════════════════════
   timer.js
   Componente Focus Timer (Pomodoro)
══════════════════════════════════════ */

import { timerState } from './utils.js';

// ── Stato locale ──────────────────────────────────────
let timerInterval = null;

// ── Render principale ─────────────────────────────────
export function renderTimer(root) {
  const s      = timerState.value;
  const isMob  = window.innerWidth <= 680;
  const SZ     = isMob ? 180 : 220;
  const R      = isMob ? 78  : 96;
  const circ   = 2 * Math.PI * R;
  const totale = s.mode === 'focus' ? 25 * 60 : 5 * 60;
  const offset = circ * (1 - s.remaining / totale);
  const mm     = String(Math.floor(s.remaining / 60)).padStart(2, '0');
  const ss     = String(s.remaining % 60).padStart(2, '0');
  const isPausa = s.mode === 'break';

  const sessionDots = Array.from({ length: 4 }, (_, i) =>
    `<div class="session-dot${i < s.sessions % 4 ? ' fatto' : ''}"></div>`
  ).join('');

  root.innerHTML = `
    <div class="timer-wrapper">
      <div class="timer-mode-tabs">
        <div class="timer-tab${!isPausa ? ' active' : ''}" data-mode="focus">Focus</div>
        <div class="timer-tab${isPausa  ? ' active' : ''}" data-mode="break">Pausa</div>
      </div>

      <div class="timer-ring-container" style="width:${SZ}px;height:${SZ}px">
        <svg class="timer-svg" width="${SZ}" height="${SZ}" viewBox="0 0 ${SZ} ${SZ}">
          <circle class="timer-track"    cx="${SZ/2}" cy="${SZ/2}" r="${R}"/>
          <circle class="timer-progress${isPausa ? ' pausa' : ''}"
            cx="${SZ/2}" cy="${SZ/2}" r="${R}"
            stroke-dasharray="${circ}"
            stroke-dashoffset="${offset}"/>
        </svg>
        <div class="timer-inner">
          <div class="timer-digits" style="font-size:${isMob ? '38px' : '46px'}">${mm}:${ss}</div>
          <div class="timer-label">${isPausa ? 'PAUSA' : 'FOCUS'}</div>
        </div>
      </div>

      <div class="timer-controls">
        <button class="timer-btn" id="timerReset" title="Ricomincia">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.22"/>
          </svg>
        </button>
        <button class="timer-btn primary-btn" id="timerPlay">
          ${s.running
            ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
               </svg>`
            : `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
               </svg>`}
        </button>
        <button class="timer-btn" id="timerSkip" title="Salta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 4 15 12 5 20 5 4"/>
            <line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      <div class="timer-sessions">
        ${sessionDots}
        <span class="session-label">SESSIONI</span>
      </div>
      <div class="session-count-text">
        Totale completate: <strong>${s.sessions}</strong>
      </div>
    </div>`;

  _bindEvents(root, R);
}

// ── Binding eventi DOM ────────────────────────────────
function _bindEvents(root, R) {
  const circ = 2 * Math.PI * R;

  // Switch Focus / Pausa
  root.querySelectorAll('.timer-tab').forEach(tab =>
    tab.addEventListener('click', () => {
      _stopTimer();
      const m = tab.dataset.mode;
      timerState.set({
        ...timerState.value,
        mode: m,
        running: false,
        remaining: m === 'focus' ? 25 * 60 : 5 * 60,
      });
      renderTimer(root);
    })
  );

  // Play / Pausa
  root.querySelector('#timerPlay').addEventListener('click', () => {
    if (timerState.value.running) {
      _stopTimer();
      timerState.set({ ...timerState.value, running: false });
      renderTimer(root);
    } else {
      timerState.set({ ...timerState.value, running: true });
      _startTimer(root, circ);
      renderTimer(root);
    }
  });

  // Reset
  root.querySelector('#timerReset').addEventListener('click', () => {
    _stopTimer();
    const m = timerState.value.mode;
    timerState.set({ ...timerState.value, running: false, remaining: m === 'focus' ? 25 * 60 : 5 * 60 });
    renderTimer(root);
  });

  // Salta sessione
  root.querySelector('#timerSkip').addEventListener('click', () => {
    _stopTimer();
    const st = timerState.value;
    const nm = st.mode === 'focus' ? 'break' : 'focus';
    timerState.set({
      mode: nm,
      running: false,
      remaining: nm === 'focus' ? 25 * 60 : 5 * 60,
      sessions: st.mode === 'focus' ? st.sessions + 1 : st.sessions,
    });
    renderTimer(root);
  });
}

// ── Avvia il countdown ────────────────────────────────
function _startTimer(root, circ) {
  timerInterval = setInterval(() => {
    const st = timerState.value;

    if (st.remaining <= 0) {
      _stopTimer();
      const nm = st.mode === 'focus' ? 'break' : 'focus';
      timerState.set({
        mode: nm,
        running: false,
        remaining: nm === 'focus' ? 25 * 60 : 5 * 60,
        sessions: st.mode === 'focus' ? st.sessions + 1 : st.sessions,
      });
      renderTimer(root);
      return;
    }

    timerState.set({ ...st, remaining: st.remaining - 1 });
    const tv = timerState.value;

    // Aggiornamento in-place (evita re-render completo ogni secondo)
    const digEl = root.querySelector('.timer-digits');
    if (digEl) {
      digEl.textContent =
        `${String(Math.floor(tv.remaining / 60)).padStart(2,'0')}:${String(tv.remaining % 60).padStart(2,'0')}`;
    }
    const progEl = root.querySelector('.timer-progress');
    if (progEl) {
      const totale = st.mode === 'focus' ? 25 * 60 : 5 * 60;
      progEl.style.strokeDashoffset = circ * (1 - tv.remaining / totale);
    }
  }, 1000);
}

// ── Ferma il countdown ────────────────────────────────
function _stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}
