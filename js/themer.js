/* ============================================================
   SmarTools HTML Studio — Themer Module
   Visual CSS style panel: colors, typography, borders, spacing,
   shadows, gradients, filters, palettes, layout, animations.
   ============================================================ */

const _state = {
  target: 'body', customTarget: '',
  colorText: '#333333', colorBg: '#ffffff', colorAccent: '#b8860b', colorLink: '#1a73e8', colorBorder: '#dddddd', colorShadow: '#000000',
  fontFamily: 'system-ui, sans-serif', fontSize: 16, lineHeight: 160, fontWeight: 400, letterSpacing: 0, textAlign: 'left', textTransform: 'none',
  borderWidth: 0, borderStyle: 'none', borderRadius: 0,
  padding: 0, margin: 0,
  shadowX: 0, shadowY: 4, shadowBlur: 12, shadowSpread: 0, shadowOpacity: 10,
  gradientType: 'none', gradStart: '#1a1a1a', gradEnd: '#4a4a5a', gradAngle: 135,
  opacity: 100,
  filterBlur: 0, filterBrightness: 100, filterContrast: 100, filterGrayscale: 0, filterHueRotate: 0, filterInvert: 0, filterOpacity: 100, filterSaturate: 100, filterSepia: 0,
  animEnabled: false, animName: 'myAnimation', animDuration: 1000, animTiming: 'ease', animDelay: 0, animIteration: 1, animDirection: 'normal', animFillMode: 'none',
  keyframes: [
    { offset: 0, props: { opacity: '1', transform: 'translateY(0)' } },
    { offset: 50, props: { opacity: '0.5', transform: 'translateY(-20px)' } },
    { offset: 100, props: { opacity: '1', transform: 'translateY(0)' } },
  ],
  layoutMode: 'none', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', flexGap: 0,
  gridCols: '1fr 1fr', gridRows: 'auto', gridGap: 16, gridAutoFlow: 'row',
  childFlexGrow: 0, childFlexShrink: 1, childFlexBasis: 'auto', childAlignSelf: 'auto', childOrder: 0,
};

let _setCssContent = null;
let _selectedKfIndex = -1;

const PALETTES = [
  { id: 'midnight', label: '🌙 Midnight', colors: { text: '#e8e8e8', bg: '#1a1a2e', accent: '#e94560', link: '#0f3460', border: '#16213e' } },
  { id: 'forest', label: '🌲 Forest', colors: { text: '#2d3436', bg: '#f0fff4', accent: '#00b894', link: '#00cec9', border: '#b2bec3' } },
  { id: 'sunset', label: '🌅 Sunset', colors: { text: '#2d1b2e', bg: '#fff5f0', accent: '#e17055', link: '#fd79a8', border: '#ffeaa7' } },
  { id: 'ocean', label: '🌊 Ocean', colors: { text: '#1a1a2e', bg: '#f0f8ff', accent: '#0984e3', link: '#74b9ff', border: '#dfe6e9' } },
  { id: 'lavender', label: '💜 Lavender', colors: { text: '#2d2d44', bg: '#f5f0ff', accent: '#6c5ce7', link: '#a29bfe', border: '#dcd6f7' } },
  { id: 'gold', label: '✨ Gold&Slate', colors: { text: '#e8e8e8', bg: '#1a1a1a', accent: '#d4a843', link: '#b8860b', border: '#4a4a5a' } },
  { id: 'paper', label: '📜 Paper', colors: { text: '#3d3d3d', bg: '#faf8f5', accent: '#c0392b', link: '#2980b9', border: '#d5d0c8' } },
  { id: 'neon', label: '⚡ Neon', colors: { text: '#ffffff', bg: '#0a0a0a', accent: '#00ff88', link: '#ff00ff', border: '#333333' } },
  { id: 'pastel', label: '🍬 Pastel', colors: { text: '#555555', bg: '#fefefe', accent: '#ff6b9d', link: '#c44dff', border: '#e8e8e8' } },
  { id: 'earth', label: '🏔 Earth', colors: { text: '#3e2723', bg: '#f5f0e8', accent: '#8d6e63', link: '#a1887f', border: '#d7ccc8' } },
];

