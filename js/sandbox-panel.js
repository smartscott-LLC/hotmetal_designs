/* ============================================================
   SmarTools HTML Studio — Sandbox Panel Module
   UI for the sandbox reactivity & animation builder.
   Generates sandbox code snippets that get inserted into
   the JS editor tab at cursor position.
   ============================================================ */

import { sandbox } from './sandbox_core.js';

let _isOpen = false;
let _insertCallback = null;  // (code: string) => void

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
  const panel = document.getElementById('sandbox-panel');
  const backdrop = document.getElementById('sandbox-panel-backdrop');
  panel.classList.add('open');
  panel.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('visible'));
}

export function closePanel() {
  _isOpen = false;
  const panel = document.getElementById('sandbox-panel');
  const backdrop = document.getElementById('sandbox-panel-backdrop');
  panel.classList.remove('open');
  backdrop.classList.remove('visible');
  setTimeout(() => {
    panel.hidden = true;
    backdrop.hidden = true;
  }, 250);
}

function _closePanel() {
  closePanel();
}

/* ── Code Generation Helpers ────────────────────────────────── */
function _insertCode(code) {
  if (_insertCallback) {
    _insertCallback(code);
  }
}

/* ── State Builder ──────────────────────────────────────────── */
function _buildStateCode() {
  const name = document.getElementById('sb-state-name').value.trim() || 'myVar';
  const value = document.getElementById('sb-state-value').value.trim() || '0';
  const isNumber = !isNaN(value) && value !== '';
  const isBool = value === 'true' || value === 'false';
  const isArray = value.startsWith('[') && value.endsWith(']');
  const isObj = value.startsWith('{') && value.endsWith('}');
  let formatted = value;
  if (!isNumber && !isBool && !isArray && !isObj) {
    formatted = `'${value.replace(/'/g, "\\'")}'`;
  }
  return `sandbox.state.${name} = ${formatted};`;
}

/* ── Bind Builder ───────────────────────────────────────────── */
function _buildBindCode() {
  const selector = document.getElementById('sb-bind-selector').value.trim() || '#myElement';
  const stateKey = document.getElementById('sb-bind-key').value.trim() || 'myVar';
  const byId = selector.startsWith('#');
  const elLine = byId
    ? `const el = document.getElementById('${selector.slice(1)}');`
    : `const el = document.querySelector('${selector}');`;
  return `${elLine}\nsandbox.bindText(el, '${stateKey}');`;
}

/* ── Animate Builder ────────────────────────────────────────── */
function _buildAnimateCode() {
  const selector = document.getElementById('sb-anim-selector').value.trim() || '#myElement';
  const duration = parseInt(document.getElementById('sb-anim-duration').value, 10) || 500;

  const props = [];
  const xVal = document.getElementById('sb-anim-x').value.trim();
  const yVal = document.getElementById('sb-anim-y').value.trim();
  const opacityVal = document.getElementById('sb-anim-opacity').value.trim();

  if (xVal && xVal !== '0') props.push(`x: ${xVal}`);
  if (yVal && yVal !== '0') props.push(`y: ${yVal}`);
  if (opacityVal && opacityVal !== '100') props.push(`opacity: ${(parseFloat(opacityVal) / 100).toFixed(2)}`);

  if (props.length === 0) {
    props.push('x: 100', 'opacity: 0.5');
  }

  const byId = selector.startsWith('#');
  const elLine = byId
    ? `const el = document.getElementById('${selector.slice(1)}');`
    : `const el = document.querySelector('${selector}');`;

  return `${elLine}\nsandbox.animate(el, { ${props.join(', ')} }, ${duration});`;
}

