/* ============================================================
   SmarTools HTML Studio — Main App Module
   Orchestrates all modules, handles global keyboard shortcuts,
   and manages top-level UI state.
   ============================================================ */

import { createEditor } from './editor.js';
import { initPreview, renderPreview } from './preview.js';
import { initSmartBar, openSmartBar, closeSmartBar } from './smartbar.js';
import { initVault, isVaultAvailable, listFiles, saveFile, loadFile, deleteFile, getLastOpenedFile, setLastOpenedFile, getRecentFiles, addRecentFile } from './vault.js';
import { initAIAssistant } from './ai-assistant.js';
import { initThemer } from './themer.js';
import { initImagePanel } from './image-panel.js';
import { TEMPLATES } from './templates.js';
import { SNIPPETS } from './snippets.js';

/* ── State ──────────────────────────────────────────────────── */
const state = {
  currentFile: null,
  isDirty: false,
  vaultAvailable: false,
  activeTab: 'html',
};

/* ── DOM refs ────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

/* ── Tab State ───────────────────────────────────────────────── */
const tabContents = {
  html: '',
  css: '',
  js: '',
};

/* ── Undo/Redo History (50 steps per tab) ───────────────────── */
const MAX_HISTORY = 50;
const history = {
  html: { stack: [], index: -1, lastContent: '' },
  css:  { stack: [], index: -1, lastContent: '' },
  js:   { stack: [], index: -1, lastContent: '' },
};

function _pushHistory(tab, content) {
  const h = history[tab];
  // Don't push if content hasn't changed
  if (content === h.lastContent) return;
  // Remove any redo states
  h.stack = h.stack.slice(0, h.index + 1);
  // Push new state
  h.stack.push(content);
  // Enforce max size
  if (h.stack.length > MAX_HISTORY) {
    h.stack.shift();
  }
  h.index = h.stack.length - 1;
  h.lastContent = content;
  _updateUndoRedoButtons();
}

function _undo() {
  const tab = state.activeTab;
  const h = history[tab];
  if (h.index <= 0) return;
  h.index--;
  const content = h.stack[h.index];
  h.lastContent = content;
  // Temporarily remove change listener to avoid pushing to history
  editor.off('change', handleEditorChange);
  editor.setValue(content);
  editor.on('change', handleEditorChange);
  tabContents[tab] = content;
  renderPreview(tabContents.html, tabContents.css, tabContents.js);
  _updateUndoRedoButtons();
}

function _redo() {
  const tab = state.activeTab;
  const h = history[tab];
  if (h.index >= h.stack.length - 1) return;
  h.index++;
  const content = h.stack[h.index];
  h.lastContent = content;
  editor.off('change', handleEditorChange);
  editor.setValue(content);
  editor.on('change', handleEditorChange);
  tabContents[tab] = content;
  renderPreview(tabContents.html, tabContents.css, tabContents.js);
  _updateUndoRedoButtons();
}

function _updateUndoRedoButtons() {
  const tab = state.activeTab;
  const h = history[tab];
  const undoBtn = $('btn-undo');
  const redoBtn = $('btn-redo');
  if (undoBtn) undoBtn.disabled = h.index <= 0;
  if (redoBtn) redoBtn.disabled = h.index >= h.stack.length - 1;
}

/* ── Editor ─────────────────────────────────────────────────── */
let editor = null;

function initEditor() {
  const container = $('editor-container');
  editor = createEditor(container, {
    mode: 'htmlmixed',
    onChange: handleEditorChange,
    debounceMs: 300,
  });

  // Load last-session content
  const saved = localStorage.getItem('htmlstudio-content-html');
  const savedCss = localStorage.getItem('htmlstudio-content-css');
  const savedJs = localStorage.getItem('htmlstudio-content-js');

  tabContents.html = saved || TEMPLATES.find(t => t.id === 'blank').code;
  tabContents.css = savedCss || '';
  tabContents.js = savedJs || '';

  editor.setValue(tabContents.html);
  updateCursorPos();

  // Seed initial history for all tabs
  history.html.lastContent = tabContents.html;
  history.html.stack = [tabContents.html];
  history.html.index = 0;
  history.css.lastContent = tabContents.css;
  history.css.stack = [tabContents.css];
  history.css.index = 0;
  history.js.lastContent = tabContents.js;
  history.js.stack = [tabContents.js];
  history.js.index = 0;
  _updateUndoRedoButtons();
}

