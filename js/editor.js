/* ============================================================
   SmarTools HTML Studio — Editor Module
   CodeMirror 5-based HTML/CSS/JS editor:
   - Multi-mode support (htmlmixed, css, javascript)
   - Auto-close brackets
   - Code hints
   - Debounced onChange callback
   ============================================================ */

/**
 * Create a CodeMirror editor instance.
 * @param {HTMLElement} container
 * @param {{ mode: string, onChange: Function, debounceMs: number }} options
 * @returns {CodeMirror}
 */
export function createEditor(container, { mode = 'htmlmixed', onChange, debounceMs = 300 } = {}) {
  // Clear container
  container.innerHTML = '';

  const cm = CodeMirror(container, {
    value: '',
    mode,
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      'Ctrl-/': 'toggleComment',
      'Cmd-/': 'toggleComment',
      'Ctrl-F': 'findPersistent',
      'Cmd-F': 'findPersistent',
      'Shift-Tab': 'indentLess',
      Tab(cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection('add');
        } else {
          cm.replaceSelection('  ', 'end');
        }
      },
    },
    gutters: ['CodeMirror-linenumbers'],
    styleActiveLine: true,
  });

  // Debounced change handler
  let timer = null;
  cm.on('change', () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onChange(cm);
    }, debounceMs);
  });

  // Refresh on container resize
  const ro = new ResizeObserver(() => cm.refresh());
  ro.observe(container);

  return cm;
}
