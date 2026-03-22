/* ══════════════════════════════════════
   todo.js
   Componente Attività (Todo List)
══════════════════════════════════════ */

import { todos } from './utils.js';

// ── Mappa colori priorità ─────────────────────────────
const PRIORITA = {
  alta:  '#f87171',
  media: '#f97316',
  bassa: '#34d399',
};

// ── Render principale ─────────────────────────────────
export function renderTodo(root) {
  const attivi = todos.value.filter(t => !t.done);
  const fatti  = todos.value.filter(t =>  t.done);

  root.innerHTML = `
    <div class="todo-add-row">
      <input class="todo-input" id="todoInput" placeholder="Aggiungi un'attività…" />
      <select id="todoPri" class="todo-select">
        <option value="alta">Alta</option>
        <option value="media" selected>Media</option>
        <option value="bassa">Bassa</option>
      </select>
      <button class="btn-primary" id="addTodo">Aggiungi</button>
    </div>

    <div class="todo-section-label">
      In corso <span class="todo-count-badge">${attivi.length}</span>
    </div>
    <div class="todo-list" id="listaAttivi">
      ${attivi.length
        ? _renderLista(attivi)
        : '<div class="todo-empty">Nessuna attività attiva 🎉</div>'}
    </div>

    <div class="todo-section-label" style="margin-top:4px">
      Completate <span class="todo-count-badge">${fatti.length}</span>
    </div>
    <div class="todo-list" id="listaFatte">
      ${fatti.length
        ? _renderLista(fatti)
        : '<div class="todo-empty">Nessuna attività completata ancora</div>'}
    </div>`;

  _bindEvents(root);
}

// ── Template singolo task ─────────────────────────────
function _renderLista(items) {
  return items.map(t => `
    <div class="todo-item${t.done ? ' completato' : ''}" data-id="${t.id}">
      <button class="todo-check${t.done ? ' checked' : ''}" data-action="toggle" data-id="${t.id}">
        ${t.done
          ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
             </svg>`
          : ''}
      </button>
      <div class="todo-priority" style="background:${PRIORITA[t.priority || 'media']}"></div>
      <span class="todo-text${t.done ? ' barrato' : ''}">${_escHtml(t.text)}</span>
      <button class="todo-delete" data-action="delete" data-id="${t.id}" title="Elimina">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');
}

// ── Binding eventi DOM ────────────────────────────────
function _bindEvents(root) {
  // Aggiungi task
  const addTask = () => {
    const inp = root.querySelector('#todoInput');
    const pri = root.querySelector('#todoPri').value;
    const txt = inp.value.trim();
    if (!txt) return;
    todos.set([...todos.value, {
      id: Date.now(),
      text: txt,
      done: false,
      priority: pri,
    }]);
    inp.value = '';
    renderTodo(root);
  };

  root.querySelector('#addTodo').addEventListener('click', addTask);
  root.querySelector('#todoInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Toggle completato / Elimina
  root.querySelectorAll('[data-action]').forEach(el =>
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      if (el.dataset.action === 'toggle') {
        todos.set(todos.value.map(t => t.id === id ? { ...t, done: !t.done } : t));
      } else if (el.dataset.action === 'delete') {
        todos.set(todos.value.filter(t => t.id !== id));
      }
      renderTodo(root);
    })
  );
}

// ── Sanitizza HTML nei testi utente ──────────────────
function _escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