const ANIM_PRESETS = [
  { id: 'fadeIn', label: '✨ Fade In', keyframes: [{ offset: 0, props: { opacity: '0' } }, { offset: 100, props: { opacity: '1' } }] },
  { id: 'slideUp', label: '⬆ Slide Up', keyframes: [{ offset: 0, props: { opacity: '0', transform: 'translateY(30px)' } }, { offset: 100, props: { opacity: '1', transform: 'translateY(0)' } }] },
  { id: 'slideLeft', label: '⬅ Slide Left', keyframes: [{ offset: 0, props: { opacity: '0', transform: 'translateX(50px)' } }, { offset: 100, props: { opacity: '1', transform: 'translateX(0)' } }] },
  { id: 'bounce', label: '🏀 Bounce', keyframes: [{ offset: 0, props: { transform: 'translateY(0)' } }, { offset: 30, props: { transform: 'translateY(-30px)' } }, { offset: 50, props: { transform: 'translateY(0)' } }, { offset: 70, props: { transform: 'translateY(-15px)' } }, { offset: 100, props: { transform: 'translateY(0)' } }] },
  { id: 'pulse', label: '💓 Pulse', keyframes: [{ offset: 0, props: { transform: 'scale(1)' } }, { offset: 50, props: { transform: 'scale(1.1)' } }, { offset: 100, props: { transform: 'scale(1)' } }] },
  { id: 'shake', label: '📳 Shake', keyframes: [{ offset: 0, props: { transform: 'translateX(0)' } }, { offset: 10, props: { transform: 'translateX(-10px)' } }, { offset: 20, props: { transform: 'translateX(10px)' } }, { offset: 30, props: { transform: 'translateX(-10px)' } }, { offset: 40, props: { transform: 'translateX(10px)' } }, { offset: 50, props: { transform: 'translateX(0)' } }] },
  { id: 'rotate', label: '🔄 Rotate', keyframes: [{ offset: 0, props: { transform: 'rotate(0deg)' } }, { offset: 100, props: { transform: 'rotate(360deg)' } }] },
  { id: 'flip', label: '🔃 Flip', keyframes: [{ offset: 0, props: { transform: 'perspective(400px) rotateY(0)' } }, { offset: 100, props: { transform: 'perspective(400px) rotateY(360deg)' } }] },
  { id: 'zoomIn', label: '🔍 Zoom In', keyframes: [{ offset: 0, props: { opacity: '0', transform: 'scale(0.3)' } }, { offset: 100, props: { opacity: '1', transform: 'scale(1)' } }] },
];

export function initThemer({ setCssContent }) {
  _setCssContent = setCssContent;
  document.getElementById('btn-themer').addEventListener('click', _togglePanel);
  document.getElementById('themer-close').addEventListener('click', _closePanel);
  document.getElementById('themer-backdrop').addEventListener('click', _closePanel);
  document.getElementById('themer-target').addEventListener('change', _onTargetChange);
  document.getElementById('themer-custom-target').addEventListener('input', _onCustomTarget);
  _bindColor('text'); _bindColor('bg'); _bindColor('accent'); _bindColor('link'); _bindColor('border'); _bindColor('shadow');
  document.getElementById('themer-font-family').addEventListener('change', _onPropChange);
  _bindRange('fontSize', 'px'); _bindRange('lineHeight', '', v => (v / 100).toFixed(1));
  document.getElementById('themer-font-weight').addEventListener('change', _onPropChange);
  _bindRange('letterSpacing', 'px');
  document.querySelectorAll('.themer-align-btn').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.themer-align-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); _state.textAlign = btn.dataset.align; _generate(); }); });
  document.getElementById('themer-text-transform').addEventListener('change', _onPropChange);
  _bindRange('borderWidth', 'px'); document.getElementById('themer-border-style').addEventListener('change', _onPropChange); _bindRange('borderRadius', 'px');
  _bindRange('padding', 'px'); _bindRange('margin', 'px');
  _bindRange('shadowX', 'px'); _bindRange('shadowY', 'px'); _bindRange('shadowBlur', 'px'); _bindRange('shadowSpread', 'px'); _bindRange('shadowOpacity', '%');
  document.getElementById('themer-gradient-type').addEventListener('change', _onGradientType);
  _bindColor('gradStart'); _bindColor('gradEnd'); _bindRange('gradAngle', '°');
  _bindRange('opacity', '%');
  _bindFilter('filterBlur', 'px'); _bindFilter('filterBrightness', '%'); _bindFilter('filterContrast', '%'); _bindFilter('filterSaturate', '%');
  _bindFilter('filterGrayscale', '%'); _bindFilter('filterHue', '°'); _bindFilter('filterInvert', '%'); _bindFilter('filterSepia', '%'); _bindFilter('filterOpacity', '%');
  _renderPalettes(); _initLayoutEditor(); _initAnimation();
  document.getElementById('themer-copy-css').addEventListener('click', _copyCss);
  document.getElementById('themer-apply-css').addEventListener('click', _applyCss);
  document.getElementById('themer-reset').addEventListener('click', _resetAll);
}

