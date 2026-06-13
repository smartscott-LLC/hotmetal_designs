/* ============================================================
   SmarTools HTML Studio — OPFS Vault Module
   Manages HTML project files in the Origin Private File System.
   Files are stored as .html files (combined HTML/CSS/JS).
   ============================================================ */

const FILE_EXT = '.html';
const VAULT_META_KEY = 'htmlstudio-vault-meta';
const RECENT_FILES_KEY = 'htmlstudio-recent-files';
const LAST_OPENED_KEY = 'htmlstudio-last-opened';

/** @type {FileSystemDirectoryHandle|null} */
let _rootHandle = null;

/**
 * Initialise the OPFS root.
 * @returns {Promise<boolean>} true if OPFS is available
 */
export async function initVault() {
  if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
    console.warn('[Vault] OPFS not supported in this browser.');
    return false;
  }
  try {
    _rootHandle = await navigator.storage.getDirectory();
    return true;
  } catch (err) {
    console.error('[Vault] Failed to get OPFS root:', err);
    return false;
  }
}

/** @returns {boolean} */
export function isVaultAvailable() {
  return _rootHandle !== null;
}

/**
 * List all .html files in the vault.
 * @returns {Promise<Array<{name: string, size: number, lastModified: number}>>}
 */
export async function listFiles() {
  if (!_rootHandle) return [];
  const files = [];
  for await (const [name, handle] of _rootHandle.entries()) {
    if (handle.kind === 'file' && name.endsWith(FILE_EXT)) {
      try {
        const file = await handle.getFile();
        files.push({
          name: name.slice(0, -FILE_EXT.length),
          fullName: name,
          size: file.size,
          lastModified: file.lastModified,
        });
      } catch (_) { /* skip */ }
    }
  }
  files.sort((a, b) => b.lastModified - a.lastModified);
  return files;
}

/**
 * Save (create or overwrite) a file.
 * @param {string} name   Plain name without extension
 * @param {string} content
 */
export async function saveFile(name, content) {
  if (!_rootHandle) throw new Error('Vault not initialised');
  const safeName = sanitiseName(name) + FILE_EXT;
  const fileHandle = await _rootHandle.getFileHandle(safeName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  setLastOpenedFile(name);
}

/**
 * Load a file's content.
 * @param {string} name  Plain name without extension
 * @returns {Promise<string>}
 */
export async function loadFile(name) {
  if (!_rootHandle) throw new Error('Vault not initialised');
  const safeName = sanitiseName(name) + FILE_EXT;
  const fileHandle = await _rootHandle.getFileHandle(safeName);
  const file = await fileHandle.getFile();
  return file.text();
}

/**
 * Delete a file.
 * @param {string} name  Plain name without extension
 */
export async function deleteFile(name) {
  if (!_rootHandle) throw new Error('Vault not initialised');
  const safeName = sanitiseName(name) + FILE_EXT;
  await _rootHandle.removeEntry(safeName);
}

/**
 * Rename a file.
 * @param {string} oldName
 * @param {string} newName
 */
export async function renameFile(oldName, newName) {
  if (!_rootHandle) throw new Error('Vault not initialised');
  const content = await loadFile(oldName);
  await saveFile(newName, content);
  await deleteFile(oldName);
}

/**
 * Get the last opened file name.
 * @returns {string|null}
 */
export function getLastOpenedFile() {
  return localStorage.getItem(LAST_OPENED_KEY);
}

/**
 * Set the last opened file name.
 * @param {string} name
 */
export function setLastOpenedFile(name) {
  localStorage.setItem(LAST_OPENED_KEY, name);
}

/**
 * Get recent file names (up to 10).
 * @returns {string[]}
 */
export function getRecentFiles() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]');
  } catch { return []; }
}

/**
 * Add a file to the recent list.
 * @param {string} name
 */
export function addRecentFile(name) {
  const recent = getRecentFiles().filter(n => n !== name);
  recent.unshift(name);
  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent.slice(0, 10)));
}

/**
 * Remove a file from the recent list.
 * @param {string} name
 */
export function removeRecentFile(name) {
  const recent = getRecentFiles().filter(n => n !== name);
  localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent));
}

/**
 * Sanitise a file name.
 * @param {string} name
 * @returns {string}
 */
function sanitiseName(name) {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'untitled';
}