/* ── Preset Generators ──────────────────────────────────────── */
function _insertPreset(preset) {
  switch (preset) {
    case 'counter':
      _insertCode(`// Reactive counter with auto-updating display
sandbox.state.count = 0;

// In your HTML: <span id="counter-display">0</span>
// In your JS:
const display = document.getElementById('counter-display');
sandbox.bindText(display, 'count');

// Increment anywhere:
// sandbox.state.count++;`);
      break;

    case 'fadein':
      _insertCode(`// Fade-in animation on page load
const hero = document.getElementById('hero');
hero.style.opacity = '0';
sandbox.animate(hero, { opacity: 100, y: 0 }, 600);`);
      break;

    case 'slidein':
      _insertCode(`// Slide-in from left
const card = document.getElementById('card');
sandbox.animate(card, { x: 0, opacity: 100 }, 400);`);
      break;

    case 'toggle':
      _insertCode(`// Toggle visibility with reactive state
sandbox.state.isVisible = true;

function toggle() {
  sandbox.state.isVisible = !sandbox.state.isVisible;
  const panel = document.getElementById('panel');
  panel.style.display = sandbox.state.isVisible ? 'block' : 'none';
}`);
      break;

    case 'reactiveColor':
      _insertColorReactivePreset();
      break;
  }
}

function _insertColorReactivePreset() {
  _insertCode(`// Reactive color picker
sandbox.state.bgColor = '#1a1a1a';

const colorInput = document.getElementById('color-picker');
const preview = document.getElementById('preview-box');

// Update state when user picks a color
colorInput.addEventListener('input', () => {
  sandbox.state.bgColor = colorInput.value;
});

// Bind a display element to show the hex value
sandbox.bindText(document.getElementById('color-hex'), 'bgColor');

// Manually update the preview box background
const origSet = sandbox.state;
let lastColor = origSet.bgColor;
setInterval(() => {
  if (origSet.bgColor !== lastColor) {
    preview.style.backgroundColor = origSet.bgColor;
    lastColor = origSet.bgColor;
  }
}, 50);`);
}

/* ── Init ───────────────────────────────────────────────────── */
export function initSandboxPanel({ insertCode }) {
  _insertCallback = insertCode;

  // Toggle button
  document.getElementById('btn-sandbox').addEventListener('click', _togglePanel);
  document.getElementById('sandbox-panel-close').addEventListener('click', _closePanel);
  document.getElementById('sandbox-panel-backdrop').addEventListener('click', _closePanel);

  // State builder
  document.getElementById('sb-state-add').addEventListener('click', () => {
    const code = _buildStateCode();
    _insertCode(code);
  });

  // Bind builder
  document.getElementById('sb-bind-add').addEventListener('click', () => {
    const code = _buildBindCode();
    _insertCode(code);
  });

  // Animate builder
  document.getElementById('sb-anim-add').addEventListener('click', () => {
    const code = _buildAnimateCode();
    _insertCode(code);
  });

  // Preset buttons
  document.querySelectorAll('.sb-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _insertPreset(btn.dataset.preset);
    });
  });

  // Live preview for state value formatting
  const stateValueInput = document.getElementById('sb-state-value');
  stateValueInput.addEventListener('input', () => {
    const hint = document.getElementById('sb-state-hint');
    const val = stateValueInput.value.trim();
    if (!val) {
      hint.textContent = '';
    } else if (!isNaN(val)) {
      hint.textContent = '→ number';
    } else if (val === 'true' || val === 'false') {
      hint.textContent = '→ boolean';
    } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      hint.textContent = '→ string';
    } else if (val.startsWith('[') && val.endsWith(']')) {
      hint.textContent = '→ array';
    } else if (val.startsWith('{') && val.endsWith('}')) {
      hint.textContent = '→ object';
    } else {
      hint.textContent = '→ will be quoted as string';
    }
  });

  // Animate range value displays
  const animDuration = document.getElementById('sb-anim-duration');
  const animDurationVal = document.getElementById('sb-anim-duration-val');
  animDuration.addEventListener('input', () => {
    animDurationVal.textContent = `${animDuration.value}ms`;
  });
  const animX = document.getElementById('sb-anim-x');
  const animXVal = document.getElementById('sb-anim-x-val');
  animX.addEventListener('input', () => { animXVal.textContent = `${animX.value}px`; });
  const animY = document.getElementById('sb-anim-y');
  const animYVal = document.getElementById('sb-anim-y-val');
  animY.addEventListener('input', () => { animYVal.textContent = `${animY.value}px`; });
  const animOpacity = document.getElementById('sb-anim-opacity');
  const animOpacityVal = document.getElementById('sb-anim-opacity-val');
  animOpacity.addEventListener('input', () => { animOpacityVal.textContent = `${animOpacity.value}%`; });
}