function _togglePanel() { const p = document.getElementById('themer-panel'), b = document.getElementById('themer-backdrop'); if (p.classList.contains('open')) { _closePanel(); return; } p.classList.add('open'); p.hidden = false; b.hidden = false; requestAnimationFrame(() => b.classList.add('visible')); }
function _closePanel() { const p = document.getElementById('themer-panel'), b = document.getElementById('themer-backdrop'); p.classList.remove('open'); b.classList.remove('visible'); setTimeout(() => { p.hidden = true; b.hidden = true; }, 250); }
function _onTargetChange() { const s = document.getElementById('themer-target'), c = document.getElementById('themer-custom-target'); if (s.value === 'custom') { c.hidden = false; _state.target = c.value || ''; } else { c.hidden = true; _state.target = s.value; } _generate(); }
function _onCustomTarget() { _state.target = document.getElementById('themer-custom-target').value || ''; _generate(); }
function _bindColor(key) { const p = document.getElementById('themer-color-' + key), h = document.getElementById('themer-color-' + key + '-hex'); if (!p || !h) return; p.addEventListener('input', () => { h.value = p.value; _state['color' + key.charAt(0).toUpperCase() + key.slice(1)] = p.value; _generate(); }); h.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(h.value)) { p.value = h.value; _state['color' + key.charAt(0).toUpperCase() + key.slice(1)] = h.value; _generate(); } }); }
function _bindRange(key, unit, fmt) { const s = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()), d = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '-val'); if (!s) return; s.addEventListener('input', () => { _state[key] = parseInt(s.value, 10); if (d) d.textContent = fmt ? fmt(_state[key]) : _state[key] + unit; _generate(); }); }
function _onPropChange(e) { _state[e.target.id.replace('themer-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = e.target.value; _generate(); }
function _onGradientType() { _state.gradientType = document.getElementById('themer-gradient-type').value; document.getElementById('themer-gradient-controls').hidden = _state.gradientType === 'none'; _generate(); }
function _bindFilter(key, unit) { const s = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()), d = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '-val'); if (!s) return; s.addEventListener('input', () => { _state[key] = parseInt(s.value, 10); if (d) d.textContent = _state[key] + unit; _generate(); }); }

function _renderPalettes() {
  const g = document.getElementById('palette-grid'); if (!g) return;
  g.innerHTML = PALETTES.map(p => '<div class="palette-card" data-palette="' + p.id + '" title="' + p.label + '"><div class="palette-swatch" style="background:' + p.colors.bg + '"><div class="palette-swatch-accent" style="background:' + p.colors.accent + '"></div><div class="palette-swatch-text" style="background:' + p.colors.text + '"></div></div><div class="palette-label">' + p.label + '</div></div>').join('');
  g.querySelectorAll('.palette-card').forEach(c => { c.addEventListener('click', () => { const p = PALETTES.find(x => x.id === c.dataset.palette); if (!p) return; _state.colorText = p.colors.text; _state.colorBg = p.colors.bg; _state.colorAccent = p.colors.accent; _state.colorLink = p.colors.link; _state.colorBorder = p.colors.border; _rc('themer-color-text', p.colors.text); _rc('themer-color-bg', p.colors.bg); _rc('themer-color-accent', p.colors.accent); _rc('themer-color-link', p.colors.link); _rc('themer-color-border', p.colors.border); _generate(); }); });
}

function _initLayoutEditor() {
  document.getElementById('themer-layout-mode').addEventListener('change', e => { _state.layoutMode = e.target.value; document.getElementById('themer-flex-controls').hidden = e.target.value !== 'flex'; document.getElementById('themer-grid-controls').hidden = e.target.value !== 'grid'; document.getElementById('themer-child-controls').hidden = e.target.value === 'none'; _generate(); });
  document.querySelectorAll('[data-flex-dir]').forEach(b => { b.addEventListener('click', () => { document.querySelectorAll('[data-flex-dir]').forEach(x => x.classList.remove('active')); b.classList.add('active'); _state.flexDirection = b.dataset.flexDir; _generate(); }); });
  document.getElementById('themer-flex-wrap').addEventListener('change', e => { _state.flexWrap = e.target.value; _generate(); });
  document.getElementById('themer-justify-content').addEventListener('change', e => { _state.justifyContent = e.target.value; _generate(); });
  document.getElementById('themer-align-items').addEventListener('change', e => { _state.alignItems = e.target.value; _generate(); });
  _bindLR('flexGap', 'px'); document.getElementById('themer-grid-cols').addEventListener('input', e => { _state.gridCols = e.target.value; _generate(); });
  document.getElementById('themer-grid-rows').addEventListener('input', e => { _state.gridRows = e.target.value; _generate(); });
  _bindLR('gridGap', 'px'); document.getElementById('themer-grid-auto-flow').addEventListener('change', e => { _state.gridAutoFlow = e.target.value; _generate(); });
  _bindLR('childFlexGrow', ''); _bindLR('childFlexShrink', '');
  document.getElementById('themer-child-flex-basis').addEventListener('input', e => { _state.childFlexBasis = e.target.value; _generate(); });
  document.getElementById('themer-child-align-self').addEventListener('change', e => { _state.childAlignSelf = e.target.value; _generate(); });
  _bindLR('childOrder', '');
}
function _bindLR(key, unit) { const s = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()), d = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '-val'); if (!s) return; s.addEventListener('input', () => { _state[key] = parseInt(s.value, 10); if (d) d.textContent = _state[key] + unit; _generate(); }); }
function _generateLayoutCSS() { const s = _state, l = []; if (s.layoutMode === 'flex') { l.push('display: flex;'); if (s.flexDirection !== 'row') l.push('flex-direction: ' + s.flexDirection + ';'); if (s.flexWrap !== 'nowrap') l.push('flex-wrap: ' + s.flexWrap + ';'); if (s.justifyContent !== 'flex-start') l.push('justify-content: ' + s.justifyContent + ';'); if (s.alignItems !== 'stretch') l.push('align-items: ' + s.alignItems + ';'); if (s.flexGap > 0) l.push('gap: ' + s.flexGap + 'px;'); } else if (s.layoutMode === 'grid') { l.push('display: grid;'); l.push('grid-template-columns: ' + s.gridCols + ';'); if (s.gridRows !== 'auto') l.push('grid-template-rows: ' + s.gridRows + ';'); if (s.gridGap > 0) l.push('gap: ' + s.gridGap + 'px;'); if (s.gridAutoFlow !== 'row') l.push('grid-auto-flow: ' + s.gridAutoFlow + ';'); } return l; }

