/* ============================================================
   SmarTools HTML Studio — Themer Module
   Visual CSS style panel with:
   - Target element selector
   - Color pickers (text, bg, accent, link, border, shadow)
   - Typography (font, size, weight, spacing, align, transform)
   - Borders (width, color, style, radius)
   - Spacing (padding, margin)
   - Shadow (x, y, blur, spread, color, opacity)
   - Gradient backgrounds (linear/radial, colors, angle)
   - Opacity
   - Live CSS output with copy & apply
   ============================================================ */

/* ── State ──────────────────────────────────────────────────── */
const _state = {
  target: 'body',
  customTarget: '',
  // Colors
  colorText:    '#333333',
  colorBg:      '#ffffff',
  colorAccent:  '#b8860b',
  colorLink:    '#1a73e8',
  colorBorder:  '#dddddd',
  colorShadow:  '#000000',
  // Typography
  fontFamily:   'system-ui, sans-serif',
  fontSize:     16,
  lineHeight:   160,
  fontWeight:   400,
  letterSpacing:0,
  textAlign:    'left',
  textTransform:'none',
  // Borders
  borderWidth:  0,
  borderStyle:  'none',
  borderRadius: 0,
  // Spacing
  padding:      0,
  margin:       0,
  // Shadow
  shadowX:      0,
  shadowY:      4,
  shadowBlur:   12,
  shadowSpread: 0,
  shadowOpacity:10,
  // Gradient
  gradientType: 'none',
  gradStart:    '#1a1a1a',
  gradEnd:      '#4a4a5a',
  gradAngle:    135,
  // Opacity
  opacity:      100,
  // Filters
  filterBlur:       0,
  filterBrightness:  100,
  filterContrast:   100,
  filterGrayscale:  0,
  filterHueRotate:  0,
  filterInvert:     0,
  filterOpacity:    100,
  filterSaturate:   100,
  filterSepia:      0,
};

let _setCssContent = null;

/* ── Init ───────────────────────────────────────────────────── */
export function initThemer({ setCssContent }) {
  _setCssContent = setCssContent;

  // Toggle panel
  document.getElementById('btn-themer').addEventListener('click', _togglePanel);
  document.getElementById('themer-close').addEventListener('click', _closePanel);
  document.getElementById('themer-backdrop').addEventListener('click', _closePanel);

  // Target selector
  document.getElementById('themer-target').addEventListener('change', _onTargetChange);
  document.getElementById('themer-custom-target').addEventListener('input', _onCustomTarget);

  // Color pickers
  _bindColor('text');
  _bindColor('bg');
  _bindColor('accent');
  _bindColor('link');
  _bindColor('border');
  _bindColor('shadow');

  // Typography
  document.getElementById('themer-font-family').addEventListener('change', _onPropChange);
  _bindRange('fontSize', 'px');
  _bindRange('lineHeight', '', v => (v / 100).toFixed(1));
  document.getElementById('themer-font-weight').addEventListener('change', _onPropChange);
  _bindRange('letterSpacing', 'px');

  // Text align buttons
  document.querySelectorAll('.themer-align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.themer-align-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _state.textAlign = btn.dataset.align;
      _generate();
    });
  });

  document.getElementById('themer-text-transform').addEventListener('change', _onPropChange);

  // Borders
  _bindRange('borderWidth', 'px');
  document.getElementById('themer-border-style').addEventListener('change', _onPropChange);
  _bindRange('borderRadius', 'px');

  // Spacing
  _bindRange('padding', 'px');
  _bindRange('margin', 'px');

  // Shadow
  _bindRange('shadowX', 'px');
  _bindRange('shadowY', 'px');
  _bindRange('shadowBlur', 'px');
  _bindRange('shadowSpread', 'px');
  _bindRange('shadowOpacity', '%');

  // Gradient
  document.getElementById('themer-gradient-type').addEventListener('change', _onGradientType);
  _bindColor('gradStart');
  _bindColor('gradEnd');
  _bindRange('gradAngle', '°');

  // Opacity
  _bindRange('opacity', '%');

  // Filters
  _bindFilter('filterBlur', 'px');
  _bindFilter('filterBrightness', '%');
  _bindFilter('filterContrast', '%');
  _bindFilter('filterSaturate', '%');
  _bindFilter('filterGrayscale', '%');
  _bindFilter('filterHue', '°');
  _bindFilter('filterInvert', '%');
  _bindFilter('filterSepia', '%');
  _bindFilter('filterOpacity', '%');

  // Preset Palettes
  _renderPalettes();

  // Action buttons
  document.getElementById('themer-copy-css').addEventListener('click', _copyCss);
  document.getElementById('themer-apply-css').addEventListener('click', _applyCss);
  document.getElementById('themer-reset').addEventListener('click', _resetAll);
}

