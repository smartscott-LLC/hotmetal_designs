he controller is the single source of truth — when the AI changes the editor, the preview re-renders. When the user changes the editor, the AI sees it through \`studio.editor.getActiveContent()\`. Same state, same preview, no syncing needed.

Here's the full list:

\---

\#\# Studio Controller — API Reference

\*\*Setup:\*\*  
\`\`\`js  
import { createStudioController } from './studio-controller.js';

const studio \= createStudioController({  
  editorContainer: document.getElementById('editor-container'),  
  previewFrame: document.getElementById('preview-frame'),  
  smartbarOverlay: document.getElementById('smartbar-overlay'),  
  smartbarInput: document.getElementById('smartbar-input'),  
  smartbarResults: document.getElementById('smartbar-results'),  
});

await studio.init();  
\`\`\`

\---

\#\#\# \`studio.editor\` — CodeMirror Control

| Method | Description |  
|---|---|  
| \`init(opts?)\` | Initialize editor. Called once by \`studio.init()\`. |  
| \`getInstance()\` | Get raw CodeMirror instance for advanced use. |  
| \`getActiveContent()\` | Get content of the currently active tab. |  
| \`setActiveContent(content)\` | Replace content of the active tab (pushes to undo history). |  
| \`getTabContent(tab)\` | Get content of a specific tab ('html'/'css'/'js') without switching. |  
| \`setTabContent(tab, content)\` | Set content of a specific tab (pushes to undo history). |  
| \`setAllContents({html, css, js})\` | Set all three tabs at once (pushes to undo history). |  
| \`getAllContents()\` | Get \`{html, css, js}\` object with all tab contents. |  
| \`switchTab(tab)\` | Switch active tab ('html'/'css'/'js'). |  
| \`getActiveTab()\` | Get current tab name. |  
| \`getSelection()\` | Get currently selected text (or ''). |  
| \`getRange(from, to)\` | Get text between two \`{line, ch}\` positions. |  
| \`replaceRange(text, from, to)\` | Replace a specific range. |  
| \`insertAtCursor(text)\` | Insert text at current cursor position. |  
| \`replaceSelection(text)\` | Replace selected text. |  
| \`getWordAtCursor()\` | Get the word under cursor (CodeMirror range). |  
| \`getCursor()\` | Get cursor position \`{line, ch}\`. |  
| \`scrollTo(line, ch)\` | Scroll editor to a position. |  
| \`getMode()\` | Get editor mode ('htmlmixed'/'css'/'javascript'). |  
| \`lineCount()\` | Total number of lines. |  
| \`getLine(n)\` | Get content of line n (0-indexed). |  
| \`eachLine(fn)\` | Iterate all lines. |  
| \`undo()\` | Undo last change on active tab. |  
| \`redo()\` | Redo last undone change on active tab. |  
| \`getUndoRedoState()\` | Get \`{htmlIndex, htmlTotal, cssIndex, cssTotal, jsIndex, jsTotal}\`. |  
| \`clearHistory()\` | Clear all undo/redo history (good after loading a file). |  
| \`setValueSilent(content)\` | Set content WITHOUT pushing to undo history. |  
| \`execCommand(name)\` | Run any CodeMirror command ('toggleComment', 'findPersistent', 'indentAuto', etc.). |  
| \`findNext()\` / \`findPrev()\` | Navigate search results. |  
| \`replace(query, replacement)\` | Find & replace. |  
| \`markText(from, to, options)\` | Highlight a range (e.g. \`{className: 'highlight'}\`). |  
| \`setBookmark(pos, options)\` | Drop a cursor bookmark. |  
| \`refresh()\` | Force CodeMirror to re-measure after layout changes. |  
| \`getContainer()\` | Get the editor's DOM wrapper element. |  
| \`focus()\` | Focus the editor. |

\---

\#\#\# \`studio.preview\` — Live Preview

| Method | Description |  
|---|---|  
| \`init()\` | Initialize preview. Called once by \`studio.init()\`. |  
| \`render()\` | Render all tabs into the preview iframe. |  
| \`buildCombinedHtml()\` | Build standalone HTML string from all tabs. |  
| \`exportAsFile(filename)\` | Download combined HTML as a file. |  
| \`exportToClipboard()\` | Copy combined HTML to clipboard. |

\---

\#\#\# \`studio.vault\` — File Save/Load (OPFS)

| Method | Description |  
|---|---|  
| \`init()\` | Initialize OPFS vault. Called once by \`studio.init()\`. |  
| \`isAvailable()\` | Check if OPFS is supported. |  
| \`saveFile(name, content?)\` | Save to vault. Builds combined HTML if no content given. |  
| \`loadFile(name)\` | Load from vault. Parses back into all tabs. |  
| \`deleteFile(name)\` | Delete a file from vault. |  
| \`renameFile(oldName, newName)\` | Rename a file in vault. |  
| \`listFiles()\` | List all saved files. |  
| \`getRecentFiles()\` | Get recent file names (up to 10). |  
| \`getLastOpenedFile()\` | Get last opened file name. |  
| \`loadLastOpened()\` | Load the most recently opened file. |

\---

\#\#\# \`studio.templates\` — Starter Templates

| Method | Description |  
|---|---|  
| \`getAll()\` | Get all templates. |  
| \`getById(id)\` | Find template by ID. |  
| \`getByCategory(category)\` | Get templates by category. |  
| \`getCategories()\` | Get all unique category names. |  
| \`applyTemplate(id)\` | Apply a template (sets all tabs, switches to HTML). |

\---

\#\#\# \`studio.snippets\` — Code Snippets

| Method | Description |  
|---|---|  
| \`getAll()\` | Get all snippets. |  
| \`search(query)\` | Search snippets by keyword. |  
| \`getByTag(tag)\` | Get snippets by tag ('html'/'css'/'js'). |  
| \`insertById(snippetId)\` | Insert a snippet at cursor by ID. |  
| \`insertCode(code)\` | Insert raw code at cursor. |

\---

\#\#\# \`studio.smartbar\` — Command Palette

| Method | Description |  
|---|---|  
| \`init()\` | Initialize smartbar. Called once by \`studio.init()\`. |  
| \`open()\` | Open the command palette. |  
| \`close()\` | Close the command palette. |

\---

\#\#\# \`studio.themer\` — CSS Generator

| Method | Description |  
|---|---|  
| \`init()\` | Initialize themer. Called once by \`studio.init()\`. |

\---

\#\#\# \`studio.imagePanel\` — Image Manager

| Method | Description |  
|---|---|  
| \`init()\` | Initialize image panel. Called once by \`studio.init()\`. |

\---

\#\#\# \`studio.status\` — Status Reporting

| Method | Description |  
|---|---|  
| \`onStatus(cb)\` | Set callback: \`(level, msg) \=\> void\`. Level is 'ok'/'warning'/'error'. |  
| \`report(level, msg)\` | Report a status message. |

\---

\#\#\# \`studio.file\` — File State

| Method | Description |  
|---|---|  
| \`getCurrentFile()\` | Get current file name (or null). |  
| \`setCurrentFile(name)\` | Set current file name. |  
| \`isDirty()\` | Check for unsaved changes. |  
| \`markClean()\` | Mark as saved. |

\---

\#\#\# \`studio\` (top-level)

| Method | Description |  
|---|---|  
| \`init()\` | Initialize all modules. Call once after creation. |  
| \`getTabContents()\` | Convenience: same as \`editor.getAllContents()\`. |

\---

\*\*Key behaviors:\*\*  
\- All editor changes (user or AI) auto-save to \`localStorage\` and re-render the preview  
\- Undo history is 50 steps per tab, shared between user and AI  
\- \`setValueSilent()\` and \`clearHistory()\` prevent AI operations from polluting undo  
\- The preview iframe uses \`srcdoc\` so there are no cross-origin issues  
\- Everything is the same shared workspace — no separate containers or sandboxes  