function _initAnimation() {
  document.getElementById('themer-anim-enabled').addEventListener('change', e => { _state.animEnabled = e.target.checked; document.getElementById('themer-anim-controls').hidden = !e.target.checked; _generate(); });
  document.getElementById('themer-anim-name').addEventListener('input', e => { _state.animName = e.target.value || 'myAnimation'; _generate(); });
  _bindAR('animDuration', 's', v => (v / 1000).toFixed(1) + 's'); document.getElementById('themer-anim-timing').addEventListener('change', e => { _state.animTiming = e.target.value; _generate(); });
  _bindAR('animDelay', 's', v => (v / 1000).toFixed(1) + 's'); _bindAR('animIteration', '', v => '' + v);
  document.getElementById('themer-anim-direction').addEventListener('change', e => { _state.animDirection = e.target.value; _generate(); });
  document.getElementById('anim-add-keyframe').addEventListener('click', _addKf);
  _bindKfS('anim-kf-opacity', 'opacity', v => (v / 100).toFixed(1)); _bindKfS('anim-kf-tx', 'transformTx', v => v + 'px');
  _bindKfS('anim-kf-ty', 'transformTy', v => v + 'px'); _bindKfS('anim-kf-scale', 'transformScale', v => (v / 100).toFixed(1));
  _bindKfS('anim-kf-rotate', 'transformRotate', v => v + 'deg'); _bindKfO('anim-kf-offset', '%');
  const bp = document.getElementById('anim-kf-bg'), bh = document.getElementById('anim-kf-bg-hex');
  bp.addEventListener('input', () => { bh.value = bp.value; _uk('backgroundColor', bp.value); _generate(); });
  bh.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(bh.value)) { bp.value = bh.value; _uk('backgroundColor', bh.value); _generate(); } });
  document.getElementById('anim-kf-remove').addEventListener('click', _removeKf);
  _renderAnimPresets(); _renderKfList();
}
function _bindAR(key, unit, fmt) { const s = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()), d = document.getElementById('themer-' + key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '-val'); if (!s) return; s.addEventListener('input', () => { _state[key] = parseInt(s.value, 10); if (d) d.textContent = fmt(_state[key]); _generate(); }); }
function _bindKfS(id, pk, fmt) { const s = document.getElementById(id), d = document.getElementById(id + '-val'); if (!s) return; s.addEventListener('input', () => { if (d) d.textContent = fmt(parseInt(s.value, 10)); _uk(pk, fmt(parseInt(s.value, 10))); _generate(); }); }
function _bindKfO(id, unit) { const s = document.getElementById(id), d = document.getElementById(id + '-val'); if (!s) return; s.addEventListener('input', () => { const v = parseInt(s.value, 10); if (d) d.textContent = v + unit; if (_selectedKfIndex >= 0 && _selectedKfIndex < _state.keyframes.length) { _state.keyframes[_selectedKfIndex].offset = v; _renderKfList(); _generate(); } }); }
function _uk(k, v) { if (_selectedKfIndex >= 0 && _selectedKfIndex < _state.keyframes.length) { _state.keyframes[_selectedKfIndex].props[k] = v; _renderKfList(); } }
function _renderKfList() { const l = document.getElementById('anim-keyframes-list'); if (!l) return; l.innerHTML = _state.keyframes.map((kf, i) => { const p = Object.entries(kf.props).filter(([, v]) => v && v !== '0' && v !== '0px' && v !== '1').map(([k, v]) => k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + ': ' + v).join(', '); return '<div class="anim-kf-item ' + (i === _selectedKfIndex ? 'selected' : '') + '" data-idx="' + i + '"><div class="anim-kf-dot"></div><span class="anim-kf-offset">' + kf.offset + '%</span><span class="anim-kf-preview">' + (p || 'no properties') + '</span></div>'; }).join(''); l.querySelectorAll('.anim-kf-item').forEach(el => { el.addEventListener('click', () => { _selectedKfIndex = parseInt(el.dataset.idx, 10); _renderKfList(); _loadKfEditor(_selectedKfIndex); }); }); }
function _loadKfEditor(i) { const kf = _state.keyframes[i]; if (!kf) return; document.getElementById('anim-keyframe-editor').hidden = false; document.getElementById('anim-kf-title').textContent = 'Keyframe at ' + kf.offset + '%'; const s = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; }; const d = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; }; const p = kf.props; s('anim-kf-offset', kf.offset); d('anim-kf-offset-val', kf.offset + '%'); s('anim-kf-opacity', Math.round(parseFloat(p.opacity || '1') * 100)); d('anim-kf-opacity-val', p.opacity || '1'); s('anim-kf-tx', parseInt(p.transformTx || '0')); d('anim-kf-tx-val', (p.transformTx || '0px')); s('anim-kf-ty', parseInt(p.transformTy || '0')); d('anim-kf-ty-val', (p.transformTy || '0px')); s('anim-kf-scale', Math.round(parseFloat(p.transformScale || '1') * 100)); d('anim-kf-scale-val', (Math.round(parseFloat(p.transformScale || '1') * 100) / 100).toFixed(1)); s('anim-kf-rotate', parseInt(p.transformRotate || '0')); d('anim-kf-rotate-val', (p.transformRotate || '0deg')); s('anim-kf-bg', p.backgroundColor || '#ffffff'); document.getElementById('anim-kf-bg-hex').value = p.backgroundColor || '#ffffff'; }
function _addKf() { let o = 50; if (_state.keyframes.length > 0) o = Math.min(_state.keyframes[_state.keyframes.length - 1].offset + 25, 100); _state.keyframes.push({ offset: o, props: { opacity: '1', transform: 'translateY(0)' } }); _state.keyframes.sort((a, b) => a.offset - b.offset); _selectedKfIndex = _state.keyframes.findIndex(k => k.offset === o); _renderKfList(); _loadKfEditor(_selectedKfIndex); _generate(); }
function _removeKf() { if (_selectedKfIndex < 0 || _state.keyframes.length <= 2) return; _state.keyframes.splice(_selectedKfIndex, 1); _selectedKfIndex = Math.min(_selectedKfIndex, _state.keyframes.length - 1); document.getElementById('anim-keyframe-editor').hidden = _selectedKfIndex < 0; _renderKfList(); if (_selectedKfIndex >= 0) _loadKfEditor(_selectedKfIndex); _generate(); }
function _renderAnimPresets() { const c = document.getElementById('anim-presets'); if (!c) return; c.innerHTML = ANIM_PRESETS.map(p => '<button class="anim-preset-btn" data-preset="' + p.id + '">' + p.label + '</button>').join(''); c.querySelectorAll('.anim-preset-btn').forEach(b => { b.addEventListener('click', () => { const p = ANIM_PRESETS.find(x => x.id === b.dataset.preset); if (!p) return; _state.keyframes = JSON.parse(JSON.stringify(p.keyframes)); _state.animEnabled = true; document.getElementById('themer-anim-enabled').checked = true; document.getElementById('themer-anim-controls').hidden = false; _selectedKfIndex = 0; _renderKfList(); _loadKfEditor(0); _generate(); }); }); }