/* ── Panel Open / Close ─────────────────────────────────────── */
function _togglePanel() {
  const panel = document.getElementById('themer-panel');
  const backdrop = document.getElementById('themer-backdrop');
  if (panel.classList.contains('open')) {
    _closePanel();
  } else {
    panel.classList.add('open');
    panel.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('visible'));
  }
}

function _closePanel() {
  const panel = document.getElementById('themer-panel');
  const backdrop = document.getElementById('themer-backdrop');
  panel.classList.remove('open');
  backdrop.classList.remove('visible');
  setTimeout(() => {
    panel.hidden = true;
    backdrop.hidden = true;
  }, 250);
}

/* ── Target Element ─────────────────────────────────────────── */
function _onTargetChange() {
  const sel = document.getElementById('themer-target');
  const customInput = document.getElementById('themer-custom-target');
  if (sel.value === 'custom') {
    customInput.hidden = false;
    _state.target = customInput.value || '';
  } else {
    customInput.hidden = true;
    _state.target = sel.value;
  }
  _generate();
}

function _onCustomTarget() {
  _state.target = document.getElementById('themer-custom-target').value || '';
  _generate();
}

/* ── Color Binding ──────────────────────────────────────────── */
function _bindColor(key) {
  const picker = document.getElementById(`themer-color-${key}`);
  const hex = document.getElementById(`themer-color-${key}-hex`);
  if (!picker || !hex) return;

  picker.addEventListener('input', () => {
    hex.value = picker.value;
    _state[`color${_cap(key)}`] = picker.value;
    _generate();
  });

  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
      picker.value = hex.value;
      _state[`color${_cap(key)}`] = hex.value;
      _generate();
    }
  });
}

/* ── Range Binding ──────────────────────────────────────────── */
function _bindRange(key, unit, formatter) {
  const slider = document.getElementById(`themer-${_camelToKebab(key)}`);
  const display = document.getElementById(`themer-${_camelToKebab(key)}-val`);
  if (!slider) return;

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    _state[key] = val;
    if (display) {
      display.textContent = formatter ? formatter(val) : `${val}${unit}`;
    }
    _generate();
  });
}

/* ── Generic Prop Change ────────────────────────────────────── */
function _onPropChange(e) {
  const id = e.target.id.replace('themer-', '');
  const key = _kebabToCamel(id);
  _state[key] = e.target.value;
  _generate();
}

/* ── Gradient Type ──────────────────────────────────────────── */
function _onGradientType() {
  const type = document.getElementById('themer-gradient-type').value;
  const controls = document.getElementById('themer-gradient-controls');
  _state.gradientType = type;
  controls.hidden = type === 'none';
  _generate();
}

