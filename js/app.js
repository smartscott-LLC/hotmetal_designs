/* ============================================================
   SmarTools HTML Studio — Main App Module
   Thin shell: creates the studio controller, wires up UI
   buttons/shortcuts, and passes the studio to the AI assistant.
   All module logic lives in studio-controller.js.
   ============================================================ */

import { createStudioController } from './studio-controller.js';
import { initAIAssistant } from './ai-assistant.js';

/* ── DOM refs ────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

/* ── Studio controller ───────────────────────────────────────── */
const studio = createStudioController({
  editorContainer: $('editor-container'),
  previewFrame: $('preview-frame'),
  smartbarOverlay: $('smartbar-overlay'),
  smartbarInput: $('smartbar-input'),
  smartbarResults: $('smartbar-results'),
});

/* ── Status (delegates to studio) ───────────────────────────── */
function setStatus(level, msg) {
  const el = $('status-msg');
  el.textContent = msg;
  el.style.color = level === 'error' ? 'var(--error)'
    : level === 'warning' ? 'var(--warning)'
    : level === 'ok' ? 'var(--success)'
    : 'var(--text-muted)';
  clearTimeout(setStatus._timer);
  setStatus._timer = setTimeout(() => {
    el.textContent = 'Ready';
    el.style.color = 'var(--text-muted)';
  }, 4000);
}

/* ── Undo/Redo button state ─────────────────────────────────── */
function _updateUndoRedoButtons() {
  const s = studio.editor.getUndoRedoState();
  const tab = studio.editor.getActiveTab();
  const idx = tab === 'html' ? s.htmlIndex : tab === 'css' ? s.cssIndex : s.jsIndex;
  const total = tab === 'html' ? s.htmlTotal : tab === 'css' ? s.cssTotal : s.jsTotal;
  const undoBtn = $('btn-undo');
  const redoBtn = $('btn-redo');
  if (undoBtn) undoBtn.disabled = idx <= 0;
  if (redoBtn) redoBtn.disabled = idx >= total - 1;
}

/* ── Tab switching ───────────────────────────────────────────── */
function switchTab(tabName) {
  studio.editor.switchTab(tabName);
  $('pane-label').textContent = tabName.toUpperCase();
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('tab-active', t.dataset.tab === tabName);
  });
  _updateUndoRedoButtons();
}

/* ── Export ──────────────────────────────────────────────────── */
function handleExport() {
  $('export-modal').hidden = false;
}

function handleExportHtml() {
  studio.preview.exportAsFile((studio.file.getCurrentFile() || 'index') + '.html');
  $('export-modal').hidden = true;
  setStatus('ok', 'Exported standalone HTML');
}

function handleExportCopy() {
  studio.preview.exportToClipboard().then(() => {
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

/* ── Keyboard Shortcuts ──────────────────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+K / Cmd+K → SmartBar
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if ($('smartbar-overlay').hidden) {
        studio.smartbar.open();
      } else {
        studio.smartbar.close();
      }
      return;
    }

    // Escape → close overlays
    if (e.key === 'Escape') {
      if (!$('smartbar-overlay').hidden) {
        studio.smartbar.close();
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
      const name = studio.file.getCurrentFile() || prompt('Save as:', 'untitled');
      if (name) {
        studio.vault.saveFile(name).then(() => {
          studio.file.setCurrentFile(name);
          $('file-badge').textContent = name;
          setStatus('ok', `Saved "${name}" to vault`);
        }).catch(err => setStatus('error', `Save failed: ${err.message}`));
      }
      return;
    }

    // Ctrl+Z → Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      studio.editor.undo();
      _updateUndoRedoButtons();
      return;
    }

    // Ctrl+Shift+Z / Ctrl+Y → Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      studio.editor.redo();
      _updateUndoRedoButtons();
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

  divider.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    const total = editorPane.parentElement.offsetWidth - divider.offsetWidth;
    startEditorWidth = editorPane.offsetWidth;
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
  // Wire status callback
  studio.status.onStatus(setStatus);

  // Initialize all studio modules
  await studio.init();

  // Update UI
  _updateUndoRedoButtons();
  const lastFile = studio.file.getCurrentFile();
  if (lastFile) $('file-badge').textContent = lastFile;

  // AI Assistant — pass the full studio controller
  initAIAssistant({ studio });

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Top bar buttons
  $('btn-save').addEventListener('click', () => {
    const name = studio.file.getCurrentFile() || prompt('Save as:', 'untitled');
    if (name) {
      studio.vault.saveFile(name).then(() => {
        studio.file.setCurrentFile(name);
        $('file-badge').textContent = name;
        setStatus('ok', `Saved "${name}" to vault`);
      }).catch(err => setStatus('error', `Save failed: ${err.message}`));
    }
  });
  $('btn-export').addEventListener('click', handleExport);
  $('btn-cmd').addEventListener('click', () => studio.smartbar.open());
  $('btn-undo').addEventListener('click', () => { studio.editor.undo(); _updateUndoRedoButtons(); });
  $('btn-redo').addEventListener('click', () => { studio.editor.redo(); _updateUndoRedoButtons(); });

  // Preview buttons
  $('btn-refresh').addEventListener('click', () => {
    studio.preview.render();
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

  // Keyboard shortcuts & divider
  initKeyboardShortcuts();
  initDivider();

  setStatus('ready', 'SmarTools HTML Studio — ready');
}

init();
