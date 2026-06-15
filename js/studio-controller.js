/* ============================================================
   SmarTools HTML Studio — Studio Controller
   Central hub / multiplexer for all studio modules.
   The AI assistant (or any consumer) imports this single
   component to access every studio capability.

   Modules wired:
     • Editor       — CodeMirror instance control
     • Preview      — iframe rendering
     • SmartBar     — command palette
     • Vault        — OPFS file save/load
     • Themer       — visual CSS generator
     • ImagePanel   — image management
     • Templates    — starter HTML templates
     • Snippets     — reusable code snippets

   Usage:
     import { createStudioController } from './studio-controller.js';
     const studio = createStudioController(domRefs);
     studio.init();
     studio.editor.setValue('<h1>Hello</h1>');
     studio.preview.render();
     studio.vault.saveFile('myproject', html);
   ============================================================ */

import { createEditor } from './editor.js';
import { initPreview, renderPreview } from './preview.js';
import { initSmartBar, openSmartBar, closeSmartBar } from './smartbar.js';
import {
  initVault, isVaultAvailable, listFiles, saveFile,
  loadFile, deleteFile, renameFile, getLastOpenedFile,
  setLastOpenedFile, getRecentFiles, addRecentFile, removeRecentFile,
} from './vault.js';
import { initThemer } from './themer.js';
import { initImagePanel } from './image-panel.js';
import { TEMPLATES } from './templates.js';
import { SNIPPETS, searchSnippets } from './snippets.js';

/* ── Types (JSDoc) ─────────────────────────────────────────── */

/**
 * @typedef {Object} DomRefs
 * @property {HTMLElement} editorContainer
 * @property {HTMLIFrameElement} previewFrame
 * @property {HTMLElement} smartbarOverlay
 * @property {HTMLInputElement} smartbarInput
 * @property {HTMLElement} smartbarResults
 */

/**
 * @typedef {'html'|'css'|'js'} TabName
 */

/**
 * @typedef {Object} TabContents
 * @property {string} html
 * @property {string} css
 * @property {string} js
 */

/**
 * @typedef {Object} UndoRedoState
 * @property {number} htmlIndex
 * @property {number} htmlTotal
 * @property {number} cssIndex
 * @property {number} cssTotal
 * @property {number} jsIndex
 * @property {number} jsTotal
 */

/* ── Factory ────────────────────────────────────────────────── */

/**
 * Create and wire up the studio controller.
 * @param {DomRefs} dom — required DOM element references
 * @returns {StudioController}
 */