function _generate() {
  const s = _state, sel = s.target || 'body', lines = [];
  if (s.colorText && s.colorText !== '#333333') lines.push('color: ' + s.colorText + ';');
  if (s.gradientType === 'linear') lines.push('background: linear-gradient(' + s.gradAngle + 'deg, ' + s.gradStart + ', ' + s.gradEnd + ');');
  else if (s.gradientType === 'radial') lines.push('background: radial-gradient(circle, ' + s.gradStart + ', ' + s.gradEnd + ');');
  else if (s.colorBg && s.colorBg !== '#ffffff') lines.push('background-color: ' + s.colorBg + ';');
  if (s.fontFamily && s.fontFamily !== 'system-ui, sans-serif') lines.push('font-family: ' + s.fontFamily + ';');
  if (s.fontSize && s.fontSize !== 16) lines.push('font-size: ' + s.fontSize + 'px;');
  if (s.lineHeight && s.lineHeight !== 160) lines.push('line-height: ' + (s.lineHeight / 100).toFixed(1) + ';');
  if (s.fontWeight && s.fontWeight !== 400) lines.push('font-weight: ' + s.fontWeight + ';');
  if (s.letterSpacing && s.letterSpacing !== 0) lines.push('letter-spacing: ' + s.letterSpacing + 'px;');
  if (s.textAlign && s.textAlign !== 'left') lines.push('text-align: ' + s.textAlign + ';');
  if (s.textTransform && s.textTransform !== 'none') lines.push('text-transform: ' + s.textTransform + ';');
  if (s.borderWidth && s.borderWidth > 0) lines.push('border: ' + s.borderWidth + 'px ' + s.borderStyle + ' ' + s.colorBorder + ';');
  if (s.borderRadius && s.borderRadius > 0) lines.push('border-radius: ' + s.borderRadius + 'px;');
  if (s.padding && s.padding > 0) lines.push('padding: ' + s.padding + 'px;');
  if (s.margin && s.margin > 0) lines.push('margin: ' + s.margin + 'px;');
  if (s.shadowX !== 0 || s.shadowY !== 4 || s.shadowBlur !== 12 || s.shadowSpread !== 0) lines.push('box-shadow: ' + s.shadowX + 'px ' + s.shadowY + 'px ' + s.shadowBlur + 'px ' + s.shadowSpread + 'px _rgba(' + s.colorShadow + ',' + (s.shadowOpacity / 100).toFixed(2) + ');'.replace('_rgba', 'rgba'));
  const fl = []; if (s.filterBlur > 0) fl.push('blur(' + s.filterBlur + 'px)'); if (s.filterBrightness !== 100) fl.push('brightness(' + s.filterBrightness + '%)'); if (s.filterContrast !== 100) fl.push('contrast(' + s.filterContrast + '%)'); if (s.filterGrayscale > 0) fl.push('grayscale(' + s.filterGrayscale + '%)'); if (s.filterHueRotate > 0) fl.push('hue-rotate(' + s.filterHueRotate + 'deg)'); if (s.filterInvert > 0) fl.push('invert(' + s.filterInvert + '%)'); if (s.filterOpacity < 100) fl.push('opacity(' + s.filterOpacity + '%)'); if (s.filterSaturate !== 100) fl.push('saturate(' + s.filterSaturate + '%)'); if (s.filterSepia > 0) fl.push('sepia(' + s.filterSepia + '%)'); if (fl.length > 0) lines.push('filter: ' + fl.join(' ') + ';');
  _generateLayoutCSS().forEach(x => lines.push(x));
  if (s.opacity < 100) lines.push('opacity: ' + (s.opacity / 100).toFixed(2) + ';');
  if (s.animEnabled && s.keyframes.length >= 2) { const it = s.animIteration === 1 ? '' : ' ' + s.animIteration; lines.push('animation: ' + s.animName + ' ' + s.animDuration + 'ms ' + s.animTiming + ' ' + s.animDelay + 'ms' + it + ' ' + s.animDirection + ' ' + s.animFillMode + ';'); }
  let css = lines.length > 0 ? sel + ' {\n  ' + lines.join('\n  ') + '\n}' : '/* Select a target element to generate CSS */';
  if (s.animEnabled && s.keyframes.length >= 2) { const kfl = s.keyframes.map(kf => { const p = Object.entries(kf.props).filter(([, v]) => v && v !== '0' && v !== '0px' && v !== '0%' && v !== '1' && v !== '100%' && v !== '#ffffff').map(([k, v]) => '    ' + k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + ': ' + v + ';').join('\n'); return '  ' + kf.offset + '% {\n' + p + '\n  }'; }); css += '\n\n@keyframes ' + s.animName + ' {\n' + kfl.join('\n') + '\n}'; }
  const o = document.getElementById('themer-css-output'); if (o) o.textContent = css;
}