/* ── Generate CSS ───────────────────────────────────────────── */
function _generate() {
  const s = _state;
  const selector = s.target || 'body';
  const lines = [];

  // Text color
  if (s.colorText && s.colorText !== '#333333') {
    lines.push(`color: ${s.colorText};`);
  }

  // Background (gradient or solid)
  if (s.gradientType === 'linear') {
    lines.push(`background: linear-gradient(${s.gradAngle}deg, ${s.gradStart}, ${s.gradEnd});`);
  } else if (s.gradientType === 'radial') {
    lines.push(`background: radial-gradient(circle, ${s.gradStart}, ${s.gradEnd});`);
  } else if (s.colorBg && s.colorBg !== '#ffffff') {
    lines.push(`background-color: ${s.colorBg};`);
  }

  // Typography
  if (s.fontFamily && s.fontFamily !== 'system-ui, sans-serif') {
    lines.push(`font-family: ${s.fontFamily};`);
  }
  if (s.fontSize && s.fontSize !== 16) {
    lines.push(`font-size: ${s.fontSize}px;`);
  }
  if (s.lineHeight && s.lineHeight !== 160) {
    lines.push(`line-height: ${(s.lineHeight / 100).toFixed(1)};`);
  }
  if (s.fontWeight && s.fontWeight !== 400) {
    lines.push(`font-weight: ${s.fontWeight};`);
  }
  if (s.letterSpacing && s.letterSpacing !== 0) {
    lines.push(`letter-spacing: ${s.letterSpacing}px;`);
  }
  if (s.textAlign && s.textAlign !== 'left') {
    lines.push(`text-align: ${s.textAlign};`);
  }
  if (s.textTransform && s.textTransform !== 'none') {
    lines.push(`text-transform: ${s.textTransform};`);
  }

  // Borders
  if (s.borderWidth && s.borderWidth > 0) {
    lines.push(`border: ${s.borderWidth}px ${s.borderStyle} ${s.colorBorder};`);
  }
  if (s.borderRadius && s.borderRadius > 0) {
    lines.push(`border-radius: ${s.borderRadius}px;`);
  }

  // Spacing
  if (s.padding && s.padding > 0) {
    lines.push(`padding: ${s.padding}px;`);
  }
  if (s.margin && s.margin > 0) {
    lines.push(`margin: ${s.margin}px;`);
  }

  // Shadow
  if (s.shadowX !== 0 || s.shadowY !== 4 || s.shadowBlur !== 12 || s.shadowSpread !== 0) {
    const alpha = (s.shadowOpacity / 100).toFixed(2);
    const shadowColor = _hexToRgba(s.colorShadow, alpha);
    lines.push(`box-shadow: ${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowSpread}px ${shadowColor};`);
  }

  // Filters
  const filters = _generateFilters();
  if (filters.length > 0) {
    lines.push(`filter: ${filters.join(' ')};`);
  }

  // Opacity
  if (s.opacity < 100) {
    lines.push(`opacity: ${(s.opacity / 100).toFixed(2)};`);
  }

  // Build output
  const css = lines.length > 0
    ? `${selector} {\n  ${lines.join('\n  ')}\n}`
    : `/* Select a target element and adjust properties to generate CSS */`;

  const output = document.getElementById('themer-css-output');
  if (output) output.textContent = css;
}

/* ── Copy CSS ───────────────────────────────────────────────── */
function _copyCss() {
  const css = document.getElementById('themer-css-output').textContent;
  navigator.clipboard.writeText(css).then(() => {
    const btn = document.getElementById('themer-copy-css');
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = '⎘ Copy CSS'; }, 1500);
  });
}

/* ── Apply CSS to Editor ────────────────────────────────────── */
function _applyCss() {
  const css = document.getElementById('themer-css-output').textContent;
  if (css.startsWith('/*')) return;
  if (_setCssContent) {
    _setCssContent(css);
  }
}