function switchTab(tabName) {
  // Save current tab content
  if (editor) {
    tabContents[state.activeTab] = editor.getValue();
  }

  state.activeTab = tabName;

  // Update tab UI
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('tab-active', t.dataset.tab === tabName);
  });

  // Update pane label
  $('pane-label').textContent = tabName.toUpperCase();

  // Switch editor mode and content
  const modeMap = { html: 'htmlmixed', css: 'css', js: 'javascript' };
  editor.setOption('mode', modeMap[tabName]);
  editor.setValue(tabContents[tabName] || '');
  editor.focus();
  _updateUndoRedoButtons();
}

function handleEditorChange(doc) {
  const content = doc.getValue();
  tabContents[state.activeTab] = content;
  state.isDirty = true;
  updateCursorPos();

  // Push to undo/redo history
  _pushHistory(state.activeTab, content);

  // Auto-save to localStorage
  localStorage.setItem(`htmlstudio-content-${state.activeTab}`, content);

  // Trigger preview render
  renderPreview(tabContents.html, tabContents.css, tabContents.js);
}

function updateCursorPos() {
  if (!editor) return;
  const pos = editor.getCursor();
  $('cursor-pos').textContent = `Ln ${pos.line + 1}, Col ${pos.ch + 1}`;
}

/* ── Preview ─────────────────────────────────────────────────── */
function initPreviewModule() {
  initPreview($('preview-frame'));

  // Initial render
  renderPreview(tabContents.html, tabContents.css, tabContents.js);
}

/* ── Vault (OPFS) ────────────────────────────────────────────── */
async function initVaultModule() {
  state.vaultAvailable = await initVault();
  const vaultStatus = $('status-vault');
  if (state.vaultAvailable) {
    vaultStatus.textContent = 'Vault: ready';
    vaultStatus.style.color = 'var(--success)';
  } else {
    vaultStatus.textContent = 'Vault: unavailable';
    vaultStatus.style.color = 'var(--text-muted)';
  }
}

async function handleSave() {
  const name = state.currentFile || prompt('Save as:', 'untitled');
  if (!name) return;

  try {
    tabContents[state.activeTab] = editor.getValue();
    const combined = buildCombinedHtml(tabContents.html, tabContents.css, tabContents.js);
    await saveFile(name, combined);
    state.currentFile = name;
    state.isDirty = false;
    $('file-badge').textContent = name;
    addRecentFile(name);
    setStatus('ok', `Saved "${name}" to vault`);
  } catch (err) {
    setStatus('error', `Save failed: ${err.message}`);
  }
}

async function handleLoad() {
  if (!state.vaultAvailable) {
    setStatus('error', 'Vault not available');
    return;
  }
  const files = await listFiles();
  if (!files.length) {
    setStatus('warning', 'No saved files in vault');
    return;
  }
  // For now, load the most recent file
  // TODO: show a file picker in the SmartBar
  try {
    const content = await loadFile(files[0].name);
    parseCombinedHtml(content);
    state.currentFile = files[0].name;
    $('file-badge').textContent = files[0].name;
    addRecentFile(files[0].name);
    setStatus('ok', `Loaded "${files[0].name}"`);
  } catch (err) {
    setStatus('error', `Load failed: ${err.message}`);
  }
}

/* ── Export ──────────────────────────────────────────────────── */
function buildCombinedHtml(html, css, js) {
  // If the HTML already has <html> tags, inject CSS and JS into it
  let combined = html;

  if (css.trim()) {
    const styleTag = `<style>\n${css}\n</style>`;
    if (combined.includes('</head>')) {
      combined = combined.replace('</head>', `${styleTag}\n</head>`);
    } else if (combined.includes('<body')) {
      combined = combined.replace('<body', `${styleTag}\n<body`);
    } else {
      combined = styleTag + '\n' + combined;
    }
  }

  if (js.trim()) {
    const scriptTag = `<script>\n${js}\n<\/script>`;
    if (combined.includes('</body>')) {
      combined = combined.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      combined = combined + '\n' + scriptTag;
    }
  }

  return combined;
}

