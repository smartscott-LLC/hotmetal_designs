/* ============================================================
   SmarTools HTML Studio — OPFS Vault Module
   Manages HTML project files in OPFS with localStorage fallback.

   Important behavior:
     • Uses OPFS when available.
     • Falls back to localStorage if OPFS is unsupported/blocked.
     • Never allows OPFS init to hang the app indefinitely.
     • Keeps the same exported API expected by studio-controller.js.
   ============================================================ */

const FILE_EXT = '.html';

const VAULT_META_KEY = 'htmlstudio-vault-meta';
const RECENT_FILES_KEY = 'htmlstudio-recent-files';
const LAST_OPENED_KEY = 'htmlstudio-last-opened';

const FILE_PREFIX = 'htmlstudio-vault-file:';
const FILE_META_PREFIX = 'htmlstudio-vault-file-meta:';

/** @type {'opfs'|'localStorage'|null} */
let _backend = null;

/** @type {FileSystemDirectoryHandle|null} */
let _rootHandle = null;

let _initToken = 0;

/** @type {boolean|null} */
let _localStorageAvailable = null;

/* ============================================================
   Init
   ============================================================ */

/**
 * Initialise the vault.
 *
 * @param {{ timeoutMs?: number }} [opts]
 * @returns {Promise<boolean>} true if a usable vault backend is ready
 */
export async function initVault(opts = {}) {
  if (_backend === 'opfs' && _rootHandle) {
    return true;
  }

  if (_backend === 'localStorage') {
    return localStorageAvailable();
  }

  const timeoutMs = opts.timeoutMs ?? 1500;

  if (!opfsSupported()) {
    useLocalStorageBackend('OPFS is not supported in this browser/context');
    return _backend === 'localStorage';
  }

  const token = ++_initToken;

  const opfsAttempt = navigator.storage.getDirectory()
    .then((dir) => {
      if (token !== _initToken) {
        return _backend === 'opfs';
      }

      _rootHandle = dir;
      _backend = 'opfs';
      persistVaultMeta();

      console.info('[Vault] OPFS ready.');
      return true;
    })
    .catch((err) => {
      if (token !== _initToken) {
        return _backend === 'opfs';
      }

      useLocalStorageBackend(`OPFS init failed: ${err?.message || err}`);
      return _backend === 'localStorage';
    });

  const timeoutAttempt = new Promise((resolve) => {
    setTimeout(() => {
      if (token === _initToken) {
        _initToken++;
        useLocalStorageBackend(`OPFS init timed out after ${timeoutMs}ms`);
      }

      resolve(_backend === 'localStorage');
    }, timeoutMs);
  });

  return Promise.race([opfsAttempt, timeoutAttempt]);
}

/**
 * Returns true if the vault has any usable backend.
 */
export function isVaultAvailable() {
  return _backend !== null;
}

/**
 * Returns true only if OPFS is the active backend.
 */
export function isOPFSAvailable() {
  return _backend === 'opfs';
}

/**
 * Returns active backend: 'opfs', 'localStorage', or null.
 */
export function getBackend() {
  return _backend;
}

/**
 * Debug/status helper.
 */
export function getVaultStatus() {
  return {
    backend: _backend,
    opfsAvailable: opfsSupported(),
    usable: _backend !== null,
    hasRootHandle: !!_rootHandle,
  };
}

/* ============================================================
   Files
   ============================================================ */

/**
 * List all .html files in the vault.
 *
 * @returns {Promise<Array<{name: string, fullName: string, size: number, lastModified: number}>>}
 */
export async function listFiles() {
  if (_backend === 'opfs' && _rootHandle) {
    try {
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
          } catch (_) {
            // Skip unreadable files.
          }
        }
      }

      files.sort((a, b) => b.lastModified - a.lastModified);
      return files;
    } catch (err) {
      console.warn('[Vault] OPFS list failed; falling back to localStorage.', err);
      return listLocalStorageFiles();
    }
  }

  return listLocalStorageFiles();
}

