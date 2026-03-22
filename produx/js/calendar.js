/* ══════════════════════════════════════
   calendar.js
   Componente Calendario con gestione eventi
══════════════════════════════════════ */

import { events, chiaveData, MESI, GIORNI_BREVI } from './utils.js';

// ── Stato locale del calendario ───────────────────────
let calData         = new Date();
let dataSelezionata = null;
let coloreEvento    = '#f97316';

// ── Render principale ─────────────────────────────────
export function renderCalendar(root) {
  const anno = calData.getFullYear();
  const mese = calData.getMonth();
  const oggi = new Date();
  const oggiK = chiaveData(oggi);
  const selK  = dataSelezionata ? chiaveData(dataSelezionata) : null;

  // Calcola celle della griglia
  let inizioSett = new Date(anno, mese, 1).getDay();
  inizioSett = inizioSett === 0 ? 6 : inizioSett - 1; // Lunedì = 0
  const giorniMese = new Date(anno, mese + 1, 0).getDate();
  const giorniPrec = new Date(anno, mese, 0).getDate();

  const celle = [];
  for (let i = inizioSett - 1; i >= 0; i--)
    celle.push({ g: giorniPrec - i, altro: true, d: new Date(anno, mese - 1, giorniPrec - i) });
  for (let d = 1; d <= giorniMese; d++)
    celle.push({ g: d, altro: false, d: new Date(anno, mese, d) });
  while (celle.length % 7 !== 0)
    celle.push({ g: celle.length - giorniMese - inizioSett + 1, altro: true, d: null });

  const evMap   = events.value;
  const colori  = ['#f97316','#60a5fa','#34d399','#f87171','#a78bfa'];
  const selEvts = selK && evMap[selK] ? evMap[selK] : [];

  root.innerHTML = `
    <div class="cal-header">
      <button class="cal-nav-btn" id="prevMese">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="cal-month-label">${MESI[mese]} ${anno}</div>
      <button class="cal-nav-btn" id="nextMese">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div class="cal-grid">
      ${GIORNI_BREVI.map(g => `<div class="cal-day-label">${g}</div>`).join('')}
      ${celle.map(c => {
        const k    = c.d ? chiaveData(c.d) : null;
        const evts = k && evMap[k] ? evMap[k] : [];
        const dots = evts.slice(0, 3).map(e =>
          `<div class="event-dot" style="background:${e.color}"></div>`).join('');
        return `
          <div class="cal-cell
            ${c.altro ? 'altro-mese' : ''}
            ${k === oggiK ? 'oggi' : ''}
            ${k === selK  ? 'selezionato' : ''}"
            data-date="${c.d ? c.d.toISOString() : ''}">
            <span class="cal-day-num">${c.g}</span>
            ${dots}
          </div>`;
      }).join('')}
    </div>

    <div class="event-panel">
      <div class="event-panel-title">
        ${selK
          ? `eventi del ${dataSelezionata.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}`
          : 'seleziona un giorno'}
      </div>
      ${selK ? `
        <div class="event-list">
          ${selEvts.length
            ? selEvts.map((e, i) => `
              <div class="event-item">
                <div class="event-color-dot" style="background:${e.color}"></div>
                <span class="event-item-text">${e.text}</span>
                <button class="event-delete" data-idx="${i}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>`).join('')
            : '<div style="font-size:12px;color:var(--text-muted)">Nessun evento. Aggiungine uno.</div>'}
        </div>
        <div class="event-add-row">
          <input class="event-input" id="evtInput" placeholder="Nuovo evento…" />
          <div class="color-picker">
            ${colori.map(col => `
              <div class="color-swatch${col === coloreEvento ? ' sel' : ''}"
                style="background:${col}" data-col="${col}"></div>`).join('')}
          </div>
          <button class="btn-primary" id="addEvtBtn">Aggiungi</button>
        </div>`
      : '<div style="font-size:12px;color:var(--text-muted)">Clicca su un giorno per gestire gli eventi.</div>'}
    </div>`;

  _bindEvents(root, selK);
}

// ── Binding eventi DOM ────────────────────────────────
function _bindEvents(root, selK) {
  // Navigazione mese
  root.querySelector('#prevMese')?.addEventListener('click', () => {
    calData = new Date(calData.getFullYear(), calData.getMonth() - 1, 1);
    renderCalendar(root);
  });
  root.querySelector('#nextMese')?.addEventListener('click', () => {
    calData = new Date(calData.getFullYear(), calData.getMonth() + 1, 1);
    renderCalendar(root);
  });

  // Selezione giorno
  root.querySelectorAll('.cal-cell').forEach(el =>
    el.addEventListener('click', () => {
      if (!el.dataset.date) return;
      dataSelezionata = new Date(el.dataset.date);
      renderCalendar(root);
    })
  );

  // Selezione colore
  root.querySelectorAll('.color-swatch').forEach(sw =>
    sw.addEventListener('click', () => {
      coloreEvento = sw.dataset.col;
      renderCalendar(root);
    })
  );

  // Aggiungi evento
  const addBtn  = root.querySelector('#addEvtBtn');
  const evtInput = root.querySelector('#evtInput');

  const aggiungiEvento = () => {
    const txt = evtInput?.value.trim();
    if (!txt || !selK) return;
    const cur = { ...events.value };
    cur[selK] = [...(cur[selK] || []), { text: txt, color: coloreEvento }];
    events.set(cur);
    renderCalendar(root);
  };

  addBtn?.addEventListener('click', aggiungiEvento);
  evtInput?.addEventListener('keydown', e => { if (e.key === 'Enter') aggiungiEvento(); });

  // Elimina evento
  root.querySelectorAll('.event-delete').forEach(btn =>
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const cur = { ...events.value };
      cur[selK] = cur[selK].filter((_, i) => i !== idx);
      events.set(cur);
      renderCalendar(root);
    })
  );
}