function parseCombinedHtml(combined) {
  // Extract CSS from <style> tags
  const styleMatch = combined.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  tabContents.css = styleMatch ? styleMatch[1].trim() : '';

  // Extract JS from <script> tags (not external scripts)
  const scriptMatch = combined.match(/<script(?!\s*src)[^>]*>([\s\S]*?)<\/script>/i);
  tabContents.js = scriptMatch ? scriptMatch[1].trim() : '';

  // Remove style and script tags to get clean HTML
  let html = combined
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script(?!\s*src)[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();

  tabContents.html = html;

  // Update editor if on html tab
  if (state.activeTab === 'html') {
    editor.setValue(tabContents.html);
  }

  localStorage.setItem('htmlstudio-content-html', tabContents.html);
  localStorage.setItem('htmlstudio-content-css', tabContents.css);
  localStorage.setItem('htmlstudio-content-js', tabContents.js);

  renderPreview(tabContents.html, tabContents.css, tabContents.js);
}

function handleExport() {
  $('export-modal').hidden = false;
}

function handleExportHtml() {
  tabContents[state.activeTab] = editor.getValue();
  const combined = buildCombinedHtml(tabContents.html, tabContents.css, tabContents.js);
  const blob = new Blob([combined], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.currentFile || 'index'}.html`;
  a.click();
  URL.revokeObjectURL(url);
  $('export-modal').hidden = true;
  setStatus('ok', 'Exported standalone HTML');
}

function handleExportCopy() {
  tabContents[state.activeTab] = editor.getValue();
  const combined = buildCombinedHtml(tabContents.html, tabContents.css, tabContents.js);
  navigator.clipboard.writeText(combined).then(() => {
    $('export-modal').hidden = true;
    setStatus('ok', 'HTML copied to clipboard');
  }).catch(() => {
    setStatus('error', 'Failed to copy to clipboard');
  });
}

function handleExportZip() {
  setStatus('warning', 'ZIP export coming soon — use standalone HTML for now');
  $('export-modal').hidden = true;
}

/* ── Status ──────────────────────────────────────────────────── */
function setStatus(level, msg) {
  const el = $('status-msg');
  el.textContent = msg;
  el.style.color = level === 'error' ? 'var(--error)'
    : level === 'warning' ? 'var(--warning)'
    : level === 'ok' ? 'var(--success)'
    : 'var(--text-muted)';
  // Auto-clear after 4s
  clearTimeout(setStatus._timer);
  setStatus._timer = setTimeout(() => {
    el.textContent = 'Ready';
    el.style.color = 'var(--text-muted)';
  }, 4000);
}

/* ── SmartBar Actions ────────────────────────────────────────── */
function initSmartBarModule() {
  initSmartBar({
    overlay: $('smartbar-overlay'),
    input: $('smartbar-input'),
    results: $('smartbar-results'),
    onAction: handleSmartBarAction,
    onTemplate: handleTemplateInsert,
    onSnippet: handleSnippetInsert,
    getRecentFiles,
    onRecentFile: handleLoadRecent,
  });
}

function handleSmartBarAction(actionId) {
  closeSmartBar();
  switch (actionId) {
    case 'new-file':
      tabContents.html = TEMPLATES.find(t => t.id === 'blank').code;
      tabContents.css = '';
      tabContents.js = '';
      state.currentFile = null;
      $('file-badge').textContent = 'Untitled';
      switchTab(state.activeTab);
      setStatus('ok', 'New file created');
      break;
    case 'save-file':
      handleSave();
      break;
    case 'load-file':
      handleLoad();
      break;
    case 'export-html':
      handleExport();
      break;
    case 'refresh-preview':
      renderPreview(tabContents.html, tabContents.css, tabContents.js);
      setStatus('ok', 'Preview refreshed');
      break;
  }
}

function handleTemplateInsert(template) {
  closeSmartBar();
  tabContents.html = template.code;
  tabContents.css = template.css || '';
  tabContents.js = template.js || '';
  switchTab('html');
  state.currentFile = null;
  $('file-badge').textContent = template.label;
  setStatus('ok', `Loaded template: ${template.label}`);
}

function handleSnippetInsert(snippet) {
  closeSmartBar();
  if (state.activeTab === 'html') {
    editor.replaceRange(snippet.code, editor.getCursor());
  } else if (state.activeTab === 'css') {
    editor.replaceRange(snippet.code, editor.getCursor());
  } else {
    editor.replaceRange(snippet.code, editor.getCursor());
  }
  editor.focus();
  setStatus('ok', `Inserted: ${snippet.label}`);
}

async function handleLoadRecent(name) {
  closeSmartBar();
  try {
    const content = await loadFile(name);
    parseCombinedHtml(content);
    state.currentFile = name;
    $('file-badge').textContent = name;
    addRecentFile(name);
    setStatus('ok', `Loaded "${name}"`);
  } catch (err) {
    setStatus('error', `Load failed: ${err.message}`);
  }
}

/* ── Keyboard Shortcuts ──────────────────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+K / Cmd+K → SmartBar
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if ($('smartbar-overlay').hidden) {
        openSmartBar();
      } else {
        closeSmartBar();
      }
      return;
    }

    // Escape → close overlays
    if (e.key === 'Escape') {
      if (!$('smartbar-overlay').hidden) {
        closeSmartBar();
        return;
      }
      if (!$('export-modal').hidden) {
        $('export-modal').hidden = true;
        return;
      }
    }

    // Ctrl+S / Cmd+S → Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Ctrl+Z → Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      _undo();
      return;
    }

    // Ctrl+Shift+Z / Ctrl+Y → Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      _redo();
      return;
    }
  });
}

/* ── Divider Drag ────────────────────────────────────────────── */
function initDivider() {
  const divider = $('divider');
  const editorPane = $('editor-pane');
  const previewPane = $('preview-pane');
  let dragging = false;
  let startX = 0;
  let startEditorWidth = 0;
  let startPreviewWidth = 0;

  divider.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    const total = editorPane.parentElement.offsetWidth - divider.offsetWidth;
    startEditorWidth = editorPane.offsetWidth;
    startPreviewWidth = previewPane.offsetWidth;
    divider.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  });

  divider.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const total = editorPane.parentElement.offsetWidth - divider.offsetWidth;
    const newEditorWidth = Math.max(200, Math.min(startEditorWidth + dx, total - 200));
    const pct = (newEditorWidth / total) * 100;
    editorPane.style.flex = `0 0 ${pct}%`;
    previewPane.style.flex = `0 0 ${100 - pct}%`;
  });

  divider.addEventListener('pointerup', () => {
    dragging = false;
    document.body.style.cursor = '';
  });
}

/* ── Init ────────────────────────────────────────────────────── */
async function init() {
  initEditor();
  initPreviewModule();
  initDivider();
  initKeyboardShortcuts();
  initSmartBarModule();
  await initVaultModule();

  // AI Assistant
  initAIAssistant({
    getEditorContent: () => {
      tabContents[state.activeTab] = editor.getValue();
      if (state.activeTab === 'html') return tabContents.html;
      if (state.activeTab === 'css') return tabContents.css;
      return tabContents.js;
    },
    setEditorContent: (code) => {
      if (state.activeTab === 'html') {
        tabContents.html = code;
        editor.setValue(code);
      } else if (state.activeTab === 'css') {
        tabContents.css = code;
        editor.setValue(code);
      } else {
        tabContents.js = code;
        editor.setValue(code);
      }
      renderPreview(tabContents.html, tabContents.css, tabContents.js);
    },
    updateStatus: setStatus,
  });

  // Themer
  initThemer({
    setCssContent: (css) => {
      tabContents.css = css;
      if (state.activeTab === 'css') {
        editor.setValue(css);
      }
      renderPreview(tabContents.html, tabContents.css, tabContents.js);
    },
  });

  // Image Panel
  initImagePanel({
    insertImage: (html) => {
      // Insert at cursor position in the editor
      editor.replaceRange(html, editor.getCursor());
      editor.focus();
    },
  });

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Top bar buttons
  $('btn-save').addEventListener('click', handleSave);
  $('btn-export').addEventListener('click', handleExport);
  $('btn-cmd').addEventListener('click', openSmartBar);
  $('btn-undo').addEventListener('click', _undo);
  $('btn-redo').addEventListener('click', _redo);

  // Preview buttons
  $('btn-refresh').addEventListener('click', () => {
    renderPreview(tabContents.html, tabContents.css, tabContents.js);
    setStatus('ok', 'Preview refreshed');
  });

  // Export modal
  $('export-close').addEventListener('click', () => { $('export-modal').hidden = true; });
  $('export-html').addEventListener('click', handleExportHtml);
  $('export-copy').addEventListener('click', handleExportCopy);
  $('export-zip').addEventListener('click', handleExportZip);

  // Close modals on overlay click
  $('export-modal').addEventListener('click', (e) => {
    if (e.target === $('export-modal')) $('export-modal').hidden = true;
  });

  setStatus('ready', 'SmarTools HTML Studio — ready');
}

init();
