/* ============================================================
   SmarTools HTML Studio — Image Panel Module
   UI for the image manager slide-out panel.
   - Drag & drop upload
   - Thumbnail grid with selection
   - Insert image into HTML editor
   - Delete stored images
   - Storage usage display
   ============================================================ */

import {
  initImageVault,
  isImageVaultAvailable,
  listImages,
  storeImage,
  deleteImage,
  loadImageDataUrl,
  generateThumbnail,
  getStorageEstimate,
  getImagesStorageUsed,
  formatBytes,
} from './images.js';

let _isOpen = false;
let _selectedImage = null;
let _insertCallback = null;  // (html: string) => void

/* ── Init ───────────────────────────────────── */
export function initImagePanel({ insertImage }) {
  _insertCallback = insertImage;

  // Toggle button
  document.getElementById('btn-images').addEventListener('click', _togglePanel);
  document.getElementById('image-panel-close').addEventListener('click', _closePanel);
  document.getElementById('image-panel-backdrop').addEventListener('click', _closePanel);

  // Upload zone
  const zone = document.getElementById('image-upload-zone');
  const fileInput = document.getElementById('image-file-input');

  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    _handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', () => {
    _handleFiles(fileInput.files);
    fileInput.value = '';
  });

  // Action buttons
  document.getElementById('image-insert-btn').addEventListener('click', _insertSelected);
  document.getElementById('image-copy-url-btn').addEventListener('click', _copyImageUrl);
  document.getElementById('image-delete-btn').addEventListener('click', _deleteSelected);

  // Init vault and load images
  _initVault();
}

/* ── Vault Init ─────────────────────────────────────────────── */
async function _initVault() {
  const ok = await initImageVault();
  if (ok) {
    await _refreshImages();
    await _updateStorage();
  }
}

/* ── Panel Open / Close ─────────────────────────────────────── */
function _togglePanel() {
  if (_isOpen) {
    _closePanel();
  } else {
    _openPanel();
  }
}

function _openPanel() {
  _isOpen = true;
  const panel = document.getElementById('image-panel');
  const backdrop = document.getElementById('image-panel-backdrop');
  panel.classList.add('open');
  panel.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('visible'));
  _refreshImages();
  _updateStorage();
}

export function _closePanel() {
  _isOpen = false;
  const panel = document.getElementById('image-panel');
  const backdrop = document.getElementById('image-panel-backdrop');
  panel.classList.remove('open');
  backdrop.classList.remove('visible');
  setTimeout(() => {
    panel.hidden = true;
    backdrop.hidden = true;
  }, 250);
}

/* ── Handle File Upload ─────────────────────────────────────── */
async function _handleFiles(fileList) {
  const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;

  for (const file of files) {
    try {
      await storeImage(file);
    } catch (err) {
      console.error('[Images] Failed to store:', file.name, err);
    }
  }

  await _refreshImages();
  await _updateStorage();
}

/* ── Refresh Image Grid ─────────────────────────────────────── */
async function _refreshImages() {
  const images = await listImages();
  const grid = document.getElementById('image-grid');
  const empty = document.getElementById('image-grid-empty');
  const count = document.getElementById('image-count');

  count.textContent = `(${images.length})`;

  // Clear existing thumbnails (keep empty msg)
  grid.querySelectorAll('.image-thumb').forEach(el => el.remove());

  if (images.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  for (const img of images) {
    const thumb = document.createElement('div');
    thumb.className = 'image-thumb';
    thumb.dataset.name = img.name;

    // Generate thumbnail
    try {
      const thumbUrl = await generateThumbnail(img.name, 120);
      const imgEl = document.createElement('img');
      imgEl.src = thumbUrl || '';
      imgEl.alt = img.name;
      thumb.appendChild(imgEl);
    } catch {
      // Fallback: show file type icon
      thumb.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:24px;">🖼️</div>`;
    }

    // Name label
    const nameLabel = document.createElement('div');
    nameLabel.className = 'image-thumb-name';
    nameLabel.textContent = img.name;
    thumb.appendChild(nameLabel);

    // Click to select
    thumb.addEventListener('click', () => _selectImage(img.name, thumb));

    grid.appendChild(thumb);
  }
}

/* ── Select Image ───────────────────────────────────────────── */
function _selectImage(name, thumbEl) {
  // Deselect previous
  document.querySelectorAll('.image-thumb.selected').forEach(el => el.classList.remove('selected'));
  thumbEl.classList.add('selected');
  _selectedImage = name;

  // Show actions
  const actions = document.getElementById('image-actions');
  actions.hidden = false;
  document.getElementById('image-selected-name').textContent = name;

  // Load meta
  _loadImageMeta(name);
}

async function _loadImageMeta(name) {
  const images = await listImages();
  const img = images.find(i => i.name === name);
  if (!img) return;

  const meta = document.getElementById('image-meta');
  meta.innerHTML = `
    <div>Type: ${img.type}</div>
    <div>Size: ${formatBytes(img.size)}</div>
    <div>Modified: ${new Date(img.lastModified).toLocaleDateString()}</div>
  `;
}

/* ── Insert Image ───────────────────────────────────────────── */
function _insertSelected() {
  if (!_selectedImage || !_insertCallback) return;
  const name = _selectedImage;
  const html = `<img src="images/${name}" alt="${name}" />`;
  _insertCallback(html);
}

/* ── Copy Image URL ─────────────────────────────────────────── */
function _copyImageUrl() {
  if (!_selectedImage) return;
  const url = `images/${_selectedImage}`;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('image-copy-url-btn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = '⎘ Copy as URL'; }, 1500);
  });
}

/* ── Delete Image ───────────────────────────────────────────── */
async function _deleteSelected() {
  if (!_selectedImage) return;
  if (!confirm(`Delete "${_selectedImage}"?`)) return;

  try {
    await deleteImage(_selectedImage);
    _selectedImage = null;
    document.getElementById('image-actions').hidden = true;
    await _refreshImages();
    await _updateStorage();
  } catch (err) {
    console.error('[Images] Failed to delete:', err);
  }
}

/* ── Update Storage Display ─────────────────────────────────── */
async function _updateStorage() {
  const used = await getImagesStorageUsed();
  const estimate = await getStorageEstimate();

  document.getElementById('image-storage-used').textContent = formatBytes(used);

  const totalEl = document.getElementById('image-storage-total');
  if (estimate.quota) {
    totalEl.textContent = ` / ${formatBytes(estimate.quota)} total`;
  }

  const fill = document.getElementById('image-storage-fill');
  if (estimate.quota) {
    const pct = Math.min((used / estimate.quota) * 100, 100);
    fill.style.width = `${pct}%`;
  } else {
    fill.style.width = '0%';
  }
}