/**
 * Save/create/overwrite a file.
 *
 * @param {string} name Plain name without extension
 * @param {string} content
 */
export async function saveFile(name, content) {
  const plainName = normaliseName(name);
  const safeName = sanitiseName(plainName) + FILE_EXT;
  const text = String(content ?? '');

  if (_backend === 'opfs' && _rootHandle) {
    try {
      const fileHandle = await _rootHandle.getFileHandle(safeName, { create: true });
      const writable = await fileHandle.createWritable();

      await writable.write(text);
      await writable.close();

      writeFileMeta(safeName, { size: text.length });
      setLastOpenedFile(plainName);

      return;
    } catch (err) {
      console.warn('[Vault] OPFS save failed; falling back to localStorage.', err);
      useLocalStorageBackend(`OPFS save failed: ${err?.message || err}`);
    }
  }

  if (_backend !== 'localStorage' && !useLocalStorageBackend('No vault backend active')) {
    throw new Error('No usable vault backend available');
  }

  localStorage.setItem(fileKey(safeName), text);
  writeFileMeta(safeName, { size: text.length });
  setLastOpenedFile(plainName);
}

/**
 * Load a file's content.
 *
 * @param {string} name Plain name without extension
 * @returns {Promise<string>}
 */
export async function loadFile(name) {
  const plainName = normaliseName(name);
  const safeName = sanitiseName(plainName) + FILE_EXT;

  if (_backend === 'opfs' && _rootHandle) {
    try {
      const fileHandle = await _rootHandle.getFileHandle(safeName);
      const file = await fileHandle.getFile();

      return file.text();
    } catch (err) {
      // If OPFS cannot find/read it, try localStorage fallback.
      const fallbackContent = localStorage.getItem(fileKey(safeName));

      if (fallbackContent !== null) {
        return fallbackContent;
      }

      throw new Error(`Vault file not found: ${plainName}`);
    }
  }

  if (_backend !== 'localStorage' && !useLocalStorageBackend('No vault backend active')) {
    throw new Error('No usable vault backend available');
  }

  const content = localStorage.getItem(fileKey(safeName));

  if (content === null) {
    throw new Error(`Vault file not found: ${plainName}`);
  }

  return content;
}

/**
 * Delete a file.
 *
 * @param {string} name Plain name without extension
 */
export async function deleteFile(name) {
  const plainName = normaliseName(name);
  const safeName = sanitiseName(plainName) + FILE_EXT;

  if (_backend === 'opfs' && _rootHandle) {
    try {
      await _rootHandle.removeEntry(safeName);
    } catch (_) {
      // Ignore NotFound-style errors.
    }
  }

  if (_backend === 'localStorage' || localStorageAvailable()) {
    localStorage.removeItem(fileKey(safeName));
    localStorage.removeItem(fileMetaKey(safeName));
  }

  removeRecentFile(plainName);
}

/**
 * Rename a file.
 *
 * @param {string} oldName
 * @param {string} newName
 */
export async function renameFile(oldName, newName) {
  const oldPlain = normaliseName(oldName);
  const newPlain = normaliseName(newName);

  if (!oldPlain || !newPlain) {
    throw new Error('Rename requires old and new file names');
  }

  if (oldPlain === newPlain) {
    return;
  }

  const content = await loadFile(oldPlain);
  await saveFile(newPlain, content);
  await deleteFile(oldPlain);
}

/* ============================================================
   Recent / last opened
   ============================================================ */

/**
 * Get the last opened file name.
 *
 * @returns {string|null}
 */
export function getLastOpenedFile() {
  return localStorage.getItem(LAST_OPENED_KEY);
}

/**
 * Set the last opened file name.
 *
 * @param {string} name
 */
export function setLastOpenedFile(name) {
  const plainName = normaliseName(name);
  if (!plainName) return;

  try {
    localStorage.setItem(LAST_OPENED_KEY, plainName);
  } catch (_) {
    // Ignore storage failures.
  }
}

