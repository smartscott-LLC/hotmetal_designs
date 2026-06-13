/* ============================================================
   SmarTools HTML Studio — SmartBar Module
   Ctrl+K command palette:
   - Templates
   - Snippets
   - File operations
   - App actions
   ============================================================ */

import { TEMPLATES } from './templates.js';
import { SNIPPETS, searchSnippets } from './snippets.js';

const ACTIONS = [
  { id: 'new-file',      label: 'New File',          description: 'Clear editor and start fresh',        icon: '📄', tag: 'file'    },
  { id: 'save-file',     label: 'Save to Vault',      description: 'Save current project to OPFS',        icon: '💾', tag: 'file'    },
  { id: 'load-file',     label: 'Load from Vault',    description: 'Load a saved project',                icon: '📂', tag: 'file'    },
  { id: 'export-html',   label: 'Export HTML',        description: 'Download as standalone HTML file',    icon: '📤', tag: 'export'  },
  { id: 'refresh-preview', label: 'Refresh Preview',  description: 'Force-refresh the live preview',      icon: '↻',  tag: 'view'    },
];

/** @type {HTMLElement} */
let _overlay = null;
/** @type {HTMLInputElement} */
let _input = null;
/** @type {HTMLElement} */
let _resultsList = null;

let _selectedIndex = 0;
let _flatItems = [];

/** @type {Function} */
let _onAction = null;
/** @type {Function} */
let _onTemplate = null;
/** @type {Function} */
let _onSnippet = null;
/** @type {Function|null} */
let _getRecentFiles = null;
/** @type {Function|null} */
let _onRecentFile = null;

/* ── Initialise ─────────────────────────────────────────────── */
/**
 * @param {{
 *   overlay: HTMLElement,
 *   input: HTMLInputElement,
 *   results: HTMLElement,
 *   onAction: (actionId: string) => void,
 *   onTemplate: (template: object) => void,
 *   onSnippet: (snippet: object) => void,
 *   getRecentFiles?: () => string[],
 *   onRecentFile?: (name: string) => void,
 * }} options
 */
export function initSmartBar({ overlay, input, results, onAction, onTemplate, onSnippet, getRecentFiles, onRecentFile }) {
  _overlay = overlay;
  _input = input;
  _resultsList = results;
  _onAction = onAction;
  _onTemplate = onTemplate;
  _onSnippet = onSnippet;
  _getRecentFiles = getRecentFiles || null;
  _onRecentFile = onRecentFile || null;

  _overlay.addEventListener('click', (e) => {
    if (e.target === _overlay) closeSmartBar();
  });

  _input.addEventListener('input', () => {
    _selectedIndex = 0;
    _render(_input.value.trim());
  });

  _input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        _selectedIndex = Math.min(_selectedIndex + 1, _flatItems.length - 1);
        _updateSelected();
        break;
      case 'ArrowUp':
        e.preventDefault();
        _selectedIndex = Math.max(_selectedIndex - 1, 0);
        _updateSelected();
        break;
      case 'Enter':
        e.preventDefault();
        _activateSelected();
        break;
      case 'Escape':
        e.preventDefault();
        closeSmartBar();
        break;
    }
  });
}

/* ── Open / Close ───────────────────────────────────────────── */
export function openSmartBar() {
  if (!_overlay) return;
  _overlay.hidden = false;
  _input.value = '';
  _selectedIndex = 0;
  _render('');
  setTimeout(() => _input.focus(), 50);
}

export function closeSmartBar() {
  if (!_overlay) return;
  _overlay.hidden = true;
}

/* ── Render results ─────────────────────────────────────────── */
function _render(query) {
  _flatItems = [];
  const parts = [];

  // Actions
  const filteredActions = query
    ? ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.tag.includes(query.toLowerCase()))
    : ACTIONS;

  if (filteredActions.length) {
    parts.push(_sectionHeader('Actions'));
    filteredActions.forEach(a => {
      _flatItems.push({ type: 'action', data: a });
      parts.push(_item(_flatItems.length - 1, a.icon, a.label, a.description, a.tag));
    });
  }

  // Templates
  const filteredTemplates = query
    ? TEMPLATES.filter(t => t.label.toLowerCase().includes(query.toLowerCase()) || t.category.includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
    : TEMPLATES;

  if (filteredTemplates.length) {
    parts.push(_sectionHeader('Templates'));
    filteredTemplates.forEach(t => {
      _flatItems.push({ type: 'template', data: t });
      parts.push(_item(_flatItems.length - 1, t.icon, t.label, t.description, t.category));
    });
  }

  // Snippets
  const filteredSnippets = query ? searchSnippets(query) : SNIPPETS;
  if (filteredSnippets.length) {
    parts.push(_sectionHeader('Snippets'));
    filteredSnippets.slice(0, 15).forEach(s => {
      _flatItems.push({ type: 'snippet', data: s });
      parts.push(_item(_flatItems.length - 1, s.icon, s.label, s.description, s.tag));
    });
  }

  // Recent files
  if (_getRecentFiles) {
    const recent = _getRecentFiles();
    if (recent.length) {
      parts.push(_sectionHeader('Recent Files'));
      recent.forEach(name => {
        _flatItems.push({ type: 'recent', data: name });
        parts.push(_item(_flatItems.length - 1, '📄', name, 'Open this file', 'recent'));
      });
    }
  }

  _resultsList.innerHTML = parts.join('');
  _updateSelected();

  // Click handlers
  _resultsList.querySelectorAll('.sb-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10);
      _selectedIndex = idx;
      _activateSelected();
    });
  });
}

function _sectionHeader(label) {
  return `<div class="sb-section-header">${_esc(label)}</div>`;
}

function _item(idx, icon, label, desc, tag) {
  return `
    <div class="sb-item" data-idx="${idx}">
      <div class="sb-item-icon">${icon}</div>
      <div class="sb-item-content">
        <div class="sb-item-label">${_esc(label)}</div>
        <div class="sb-item-desc">${_esc(desc)}</div>
      </div>
      <span class="sb-item-tag">${_esc(tag)}</span>
    </div>`;
}

function _updateSelected() {
  const items = _resultsList.querySelectorAll('.sb-item');
  items.forEach((el, i) => {
    el.classList.toggle('sb-selected', i === _selectedIndex);
  });
  // Scroll selected into view
  if (items[_selectedIndex]) {
    items[_selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

function _activateSelected() {
  const item = _flatItems[_selectedIndex];
  if (!item) return;

  switch (item.type) {
    case 'action':
      if (_onAction) _onAction(item.data.id);
      break;
    case 'template':
      if (_onTemplate) _onTemplate(item.data);
      break;
    case 'snippet':
      if (_onSnippet) _onSnippet(item.data);
      break;
    case 'recent':
      if (_onRecentFile) _onRecentFile(item.data);
      break;
  }
}

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