export function createStudioController(dom) {
  /* ── Validate ─────────────────────────────────────────────── */
  const required = ['editorContainer', 'previewFrame', 'smartbarOverlay', 'smartbarInput', 'smartbarResults'];
  for (const key of required) {
    if (!dom[key]) throw new Error(`StudioController: missing dom.${key}`);
  }

  /* ── Internal state ───────────────────────────────────────── */
  /** @type {TabContents} */
  const tabContents = { html: '', css: '', js: '' };
  let activeTab = 'html';
  let currentFile = null;
  let isDirty = false;
  let vaultReady = false;
  let editor = null;
  let _initialised = false;

  /* ── Undo/Redo (50 steps per tab) ─────────────────────────── */
  const MAX_HISTORY = 50;
  const history = {
    html: { stack: [], index: -1, lastContent: '' },
    css:  { stack: [], index: -1, lastContent: '' },
  js:   { stack: [], index: -1, lastContent: '' },
  };

  let _suppressHistory = false;

  function _pushHistory(tab, content) {
    if (_suppressHistory) return;
    const h = history[tab];
    if (content === h.lastContent) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(content);
    if (h.stack.length > MAX_HISTORY) h.stack.shift();
    h.index = h.stack.length - 1;
    h.lastContent = content;
  }

  /* ── Status callback (set by consumer) ────────────────────── */
  let _statusCb = null;  // (level: string, msg: string) => void

  /* ==========================================================
     EDITOR
     ========================================================== */
  const editorCtrl = {
    /**
     * Initialise the CodeMirror editor.
     * Called once during studio.init().
     * @param {Object} [opts]
     * @param {number} [opts.debounceMs=300]
     */
    init(opts = {}) {
      editor = createEditor(dom.editorContainer, {
        mode: 'htmlmixed',
        debounceMs: opts.debounceMs ?? 300,
        onChange: () => {
          const content = editor.getValue();
          tabContents[activeTab] = content;
          isDirty = true;
          _pushHistory(activeTab, content);
          localStorage.setItem(`htmlstudio-content-${activeTab}`, content);
          previewCtrl.render();
        },
      });

      // Restore from localStorage or defaults
      tabContents.html = localStorage.getItem('htmlstudio-content-html')
        || TEMPLATES.find(t => t.id === 'blank').code;
      tabContents.css  = localStorage.getItem('htmlstudio-content-css')  || '';
      tabContents.js   = localStorage.getItem('htmlstudio-content-js')   || '';

      editor.setValue(tabContents.html);

      // Seed history
      for (const tab of ['html', 'css', 'js']) {
        history[tab].lastContent = tabContents[tab];
        history[tab].stack = [tabContents[tab]];
        history[tab].index = 0;
      }

      return editor;
    },

    /** Get the raw CodeMirror instance. */
    getInstance() {
      return editor;
    },

    /** Get current editor content for a tab. */
    getActiveContent() {
      if (editor) tabContents[activeTab] = editor.getValue();
      return tabContents[activeTab];
    },

    /** Set content for the active tab. */
    setActiveContent(content) {
      if (!editor) return;
      tabContents[activeTab] = content;
      editor.setValue(content);
      _pushHistory(activeTab, content);
      localStorage.setItem(`htmlstudio-content-${activeTab}`, content);
      previewCtrl.render();
    },

    /** Set content for a specific tab (switches tab). */
    setTabContent(tab, content) {
      tabContents[tab] = content;
      localStorage.setItem(`htmlstudio-content-${tab}`, content);
      if (activeTab === tab && editor) {
        editor.setValue(content);
        _pushHistory(tab, content);
      }
      previewCtrl.render();
    },

    /** Get content for a specific tab without switching. */
    getTabContent(tab) {
      if (activeTab === tab && editor) {
        tabContents[activeTab] = editor.getValue();
      }
      return tabContents[tab] || '';
    },

    /** Switch the active tab. */
    switchTab(tab) {
      if (editor) tabContents[activeTab] = editor.getValue();
      activeTab = tab;
      const modeMap = { html: 'htmlmixed', css: 'css', js: 'javascript' };
      editor.setOption('mode', modeMap[tab]);
      editor.setValue(tabContents[tab] || '');
      editor.focus();
    },

    /** Get the currently active tab name. */
    getActiveTab() {
      return activeTab;
    },

    /** Insert text at the current cursor position. */
    insertAtCursor(text) {
      if (!editor) return;
      editor.replaceRange(text, editor.getCursor());
      editor.focus();
    },

    /** Replace the current selection with text. */
    replaceSelection(text) {
      if (!editor) return;
      editor.replaceSelection(text);
      editor.focus();
    },

    /** Get cursor position {line, ch}. */
    getCursor() {
      return editor ? editor.getCursor() : { line: 0, ch: 0 };
    },

    /** Get the currently selected text (or empty string). */
    getSelection() {
      return editor ? editor.getSelection() : '';
    },

    /** Get a range between two positions.
     * @param {{line: number, ch: number}} from
     * @param {{line: number, ch: number}} to
     */
    getRange(from, to) {
      return editor ? editor.getRange(from, to) : '';
    },

    /** Replace a specific range (not just cursor).
     * @param {string} text
     * @param {{line: number, ch: number}} from
     * @param {{line: number, ch: number}} [to]
     */
    replaceRange(text, from, to) {
      if (!editor) return;
      editor.replaceRange(text, from, to);
      editor.focus();
    },

    /** Get the word under the cursor. */
    getWordAtCursor() {
      if (!editor) return '';
      const cur = editor.getCursor();
      return editor.findWordAt(cur);
    },

    /** Get total line count. */
    lineCount() {
      return editor ? editor.lineCount() : 0;
    },

    /** Get the content of a specific line (0-indexed). */
    getLine(n) {
      return editor ? editor.getLine(n) : '';
    },

    /** Iterate all lines. Each callback receives (lineHandle). */
    eachLine(fn) {
      if (!editor) return;
      editor.eachLine(fn);
    },

    /** Scroll the editor to a position. */
    scrollTo(line, ch) {
      if (editor) editor.scrollTo(line, ch);
    },

    /** Get the current editor mode (htmlmixed, css, javascript). */
    getMode() {
      return editor ? editor.getOption('mode') : 'htmlmixed';
    },

    /** Clear undo/redo history (e.g. after loading a file). */
    clearHistory() {
      if (!editor) return;
      editor.clearHistory();
      for (const tab of ['html', 'css', 'js']) {
        history[tab].lastContent = tabContents[tab];
        history[tab].stack = [tabContents[tab]];
        history[tab].index = 0;
      }
    },

    /** Set content without pushing to undo history.
     * @param {string} content
     */
    setValueSilent(content) {
      if (!editor) return;
      _suppressHistory = true;
      editor.setValue(content);
      _suppressHistory = false;
    },

    /** Run any built-in CodeMirror command by name.
     * @param {string} name — e.g. 'toggleComment', 'findPersistent', 'indentAuto'
     */
    execCommand(name) {
      if (editor) editor.execCommand(name);
    },

    /** Find next occurrence (opens search if not already open). */
    findNext() {
      if (editor) editor.execCommand('findNext');
    },

    /** Find previous occurrence. */
    findPrev() {
      if (editor) editor.execCommand('findPrev');
    },

    /** Find and replace text.
     * @param {string} query
     * @param {string} [replacement]
     */
    replace(query, replacement) {
      if (!editor) return;
      editor.execCommand('replace');
    },

    /** Highlight a range in the editor.
     * @param {{line: number, ch: number}} from
     * @param {{line: number, ch: number}} to
     * @param {Object} [options] — e.g. { className: 'highlight' }
     */
    markText(from, to, options = {}) {
      if (!editor) return null;
      return editor.markText(from, to, options);
    },

    /** Drop a bookmark at a position.
     * @param {{line: number, ch: number}} pos
     * @param {Object} [options]
     */
    setBookmark(pos, options = {}) {
      if (!editor) return null;
      return editor.setBookmark(pos, options);
    },

    /** Force CodeMirror to re-measure (after layout changes). */
    refresh() {
      if (editor) editor.refresh();
    },

    /** Get the editor's DOM container element. */
    getContainer() {
      return editor ? editor.getWrapperElement() : null;
    },

    /** Focus the editor. */
    focus() {
      if (editor) editor.focus();
    },

    /** Undo last change on active tab. */
    undo() {
      const h = history[activeTab];
      if (h.index <= 0) return;
      h.index--;
      const content = h.stack[h.index];
      h.lastContent = content;
      _suppressHistory = true;
      editor.setValue(content);
      _suppressHistory = false;
      tabContents[activeTab] = content;
      previewCtrl.render();
    },

    /** Redo last undone change on active tab. */
    redo() {
      const h = history[activeTab];
      if (h.index >= h.stack.length - 1) return;
      h.index++;
      const content = h.stack[h.index];
      h.lastContent = content;
      _suppressHistory = true;
      editor.setValue(content);
      _suppressHistory = false;
      tabContents[activeTab] = content;
      previewCtrl.render();
    },

    /** Get undo/redo state for all tabs. */
    getUndoRedoState() {
      /** @returns {UndoRedoState} */
      return {
        htmlIndex: history.html.index,
        htmlTotal: history.html.stack.length,
        cssIndex: history.css.index,
        cssTotal: history.css.stack.length,
        jsIndex: history.js.index,
        jsTotal: history.js.stack.length,
      };
    },

    /** Get all tab contents at once. */
    getAllContents() {
      if (editor) tabContents[activeTab] = editor.getValue();
      return { ...tabContents };
    },

    /** Set all tab contents at once. */
    setAllContents({ html = '', css = '', js = '' }) {
      tabContents.html = html;
      tabContents.css = css;
      tabContents.js = js;
      for (const tab of ['html', 'css', 'js']) {
        localStorage.setItem(`htmlstudio-content-${tab}`, tabContents[tab]);
        history[tab].lastContent = tabContents[tab];
        history[tab].stack = [tabContents[tab]];
        history[tab].index = 0;
      }
      if (editor && activeTab === 'html') editor.setValue(html);
      previewCtrl.render();
    },
  };

  /* ==========================================================
     PREVIEW
     ========================================================== */
  const previewCtrl = {
    init() {
      initPreview(dom.previewFrame);
      previewCtrl.render();
    },

    /** Render all tabs into the preview iframe. */
    render() {
      renderPreview(tabContents.html, tabContents.css, tabContents.js);
    },

    /** Build a standalone HTML document from all tabs. */
    buildCombinedHtml() {
      let combined = tabContents.html;
      if (tabContents.css.trim()) {
        const styleTag = `<style>\n${tabContents.css}\n</style>`;
        if (combined.includes('</head>')) {
          combined = combined.replace('</head>', `${styleTag}\n</head>`);
        } else if (combined.includes('<body')) {
          combined = combined.replace('<body', `${styleTag}\n<body`);
        } else {
          combined = styleTag + '\n' + combined;
        }
      }
      if (tabContents.js.trim()) {
        const scriptTag = `<script>\n${tabContents.js}\n<\/script>`;
        if (combined.includes('</body>')) {
          combined = combined.replace('</body>', `${scriptTag}\n</body>`);
        } else {
          combined = combined + '\n' + scriptTag;
        }
      }
      return combined;
    },

    /** Export combined HTML as a downloadable file. */
    exportAsFile(filename = 'index.html') {
      const combined = previewCtrl.buildCombinedHtml();
      const blob = new Blob([combined], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    /** Copy combined HTML to clipboard. */
    async exportToClipboard() {
      const combined = previewCtrl.buildCombinedHtml();
      await navigator.clipboard.writeText(combined);
    },
  };

  /* ==========================================================
     VAULT (OPFS)
     ========================================================== */
  const vaultCtrl = {
    /** Initialise the OPFS vault. Returns true if available. */
    async init() {
      vaultReady = await initVault();
      return vaultReady;
    },

    /** Check if OPFS is available. */
    isAvailable() {
      return vaultReady;
    },

    /**
     * Save a file to the vault.
     * @param {string} name
     * @param {string} [content] — if omitted, builds from all tabs.
     */
    async saveFile(name, content) {
      const output = content ?? previewCtrl.buildCombinedHtml();
      await saveFile(name, output);
      currentFile = name;
      isDirty = false;
      addRecentFile(name);
    },

    /**
     * Load a file from the vault.
     * Parses combined HTML back into tabs.
     * @param {string} name
     */
    async loadFile(name) {
      const content = await loadFile(name);
      vaultCtrl._parseCombinedHtml(content);
      currentFile = name;
      isDirty = false;
      addRecentFile(name);
    },

    /**
     * Delete a file from the vault.
     * @param {string} name
     */
    async deleteFile(name) {
      await deleteFile(name);
      removeRecentFile(name);
    },

    /**
     * Rename a file in the vault.
     * @param {string} oldName
     * @param {string} newName
     */
    async renameFile(oldName, newName) {
      await renameFile(oldName, newName);
      if (currentFile === oldName) currentFile = newName;
    },

    /** List all files in the vault. */
    async listFiles() {
      return listFiles();
    },

    /** Get recent file names. */
    getRecentFiles() {
      return getRecentFiles();
    },

    /** Get the last opened file name. */
    getLastOpenedFile() {
      return getLastOpenedFile();
    },

    /** Load the most recently opened file. */
    async loadLastOpened() {
      const last = getLastOpenedFile();
      if (last) await vaultCtrl.loadFile(last);
    },

    /**
     * Parse a combined HTML string back into tab contents.
     * @param {string} combined
     */
    _parseCombinedHtml(combined) {
      const styleMatch = combined.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      tabContents.css = styleMatch ? styleMatch[1].trim() : '';

      const scriptMatch = combined.match(/<script(?!\s*src)[^>]*>([\s\S]*?)<\/script>/i);
      tabContents.js = scriptMatch ? scriptMatch[1].trim() : '';

      let html = combined
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script(?!\s*src)[^>]*>[\s\S]*?<\/script>/gi, '')
        .trim();
      tabContents.html = html;

      for (const tab of ['html', 'css', 'js']) {
        localStorage.setItem(`htmlstudio-content-${tab}`, tabContents[tab]);
        history[tab].lastContent = tabContents[tab];
        history[tab].stack = [tabContents[tab]];
        history[tab].index = 0;
      }

      if (editor) editor.setValue(tabContents.html);
      previewCtrl.render();
    },
  };

  /* ==========================================================
     SMARTBAR
     ========================================================== */
  const smartbarCtrl = {
    init() {
      initSmartBar({
        overlay: dom.smartbarOverlay,
        input: dom.smartbarInput,
        results: dom.smartbarResults,
        onAction: (actionId) => _handleSmartBarAction(actionId),
        onTemplate: (template) => _handleTemplateInsert(template),
        onSnippet: (snippet) => _handleSnippetInsert(snippet),
        getRecentFiles: () => vaultCtrl.getRecentFiles(),
        onRecentFile: async (name) => {
          await vaultCtrl.loadFile(name);
          if (_statusCb) _statusCb('ok', `Loaded "${name}"`);
        },
      });
    },

    open() {
      openSmartBar();
    },

    close() {
      closeSmartBar();
    },
  };

  /* ==========================================================
     THEMER
     ========================================================== */
  const themerCtrl = {
    init() {
      initThemer({
        setCssContent: (css) => {
          editorCtrl.setTabContent('css', css);
        },
      });
    },
  };

  /* ==========================================================
     IMAGE PANEL
     ========================================================== */
  const imagePanelCtrl = {
    init() {
      initImagePanel({
        insertImage: (html) => {
          editorCtrl.insertAtCursor(html);
        },
      });
    },
  };

  /* ==========================================================
     TEMPLATES
     ========================================================== */
  const templatesCtrl = {
    /** Get all available templates. */
    getAll() {
      return TEMPLATES;
    },

    /** Find a template by ID. */
    getById(id) {
      return TEMPLATES.find(t => t.id === id);
    },

    /** Get templates by category. */
    getByCategory(category) {
      return TEMPLATES.filter(t => t.category === category);
    },

    /** Get all unique categories. */
    getCategories() {
      return [...new Set(TEMPLATES.map(t => t.category))];
    },

    /**
     * Apply a template — sets all tabs and switches to HTML.
     * @param {string} templateId
     */
    applyTemplate(templateId) {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (!template) return false;
      editorCtrl.setAllContents({
        html: template.code,
        css: template.css || '',
        js: template.js || '',
      });
      editorCtrl.switchTab('html');
      currentFile = null;
      return true;
    },
  };

  /* ==========================================================
     SNIPPETS
     ========================================================== */
  const snippetsCtrl = {
    /** Get all snippets. */
    getAll() {
      return SNIPPETS;
    },

    /** Search snippets by query. */
    search(query) {
      return searchSnippets(query);
    },

    /** Get snippets by tag (html, css, js). */
    getByTag(tag) {
      return SNIPPETS.filter(s => s.tag === tag);
    },

    /**
     * Insert a snippet into the editor at cursor.
     * @param {string} snippetId
     */
    insertById(snippetId) {
      const snippet = SNIPPETS.find(s => s.id === snippetId);
      if (!snippet) return false;
      editorCtrl.insertAtCursor(snippet.code);
      return true;
    },

    /**
     * Insert snippet code directly into the editor.
     * @param {string} code
     */
    insertCode(code) {
      editorCtrl.insertAtCursor(code);
    },
  };

  /* ==========================================================
     STATUS
     ========================================================== */
  const statusCtrl = {
    /**
     * Set a status callback.
     * @param {(level: string, msg: string) => void} cb
     */
    onStatus(cb) {
      _statusCb = cb;
    },

    /** Report status via callback. */
    report(level, msg) {
      if (_statusCb) _statusCb(level, msg);
    },
  };

  /* ==========================================================
     FILE HELPERS
     ========================================================== */
  const fileCtrl = {
    /** Get the current file name (or null). */
    getCurrentFile() {
      return currentFile;
    },

    /** Set the current file name. */
    setCurrentFile(name) {
      currentFile = name;
    },

    /** Check if there are unsaved changes. */
    isDirty() {
      return isDirty;
    },

    /** Mark as clean (e.g. after save). */
    markClean() {
      isDirty = false;
    },
  };

  /* ==========================================================
     INTERNAL HANDLERS
     ========================================================== */
  function _handleSmartBarAction(actionId) {
    closeSmartBar();
    switch (actionId) {
      case 'new-file':
        editorCtrl.setAllContents({ html: TEMPLATES.find(t => t.id === 'blank').code, css: '', js: '' });
        currentFile = null;
        if (_statusCb) _statusCb('ok', 'New file created');
        break;
      case 'save-file':
        vaultCtrl.saveFile(currentFile || 'untitled');
        if (_statusCb) _statusCb('ok', `Saved "${currentFile || 'untitled'}"`);
        break;
      case 'load-file':
        vaultCtrl.loadLastOpened();
        break;
      case 'export-html':
        previewCtrl.exportAsFile((currentFile || 'index') + '.html');
        if (_statusCb) _statusCb('ok', 'Exported HTML file');
        break;
      case 'refresh-preview':
        previewCtrl.render();
        if (_statusCb) _statusCb('ok', 'Preview refreshed');
        break;
    }
  }

  function _handleTemplateInsert(template) {
    closeSmartBar();
    editorCtrl.setAllContents({ html: template.code, css: template.css || '', js: template.js || '' });
    editorCtrl.switchTab('html');
    currentFile = null;
    if (_statusCb) _statusCb('ok', `Loaded template: ${template.label}`);
  }

  function _handleSnippetInsert(snippet) {
    closeSmartBar();
    editorCtrl.insertAtCursor(snippet.code);
    if (_statusCb) _statusCb('ok', `Inserted: ${snippet.label}`);
  }

  /* ==========================================================
     PUBLIC API — the controller object
     ========================================================== */
  /** @typedef {typeof editorCtrl & typeof previewCtrl & typeof vaultCtrl & typeof smartbarCtrl & typeof themerCtrl & typeof imagePanelCtrl & typeof templatesCtrl & typeof snippetsCtrl & typeof statusCtrl & typeof fileCtrl & { init: () => Promise<void>, getTabContents: () => TabContents }} StudioController */

  /**
   * Initialise all modules.
   * Call this once after creating the controller.
   * @param {Object} [opts]
   * @param {boolean} [opts.awaitVault=false] — if true, blocks until vault is ready
   */
  async init(opts = {}) {
    if (_initialised) return;

    const awaitVault = opts.awaitVault ?? false;

    try {
      editorCtrl.init();
      previewCtrl.init();
      themerCtrl.init();
      imagePanelCtrl.init();
      smartbarCtrl.init();

      if (awaitVault) {
        try {
          await vaultCtrl.init();
        } catch (err) {
          console.warn('[Studio] Vault init failed:', err);
          statusCtrl.report('warning', 'Vault unavailable');
        }
      } else {
        void vaultCtrl.init().catch((err) => {
          console.warn('[Studio] Vault init failed:', err);
          statusCtrl.report('warning', 'Vault unavailable');
        });
      }

      _initialised = true;
      statusCtrl.report('ok', 'Studio initialized');
    } catch (err) {
      _initialised = false;
      console.error('[Studio] Init failed:', err);
      statusCtrl.report('error', `Studio init failed: ${err.message}`);
      throw err;
    }
  }

  /** Get current tab contents snapshot. */
  function getTabContents() {
    return { ...tabContents };
  }

  /* ── Assemble & return the controller ─────────────────────── */
  const studio = {
    init,
    getTabContents,
    editor: editorCtrl,
    preview: previewCtrl,
    vault: vaultCtrl,
    smartbar: smartbarCtrl,
    themer: themerCtrl,
    imagePanel: imagePanelCtrl,
    templates: templatesCtrl,
    snippets: snippetsCtrl,
    status: statusCtrl,
    file: fileCtrl,
  };

  return studio;
}
