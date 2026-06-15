/* ============================================================
   SmarTools HTML Studio — Main App Module
   ============================================================ */

import { createStudioController } from './studio-controller.js';
import { initAIAssistant } from './ai-assistant.js';

/* ── DOM refs ────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

/* ── Boot guard ─────────────────────────────────────────────── */
let bootPromise = null;

/* ── Studio controller ───────────────────────────────────────── */
function createStudio() {
  const domRefs = {
    editorContainer: $('editor-container'),
    previewFrame: $('preview-frame'),
    smartbarOverlay: $('smartbar-overlay'),
    smartbarInput: $('smartbar-input'),
    smartbarResults: $('smartbar-results'),
  };

  for (const [name, el] of Object.entries(domRefs)) {
    if (!el) {
      throw new Error(`Missing required DOM element: ${name}`);
    }
  }

  return createStudioController(domRefs);
}

const studio = createStudio();

/* ── Expose stable global references ───────────────────────── */
window.studio = studio;
window.studioReady = null;

/* ── Status ─────────────────────────────────────────────────── */
function setStatus(level, msg) {
  const el = $('status-msg');
  if (!el) return;

  el.textContent = msg;
  el.style.color =
    level === 'error' ? 'var(--error)' :
    level === 'warning' ? 'var(--warning)' :
    level === 'ok' ? 'var(--success)' :
    'var(--text-muted)';

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

  const idx =
    tab === 'html' ? s.htmlIndex :
    tab === 'css' ? s.cssIndex :
    s.jsIndex;

  const total =
    tab === 'html' ? s.htmlTotal :
    tab === 'css' ? s.cssTotal :
    s.jsTotal;

  const undoBtn = $('btn-undo');
  const redoBtn = $('btn-redo');

  if (undoBtn) undoBtn.disabled = idx <= 0;
  if (redoBtn) redoBtn.disabled = idx >= total - 1;
}

/* ── Tab switching ───────────────────────────────────────────── */
function switchTab(tabName) {
  studio.editor.switchTab(tabName);

  const label = $('pane-label');
  if (label) label.textContent = tabName.toUpperCase();

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('tab-active', t.dataset.tab === tabName);
  });

  _updateUndoRedoButtons();
}

/* ── Export ──────────────────────────────────────────────────── */
function handleExport() {
  const modal = $('export-modal');
  if (modal) modal.hidden = false;
}

function handleExportHtml() {
  studio.preview.exportAsFile((studio.file.getCurrentFile() || 'index') + '.html');

  const modal = $('export-modal');
  if (modal) modal.hidden = true;

  setStatus('ok', 'Exported standalone HTML');
}

function handleExportCopy() {
  studio.preview.exportToClipboard().then(() => {
    const modal = $('export-modal');
    if (modal) modal.hidden = true;

    setStatus('ok', 'HTML copied to clipboard');
  }).catch(() => {
    setStatus('error', 'Failed to copy to clipboard');
  });
}

function handleExportZip() {
  setStatus('warning', 'ZIP export coming soon — use standalone HTML for now');

  const modal = $('export-modal');
  if (modal) modal.hidden = true;
}

