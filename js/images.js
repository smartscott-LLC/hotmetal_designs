/* ============================================================
   SmarTools HTML Studio — Image Vault Module
   Manages image files in OPFS under /images directory.
   - Copy uploaded images into app storage
   - List, delete, rename stored images
   - Track storage usage
   - Generate thumbnail previews
   ============================================================ */

const IMAGES_DIR = 'images';
const THUMB_SIZE = 120;

/** @type {FileSystemDirectoryHandle|null} */
let _imagesDir = null;

let _onImagesChange = null;  // callback when image list changes

/* ── Init ───────────────────────────────────────────────────── */
export async function initImages({ onImagesChange } = {}) {
  _onImagesChange = onImagesChange || null;
  return _ensureImagesDir();
}

function _ensureImagesDir() {
  if (!_rootDir) return false;
  // We'll get the images dir lazily on first use
  return true;
}

/** @type {FileSystemDirectoryHandle|null} */
let _rootDir = null;

export async function initImageVault() {
  if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) {
    return false;
  }
  try {
    _rootDir = await navigator.storage.getDirectory();
    // Ensure /images subdirectory exists
    _imagesDir = await _rootDir.getDirectoryHandle(IMAGES_DIR, { create: true });
    return true;
  } catch (err) {
    console.error('[Images] Failed to init image vault:', err);
    return false;
  }
}

export function isImageVaultAvailable() {
  return _imagesDir !== null;
}

/* ── List Images ────────────────────────────────────────────── */
export async function listImages() {
  if (!_imagesDir) return [];
  const images = [];
  for await (const [name, handle] of _imagesDir.entries()) {
    if (handle.kind === 'file') {
      try {
        const file = await handle.getFile();
        const isImage = file.type.startsWith('image/');
        images.push({
          name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          isImage,
        });
      } catch (_) { /* skip */ }
    }
  }
  images.sort((a, b) => b.lastModified - a.lastModified);
  return images;
}

/* ── Store Image ────────────────────────────────────────────── */
export async function storeImage(file) {
  if (!_imagesDir) throw new Error('Image vault not initialised');

  // Validate it's an image
  if (!file.type.startsWith('image/')) {
    throw new Error(`File type "${file.type}" is not an image`);
  }

  // Sanitize filename
  const safeName = _sanitizeFilename(file.name);
  const uniqueName = await _uniqueName(safeName);

  // Write file
  const fileHandle = await _imagesDir.getFileHandle(uniqueName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();

  if (_onImagesChange) _onImagesChange();
  return uniqueName;
}

/* ── Store Image from ArrayBuffer (for clipboard paste) ─────── */
export async function storeImageBuffer(buffer, mimeType, suggestedName) {
  if (!_imagesDir) throw new Error('Image vault not initialised');

  const ext = _mimeToExt(mimeType);
  const name = _sanitizeFilename(suggestedName || `image${ext}`);
  const uniqueName = await _uniqueName(name);

  const fileHandle = await _imagesDir.getFileHandle(uniqueName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(buffer);
  await writable.close();

  if (_onImagesChange) _onImagesChange();
  return uniqueName;
}

/* ── Delete Image ───────────────────────────────────────────── */
export async function deleteImage(name) {
  if (!_imagesDir) throw new Error('Image vault not initialised');
  await _imagesDir.removeEntry(name);
  if (_onImagesChange) _onImagesChange();
}

/* ── Rename Image ───────────────────────────────────────────── */
export async function renameImage(oldName, newName) {
  if (!_imagesDir) throw new Error('Image vault not initialised');
  const safeName = await _uniqueName(_sanitizeFilename(newName));
  const content = await loadImageRaw(oldName);
  const fileHandle = await _imagesDir.getFileHandle(safeName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  await _imagesDir.removeEntry(oldName);
  if (_onImagesChange) _onImagesChange();
  return safeName;
}

/* ── Load Image as Data URL (for preview) ───────────────────── */
export async function loadImageDataUrl(name) {
  if (!_imagesDir) return null;
  try {
    const fileHandle = await _imagesDir.getFileHandle(name);
    const file = await fileHandle.getFile();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  } catch {
    return null;
  }
}

/* ── Load Image Raw (for rename/copy) ───────────────────────── */
export async function loadImageRaw(name) {
  if (!_imagesDir) return null;
  const fileHandle = await _imagesDir.getFileHandle(name);
  const file = await fileHandle.getFile();
  return file.arrayBuffer();
}

/* ── Get Image as File Object ───────────────────────────────── */
export async function getImageFile(name) {
  if (!_imagesDir) return null;
  const fileHandle = await _imagesDir.getFileHandle(name);
  return fileHandle.getFile();
}

/* ── Generate Thumbnail ─────────────────────────────────────── */
export async function generateThumbnail(name, size = THUMB_SIZE) {
  const dataUrl = await loadImageDataUrl(name);
  if (!dataUrl) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(size / img.width, size / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/* ── Storage Info ───────────────────────────────────────────── */
export async function getStorageEstimate() {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    return { used: 0, quota: 0 };
  }
  return navigator.storage.estimate();
}

export async function getImagesStorageUsed() {
  const images = await listImages();
  return images.reduce((sum, img) => sum + img.size, 0);
}

/* ── Helpers ────────────────────────────────────────────────── */
function _sanitizeFilename(name) {
  // Remove path separators and weird chars, keep extension
  const parts = name.split('.');
  const ext = parts.length > 1 ? '.' + parts.pop() : '';
  const base = parts.join('.').replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim() || 'image';
  return base + ext;
}

async function _uniqueName(name) {
  if (!_imagesDir) return name;
  try {
    await _imagesDir.getFileHandle(name);
    // File exists, add timestamp
    const parts = name.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : '';
    const base = parts.join('.');
    return `${base}_${Date.now()}${ext}`;
  } catch {
    return name; // doesn't exist, name is unique
  }
}

function _mimeToExt(mime) {
  const map = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/avif': '.avif',
  };
  return map[mime] || '.png';
}

/* ── Format Bytes ───────────────────────────────────────────── */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