function _copyCss() { const css = document.getElementById('themer-css-output').textContent; navigator.clipboard.writeText(css).then(() => { const b = document.getElementById('themer-copy-css'); b.textContent = 'Copied!'; setTimeout(() => { b.textContent = 'Copy CSS'; }, 1500); }); }
function _applyCss() { const css = document.getElementById('themer-css-output').textContent; if (css.startsWith('/*')) return; if (_setCssContent) _setCssContent(css); }

function _resetAll() {
  Object.assign(_state, { colorText: '#333333', colorBg: '#ffffff', colorAccent: '#b8860b', colorLink: '#1a73e8', colorBorder: '#dddddd', colorShadow: '#000000', fontFamily: 'system-ui, sans-serif', fontSize: 16, lineHeight: 160, fontWeight: 400, letterSpacing: 0, textAlign: 'left', textTransform: 'none', borderWidth: 0, borderStyle: 'none', borderRadius: 0, padding: 0, margin: 0, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowSpread: 0, shadowOpacity: 10, gradientType: 'none', gradStart: '#1a1a1a', gradEnd: '#4a4a5a', gradAngle: 135, opacity: 100, filterBlur: 0, filterBrightness: 100, filterContrast: 100, filterGrayscale: 0, filterHueRotate: 0, filterInvert: 0, filterOpacity: 100, filterSaturate: 100, filterSepia: 0, animEnabled: false, animName: 'myAnimation', animDuration: 1000, animTiming: 'ease', animDelay: 0, animIteration: 1, animDirection: 'normal', animFillMode: 'none', layoutMode: 'none', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', flexGap: 0, gridCols: '1fr 1fr', gridRows: 'auto', gridGap: 16, gridAutoFlow: 'row', childFlexGrow: 0, childFlexShrink: 1, childFlexBasis: 'auto', childAlignSelf: 'auto', childOrder: 0, keyframes: [{ offset: 0, props: { opacity: '1', transform: 'translateY(0)' } }, { offset: 50, props: { opacity: '0.5', transform: 'translateY(-20px)' } }, { offset: 100, props: { opacity: '1', transform: 'translateY(0)' } }] });
  const rc = (id, v) => { const e = document.getElementById(id); if (!e) return; if (e.type === 'color') { e.value = v; const h = document.getElementById(id + '-hex'); if (h) h.value = v; } else e.value = v; };
  'themer-color-text themer-color-bg themer-color-accent themer-color-link themer-color-border themer-color-shadow themer-font-family themer-font-size themer-line-height themer-font-weight themer-letter-spacing themer-text-transform themer-border-width themer-border-style themer-border-radius themer-padding themer-margin themer-shadow-x themer-shadow-y themer-shadow-blur themer-shadow-spread themer-shadow-opacity themer-gradient-type themer-grad-start themer-grad-end themer-grad-angle themer-opacity themer-filter-blur themer-filter-brightness themer-filter-contrast themer-filter-saturate themer-filter-grayscale themer-filter-hue themer-filter-invert themer-filter-sepia themer-filter-opacity themer-layout-mode themer-flex-wrap themer-justify-content themer-align-items themer-flexGap themer-grid-cols themer-grid-rows themer-gridGap themer-grid-auto-flow themer-childFlexGrow themer-childFlexShrink themer-child-flex-basis themer-child-align-self themer-childOrder'.split(' ').forEach(id => { const e = document.getElementById(id); if (e) { if (e.type === 'color') { e.value = e.id.includes('text') ? '#333333' : e.id.includes('bg') ? '#ffffff' : e.id.includes('accent') ? '#b8860b' : e.id.includes('link') ? '#1a73e8' : e.id.includes('border') ? '#dddddd' : '#000000'; const h = document.getElementById(id + '-hex'); if (h) h.value = e.value; } else { const defs = { 'themer-font-family': 'system-ui, sans-serif', 'themer-font-size': 16, 'themer-line-height': 160, 'themer-font-weight': 400, 'themer-letter-spacing': 0, 'themer-text-transform': 'none', 'themer-border-width': 0, 'themer-border-style': 'none', 'themer-border-radius': 0, 'themer-padding': 0, 'themer-margin': 0, 'themer-shadow-x': 0, 'themer-shadow-y': 4, 'themer-shadow-blur': 12, 'themer-shadow-spread': 0, 'themer-shadow-opacity': 10, 'themer-gradient-type': 'none', 'themer-grad-start': '#1a1a1a', 'themer-grad-end': '#4a4a5a', 'themer-grad-angle': 135, 'themer-opacity': 100, 'themer-filter-blur': 0, 'themer-filter-brightness': 100, 'themer-filter-contrast': 100, 'themer-filter-saturate': 100, 'themer-filter-grayscale': 0, 'themer-filter-hue': 0, 'themer-filter-invert': 0, 'themer-filter-sepia': 0, 'themer-filter-opacity': 100, 'themer-layout-mode': 'none', 'themer-flex-wrap': 'nowrap', 'themer-justify-content': 'flex-start', 'themer-align-items': 'stretch', 'themer-flexGap': 0, 'themer-grid-cols': '1fr 1fr', 'themer-grid-rows': 'auto', 'themer-gridGap': 16, 'themer-grid-auto-flow': 'row', 'themer-childFlexGrow': 0, 'themer-childFlexShrink': 1, 'themer-child-flex-basis': 'auto', 'themer-child-align-self': 'auto', 'themer-childOrder': 0 }; e.value = defs[id] || 0; } } });
  document.getElementById('themer-anim-enabled').checked = false; document.getElementById('themer-anim-controls').hidden = true;
  document.getElementById('themer-anim-name').value = 'myAnimation'; document.getElementById('themer-anim-duration').value = 1000; document.getElementById('themer-anim-duration-val').textContent = '1s';
  document.getElementById('themer-anim-timing').value = 'ease'; document.getElementById('themer-anim-delay').value = 0; document.getElementById('themer-anim-delay-val').textContent = '0s';
  document.getElementById('themer-anim-iteration').value = 1; document.getElementById('themer-anim-iteration-val').textContent = '1'; document.getElementById('themer-anim-direction').value = 'normal';
  document.getElementById('themer-flex-controls').hidden = true; document.getElementById('themer-grid-controls').hidden = true; document.getElementById('themer-child-controls').hidden = true;
  document.getElementById('themer-gradient-controls').hidden = true; document.getElementById('anim-keyframe-editor').hidden = true; _selectedKfIndex = -1; _renderKfList();
  document.querySelectorAll('.themer-align-btn').forEach(b => b.classList.toggle('active', b.dataset.align === 'left'));
  document.querySelectorAll('[data-flex-dir]').forEach(b => b.classList.toggle('active', b.dataset.flexDir === 'row'));
  _generate();
}

function _rc(id, v) { const e = document.getElementById(id); if (!e) return; if (e.type === 'color') { e.value = v; const h = document.getElementById(id + '-hex'); if (h) h.value = v; } else e.value = v; }