/* ── Keyboard Shortcuts ─────────────────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();

      const smartbar = $('smartbar-overlay');
      if (smartbar && smartbar.hidden) {
        studio.smartbar.open();
      } else if (smartbar) {
        studio.smartbar.close();
      }

      return;
    }

    if (e.key === 'Escape') {
      const smartbar = $('smartbar-overlay');
      const exportModal = $('export-modal');

      if (smartbar && !smartbar.hidden) {
        studio.smartbar.close();
        return;
      }

      if (exportModal && !exportModal.hidden) {
        exportModal.hidden = true;
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();

      const name = studio.file.getCurrentFile() || prompt('Save as:', 'untitled');

      if (name) {
        studio.vault.saveFile(name).then(() => {
          studio.file.setCurrentFile(name);

          const fileBadge = $('file-badge');
          if (fileBadge) fileBadge.textContent = name;

          setStatus('ok', `Saved "${name}" to vault`);
        }).catch(err => {
          setStatus('error', `Save failed: ${err.message}`);
        });
      }

      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      studio.editor.undo();
      _updateUndoRedoButtons();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      studio.editor.redo();
      _updateUndoRedoButtons();
    }
  });
}

/* ── Divider Drag ───────────────────────────────────────────── */
function initDivider() {
  const divider = $('divider');
  const editorPane = $('editor-pane');
  const previewPane = $('preview-pane');

  if (!divider || !editorPane || !previewPane) return;

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

/* ── UI bindings ─────────────────────────────────────────────── */
function bindUI() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  const btnSave = $('btn-save');
  const btnExport = $('btn-export');
  const btnCmd = $('btn-cmd');
  const btnUndo = $('btn-undo');
  const btnRedo = $('btn-redo');
  const btnRefresh = $('btn-refresh');

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = studio.file.getCurrentFile() || prompt('Save as:', 'untitled');

      if (name) {
        studio.vault.saveFile(name).then(() => {
          studio.file.setCurrentFile(name);

          const fileBadge = $('file-badge');
          if (fileBadge) fileBadge.textContent = name;

          setStatus('ok', `Saved "${name}" to vault`);
        }).catch(err => {
          setStatus('error', `Save failed: ${err.message}`);
        });
      }
    });
  }

  if (btnExport) btnExport.addEventListener('click', handleExport);
  if (btnCmd) btnCmd.addEventListener('click', () => studio.smartbar.open());

  if (btnUndo) {
    btnUndo.addEventListener('click', () => {
      studio.editor.undo();
      _updateUndoRedoButtons();
    });
  }

  if (btnRedo) {
    btnRedo.addEventListener('click', () => {
      studio.editor.redo();
      _updateUndoRedoButtons();
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      studio.preview.render();
      setStatus('ok', 'Preview refreshed');
    });
  }

  const exportClose = $('export-close');
  const exportHtml = $('export-html');
  const exportCopy = $('export-copy');
  const exportZip = $('export-zip');
  const exportModal = $('export-modal');

  if (exportClose) exportClose.addEventListener('click', () => {
    if (exportModal) exportModal.hidden = true;
  });

  if (exportHtml) exportHtml.addEventListener('click', handleExportHtml);
  if (exportCopy) exportCopy.addEventListener('click', handleExportCopy);
  if (exportZip) exportZip.addEventListener('click', handleExportZip);

  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) exportModal.hidden = true;
    });
  }

  initKeyboardShortcuts();
  initDivider();
}

/* ── Init ────────────────────────────────────────────────────── */
async function init() {
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    try {
      console.info('[SmarTools] Booting studio controller...');

      studio.status.onStatus(setStatus);

      /*
        Important:
        This prevents OPFS/vault from blocking editor/preview/AI boot.
        The vault still initializes in the background if studio-controller
        was patched to accept { awaitVault: false }.
      */
      await studio.init({ awaitVault: false });

      window.studio = studio;

      window.studioBridge = {
        ping() {
          return {
            ok: true,
            initialized: true,
            hasEditor: !!studio.editor.getInstance(),
            hasPreview: !!studio.preview,
            hasVault: !!studio.vault,
            activeTab: studio.editor.getActiveTab(),
          };
        },

        setStudio(nextStudio) {
          window.studio = nextStudio;
          return !!nextStudio;
        },

        getStudio() {
          return window.studio;
        },
      };

      _updateUndoRedoButtons();

      const lastFile = studio.file.getCurrentFile();
      const fileBadge = $('file-badge');
      if (lastFile && fileBadge) fileBadge.textContent = lastFile;

      /*
        Important:
        This exposes the initialized assistant API to window/cards/tools.
      */
      window.aiAssistant = initAIAssistant({ studio });

      if (!window.aiAssistant) {
        window.aiAssistant = {
          ping() {
            return {
              ok: false,
              error: 'initAIAssistant returned no API object',
              widgetMounted: false,
            };
          },
        };
      }

      window.studioReady = Promise.resolve(studio);

      bindUI();

      console.info('[SmarTools] Studio controller ready');
      setStatus('ready', 'SmarTools HTML Studio — ready');

      return studio;
    } catch (err) {
      console.error('[SmarTools] Studio init failed:', err);

      window.studioReady = Promise.reject(err);
      setStatus('error', `Studio init failed: ${err.message}`);

      throw err;
    }
  })();

  window.studioReady = bootPromise;

  return bootPromise;
}

init();