/* ── Reset All ──────────────────────────────────────────────── */
function _resetAll() {
  _state.colorText    = '#333333';
  _state.colorBg      = '#ffffff';
  _state.colorAccent  = '#b8860b';
  _state.colorLink    = '#1a73e8';
  _state.colorBorder  = '#dddddd';
  _state.colorShadow  = '#000000';
  _state.fontFamily   = 'system-ui, sans-serif';
  _state.fontSize     = 16;
  _state.lineHeight   = 160;
  _state.fontWeight   = 400;
  _state.letterSpacing= 0;
  _state.textAlign    = 'left';
  _state.textTransform= 'none';
  _state.borderWidth  = 0;
  _state.borderStyle  = 'none';
  _state.borderRadius = 0;
  _state.padding      = 0;
  _state.margin       = 0;
  _state.shadowX      = 0;
  _state.shadowY      = 4;
  _state.shadowBlur   = 12;
  _state.shadowSpread = 0;
  _state.shadowOpacity= 10;
  _state.gradientType = 'none';
  _state.gradStart    = '#1a1a1a';
  _state.gradEnd      = '#4a4a5a';
  _state.gradAngle    = 135;
  _state.opacity      = 100;
  _state.filterBlur       = 0;
  _state.filterBrightness = 100;
  _state.filterContrast   = 100;
  _state.filterGrayscale  = 0;
  _state.filterHueRotate  = 0;
  _state.filterInvert     = 0;
  _state.filterOpacity    = 100;
  _state.filterSaturate   = 100;
  _state.filterSepia      = 0;

  // Reset all UI controls
  _resetControl('themer-color-text', '#333333');
  _resetControl('themer-color-bg', '#ffffff');
  _resetControl('themer-color-accent', '#b8860b');
  _resetControl('themer-color-link', '#1a73e8');
  _resetControl('themer-color-border', '#dddddd');
  _resetControl('themer-color-shadow', '#000000');
  _resetControl('themer-font-family', 'system-ui, sans-serif');
  _resetControl('themer-font-size', 16);
  _resetControl('themer-line-height', 160);
  _resetControl('themer-font-weight', 400);
  _resetControl('themer-letter-spacing', 0);
  _resetControl('themer-text-transform', 'none');
  _resetControl('themer-border-width', 0);
  _resetControl('themer-border-style', 'none');
  _resetControl('themer-border-radius', 0);
  _resetControl('themer-padding', 0);
  _resetControl('themer-margin', 0);
  _resetControl('themer-shadow-x', 0);
  _resetControl('themer-shadow-y', 4);
  _resetControl('themer-shadow-blur', 12);
  _resetControl('themer-shadow-spread', 0);
  _resetControl('themer-shadow-opacity', 10);
  _resetControl('themer-gradient-type', 'none');
  _resetControl('themer-grad-start', '#1a1a1a');
  _resetControl('themer-grad-end', '#4a4a5a');
  _resetControl('themer-grad-angle', 135);
  _resetControl('themer-opacity', 100);

  // Reset filter controls
  _resetControl('themer-filter-blur', 0);
  _resetControl('themer-filter-brightness', 100);
  _resetControl('themer-filter-contrast', 100);
  _resetControl('themer-filter-saturate', 100);
  _resetControl('themer-filter-grayscale', 0);
  _resetControl('themer-filter-hue', 0);
  _resetControl('themer-filter-invert', 0);
  _resetControl('themer-filter-sepia', 0);
  _resetControl('themer-filter-opacity', 100);

  // Reset text align buttons
  document.querySelectorAll('.themer-align-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.align === 'left');
  });

  // Hide gradient controls
  document.getElementById('themer-gradient-controls').hidden = true;

  // Reset range displays
  const rangeDisplays = {
    'themer-font-size-val': '16px',
    'themer-line-height-val': '1.6',
    'themer-letter-spacing-val': '0px',
    'themer-border-width-val': '0px',
    'themer-border-radius-val': '0px',
    'themer-padding-val': '0px',
    'themer-margin-val': '0px',
    'themer-shadow-x-val': '0px',
    'themer-shadow-y-val': '4px',
    'themer-shadow-blur-val': '12px',
    'themer-shadow-spread-val': '0px',
    'themer-shadow-opacity-val': '10%',
    'themer-grad-angle-val': '135°',
    'themer-opacity-val': '100%',
    'themer-filter-blur-val': '0px',
    'themer-filter-brightness-val': '100%',
    'themer-filter-contrast-val': '100%',
    'themer-filter-saturate-val': '100%',
    'themer-filter-grayscale-val': '0%',
    'themer-filter-hue-val': '0°',
    'themer-filter-invert-val': '0%',
    'themer-filter-sepia-val': '0%',
    'themer-filter-opacity-val': '100%',
  };
  for (const [id, val] of Object.entries(rangeDisplays)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  _generate();
}

function _resetControl(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'color') {
    el.value = value;
    // Also reset the hex text input
    const hexEl = document.getElementById(id + '-hex');
    if (hexEl) hexEl.value = value;
  } else {
    el.value = value;
  }
}

/* ── Helpers ────────────────────────────────────────────────── */
function _cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function _camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function _kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function _hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ── Filter Binding ─────────────────────────────────────────── */
function _bindFilter(key, unit) {
  const slider = document.getElementById(`themer-${_camelToKebab(key)}`);
  const display = document.getElementById(`themer-${_camelToKebab(key)}-val`);
  if (!slider) return;

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    _state[key] = val;
    if (display) display.textContent = `${val}${unit}`;
    _generate();
  });
}