/**
 * Get recent file names, up to 10.
 *
 * @returns {string[]}
 */
export function getRecentFiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === 'string' && item.trim()).slice(0, 10);
  } catch (_) {
    return [];
  }
}

/**
 * Add a file to the recent list.
 *
 * @param {string} name
 */
export function addRecentFile(name) {
  const plainName = normaliseName(name);
  if (!plainName) return;

  const recent = getRecentFiles().filter((item) => item !== plainName);
  recent.unshift(plainName);

  try {
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent.slice(0, 10)));
  } catch (_) {
    // Ignore storage failures.
  }
}

/**
 * Remove a file from the recent list.
 *
 * @param {string} name
 */
export function removeRecentFile(name) {
  const plainName = normaliseName(name);
  if (!plainName) return;

  const recent = getRecentFiles().filter((item) => item !== plainName);

  try {
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent));
  } catch (_) {
    // Ignore storage failures.
  }
}

/* ============================================================
   Helpers
   ============================================================ */

function opfsSupported() {
  const nav = globalThis.navigator;

  return (
    typeof window !== 'undefined' &&
    window.isSecureContext !== false &&
    !!nav &&
    typeof nav.storage?.getDirectory === 'function'
  );
}

function useLocalStorageBackend(reason) {
  if (!localStorageAvailable()) {
    _backend = null;
    _rootHandle = null;
    console.warn('[Vault] localStorage fallback unavailable.', reason);
    return false;
  }

  _backend = 'localStorage';
  _rootHandle = null;

  console.warn(`[Vault] ${reason}. Using localStorage fallback.`);
  persistVaultMeta();

  return true;
}

function localStorageAvailable() {
  if (_localStorageAvailable !== null) {
    return _localStorageAvailable;
  }

  try {
    const testKey = `${VAULT_META_KEY}:test`;
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);

    _localStorageAvailable = true;
    return true;
  } catch (_) {
    _localStorageAvailable = false;
    return false;
  }
}

function persistVaultMeta() {
  if (!localStorageAvailable()) return;

  try {
    localStorage.setItem(
      VAULT_META_KEY,
      JSON.stringify({
        backend: _backend,
        opfs: _backend === 'opfs',
        initializedAt: Date.now(),
      })
    );
  } catch (_) {
    // Ignore storage failures.
  }
}

function fileKey(safeName) {
  return `${FILE_PREFIX}${safeName}`;
}

function fileMetaKey(safeName) {
  return `${FILE_META_PREFIX}${safeName}`;
}

function readFileMeta(safeName) {
  try {
    return JSON.parse(localStorage.getItem(fileMetaKey(safeName)) || '{}') || {};
  } catch (_) {
    return {};
  }
}

function writeFileMeta(safeName, extra = {}) {
  if (!localStorageAvailable()) return;

  try {
    const existing = readFileMeta(safeName);

    localStorage.setItem(
      fileMetaKey(safeName),
      JSON.stringify({
        ...existing,
        ...extra,
        lastModified: Date.now(),
      })
    );
  } catch (_) {
    // Ignore storage failures.
  }
}

function listLocalStorageFiles() {
  const files = [];

  if (!localStorageAvailable()) {
    return files;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (!key || !key.startsWith(FILE_PREFIX)) {
      continue;
    }

    const safeName = key.slice(FILE_PREFIX.length);

    if (!safeName.endsWith(FILE_EXT)) {
      continue;
    }

    const content = localStorage.getItem(key) || '';
    const meta = readFileMeta(safeName);

    files.push({
      name: safeName.slice(0, -FILE_EXT.length),
      fullName: safeName,
      size: content.length,
      lastModified: Number(meta.lastModified) || 0,
    });
  }

  files.sort((a, b) => b.lastModified - a.lastModified);

  return files;
}

function sanitiseName(name) {
  const cleaned = String(name ?? '')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  return cleaned || 'untitled';
}

function normaliseName(name) {
  return String(name ?? '').trim();
}

