/* ══════════════════════════════════════
   notes.js
   Componente Note Adesive (Sticky Notes)
══════════════════════════════════════ */

import { notes } from './utils.js';

// ── Preset colori e nomi ──────────────────────────────
const NOTE_COLORI = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'];
const NOTE_NOMI   = ['Giallo', 'Verde', 'Azzurro', 'Rosa', 'Viola'];

// ── Render principale ─────────────────────────────────
export function renderNote(root) {
  root.innerHTML = `
    <div class="notes-header">
      <div style="font-family:var(--font-display);font-size:15px;font-weight:700">
        ${notes.value.length} ${notes.value.length === 1 ? 'nota' : 'note'}
      </div>
    </div>
    <div class="notes-grid">
      <div class="add-note-card" id="addNota">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuova nota
      </div>
      ${notes.value.map(_renderCard).join('')}
    </div>`;

  _bindEvents(root);
}

// ── Template singola card ─────────────────────────────
function _renderCard(nota) {
  return `
    <div class="sticky-card" data-id="${nota.id}" style="background:${nota.color}">
      <div class="sticky-toolbar">
        ${NOTE_COLORI.map((c, i) => `
          <div class="note-swatch${c === nota.color ? ' attivo' : ''}"
            style="background:${c}"
            title="${NOTE_NOMI[i]}"
            data-action="color"
            data-id="${nota.id}"
            data-color="${c}">
          </div>`).join('')}
        <button class="note-delete-btn" data-action="delete" data-id="${nota.id}" title="Elimina nota">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <textarea
        class="note-content"
        placeholder="Scrivi qui…"
        data-action="edit"
        data-id="${nota.id}">${nota.text}</textarea>
      <div class="note-timestamp">${nota.ts}</div>
    </div>`;
}

// ── Binding eventi DOM ────────────────────────────────
function _bindEvents(root) {
  // Nuova nota
  root.querySelector('#addNota').addEventListener('click', () => {
    const coloreRandom = NOTE_COLORI[Math.floor(Math.random() * NOTE_COLORI.length)];
    const nuova = {
      id:    Date.now(),
      text:  '',
      color: coloreRandom,
      ts:    new Date().toLocaleDateString('it-IT', {
        day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
      }),
    };
    notes.set([nuova, ...notes.value]);
    renderNote(root);
    // Focus automatico sulla nuova nota
    setTimeout(() => {
      root.querySelector(`[data-id="${nuova.id}"] .note-content`)?.focus();
    }, 50);
  });

  // Elimina / Cambia colore / Modifica testo
  root.querySelectorAll('[data-action]').forEach(el => {
    const id = parseInt(el.dataset.id);

    if (el.dataset.action === 'delete') {
      el.addEventListener('click', () => {
        notes.set(notes.value.filter(n => n.id !== id));
        renderNote(root);
      });

    } else if (el.dataset.action === 'color') {
      el.addEventListener('click', () => {
        notes.set(notes.value.map(n =>
          n.id === id ? { ...n, color: el.dataset.color } : n
        ));
        renderNote(root);
      });

    } else if (el.dataset.action === 'edit') {
      // Salva in tempo reale mentre si scrive
      el.addEventListener('input', () => {
        notes.set(notes.value.map(n =>
          n.id === id ? { ...n, text: el.value } : n
        ));
      });
    }
  });
}