/* ── Preset Palette Rendering ───────────────────────────────── */
function _renderPalettes() {
  const grid = document.getElementById('palette-grid');
  if (!grid) return;

  grid.innerHTML = PALETTES.map(p => `
    <div class="palette-card" data-palette="${p.id}" title="${p.label}">
      <div class="palette-swatch" style="background:${p.colors.bg};">
        <div class="palette-swatch-accent" style="background:${p.colors.accent};"></div>
        <div class="palette-swatch-text" style="background:${p.colors.text};"></div>
      </div>
      <div class="palette-label">${p.label}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.palette-card').forEach(card => {
    card.addEventListener('click', () => {
      const palette = PALETTES.find(p => p.id === card.dataset.palette);
      if (!palette) return;
      _applyPalette(palette);
    });
  });
}

function _applyPalette(palette) {
  const c = palette.colors;
  _state.colorText   = c.text;
  _state.colorBg     = c.bg;
  _state.colorAccent = c.accent;
  _state.colorLink   = c.link;
  _state.colorBorder = c.border;

  // Update UI controls
  _resetControl('themer-color-text', c.text);
  _resetControl('themer-color-bg', c.bg);
  _resetControl('themer-color-accent', c.accent);
  _resetControl('themer-color-link', c.link);
  _resetControl('themer-color-border', c.border);

  _generate();
}

/* ── Filter CSS Generation ──────────────────────────────────── */
function _generateFilters() {
  const s = _state;
  const filters = [];

  if (s.filterBlur > 0)       filters.push(`blur(${s.filterBlur}px)`);
  if (s.filterBrightness !== 100) filters.push(`brightness(${s.filterBrightness}%)`);
  if (s.filterContrast !== 100)   filters.push(`contrast(${s.filterContrast}%)`);
  if (s.filterGrayscale > 0)     filters.push(`grayscale(${s.filterGrayscale}%)`);
  if (s.filterHueRotate > 0)     filters.push(`hue-rotate(${s.filterHueRotate}deg)`);
  if (s.filterInvert > 0)        filters.push(`invert(${s.filterInvert}%)`);
  if (s.filterOpacity < 100)     filters.push(`opacity(${s.filterOpacity}%)`);
  if (s.filterSaturate !== 100)  filters.push(`saturate(${s.filterSaturate}%)`);
  if (s.filterSepia > 0)         filters.push(`sepia(${s.filterSepia}%)`);

  return filters;
}

/* ── Preset Color Palettes ──────────────────────────────────── */
const PALETTES = [
  {
    id: 'midnight',
    label: '🌙 Midnight',
    colors: { text: '#e8e8e8', bg: '#1a1a2e', accent: '#e94560', link: '#0f3460', border: '#16213e' },
  },
  {
    id: 'forest',
    label: '🌲 Forest',
    colors: { text: '#2d3436', bg: '#f0fff4', accent: '#00b894', link: '#00cec9', border: '#b2bec3' },
  },
  {
    id: 'sunset',
    label: '🌅 Sunset',
    colors: { text: '#2d1b2e', bg: '#fff5f0', accent: '#e17055', link: '#fd79a8', border: '#ffeaa7' },
  },
  {
    id: 'ocean',
    label: '🌊 Ocean',
    colors: { text: '#1a1a2e', bg: '#f0f8ff', accent: '#0984e3', link: '#74b9ff', border: '#dfe6e9' },
  },
  {
    id: 'lavender',
    label: '💜 Lavender',
    colors: { text: '#2d2d44', bg: '#f5f0ff', accent: '#6c5ce7', link: '#a29bfe', border: '#dcd6f7' },
  },
  {
    id: 'gold',
    label: '✨ Gold & Slate',
    colors: { text: '#e8e8e8', bg: '#1a1a1a', accent: '#d4a843', link: '#b8860b', border: '#4a4a5a' },
  },
  {
    id: 'paper',
    label: '📜 Paper',
    colors: { text: '#3d3d3d', bg: '#faf8f5', accent: '#c0392b', link: '#2980b9', border: '#d5d0c8' },
  },
  {
    id: 'neon',
    label: '⚡ Neon',
    colors: { text: '#ffffff', bg: '#0a0a0a', accent: '#00ff88', link: '#ff00ff', border: '#333333' },
  },
  {
    id: 'pastel',
    label: '🍬 Pastel',
    colors: { text: '#555555', bg: '#fefefe', accent: '#ff6b9d', link: '#c44dff', border: '#e8e8e8' },
  },
  {
    id: 'earth',
    label: '🏔 Earth',
    colors: { text: '#3e2723', bg: '#f5f0e8', accent: '#8d6e63', link: '#a1887f', border: '#d7ccc8' },
  },
];
