/* ============================================================
   SmarTools HTML Studio — Snippet Definitions
   Reusable HTML/CSS/JS code snippets with metadata.
   ============================================================ */

export const SNIPPETS = [
  /* ── HTML Snippets ──────────────────────────────────────── */
  {
    id: 'html-boilerplate',
    label: 'HTML5 Boilerplate',
    description: 'Standard HTML5 document structure',
    icon: '📄',
    tag: 'html',
    keywords: ['html', 'boilerplate', 'doctype', 'structure', 'page'],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
</head>
<body>

</body>
</html>`,
  },
  {
    id: 'html-div',
    label: 'Div Container',
    description: 'A styled div with class',
    icon: '📦',
    tag: 'html',
    keywords: ['div', 'container', 'box', 'wrapper'],
    code: `<div class="container">
  <!-- content -->
</div>`,
  },
  {
    id: 'html-button',
    label: 'Button',
    description: 'Styled button element',
    icon: '🔘',
    tag: 'html',
    keywords: ['button', 'btn', 'click', 'action'],
    code: `<button class="btn">Click Me</button>`,
  },
  {
    id: 'html-input',
    label: 'Input Field',
    description: 'Text input with label',
    icon: '📝',
    tag: 'html',
    keywords: ['input', 'text', 'field', 'form', 'label'],
    code: `<div class="form-group">
  <label for="field">Label</label>
  <input type="text" id="field" placeholder="Enter text…" />
</div>`,
  },
  {
    id: 'html-img',
    label: 'Image',
    description: 'Responsive image with alt text',
    icon: '🖼️',
    tag: 'html',
    keywords: ['img', 'image', 'picture', 'photo', 'responsive'],
    code: `<img src="image.jpg" alt="Description" loading="lazy" />`,
  },
  {
    id: 'html-link',
    label: 'Link',
    description: 'Anchor link with target blank',
    icon: '🔗',
    tag: 'html',
    keywords: ['a', 'link', 'anchor', 'href', 'url'],
    code: `<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link Text</a>`,
  },
  {
    id: 'html-table',
    label: 'Table',
    description: 'Basic data table',
    icon: '📊',
    tag: 'html',
    keywords: ['table', 'data', 'rows', 'columns', 'grid'],
    code: `<table>
  <thead>
    <tr><th>Header 1</th><th>Header 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Data 1</td><td>Data 2</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'html-list',
    label: 'Unordered List',
    description: 'Bulleted list',
    icon: '📋',
    tag: 'html',
    keywords: ['ul', 'list', 'bullet', 'items'],
    code: `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`,
  },
  {
    id: 'html-flex',
    label: 'Flex Container',
    description: 'Flexbox layout container',
    icon: '↔️',
    tag: 'html',
    keywords: ['flex', 'flexbox', 'layout', 'row', 'column'],
    code: `<div style="display:flex; gap:1rem; align-items:center;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>`,
  },
  {
    id: 'html-grid',
    label: 'Grid Container',
    description: 'CSS Grid layout container',
    icon: '🔲',
    tag: 'html',
    keywords: ['grid', 'css-grid', 'layout', 'columns'],
    code: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>`,
  },

  /* ── CSS Snippets ───────────────────────────────────────── */
  {
    id: 'css-reset',
    label: 'CSS Reset',
    description: 'Basic CSS reset for consistent styling',
    icon: '🔄',
    tag: 'css',
    keywords: ['reset', 'normalize', 'margin', 'padding', 'box-sizing'],
    code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`,
  },
  {
    id: 'css-center',
    label: 'Center with Flexbox',
    description: 'Perfect centering with flexbox',
    icon: '🎯',
    tag: 'css',
    keywords: ['center', 'flex', 'middle', 'align', 'justify'],
    code: `.center {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
  },
  {
    id: 'css-grid-cols',
    label: 'Responsive Grid',
    description: 'Auto-fitting responsive grid',
    icon: '🔲',
    tag: 'css',
    keywords: ['grid', 'responsive', 'columns', 'auto', 'layout'],
    code: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}`,
  },
  {
    id: 'css-card',
    label: 'Card Style',
    description: 'Elevated card with shadow',
    icon: '🃏',
    tag: 'css',
    keywords: ['card', 'shadow', 'border', 'rounded', 'elevated'],
    code: `.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-4px);
}`,
  },
  {
    id: 'css-btn',
    label: 'Button Style',
    description: 'Modern button with hover effect',
    icon: '🔘',
    tag: 'css',
    keywords: ['button', 'btn', 'hover', 'transition', 'modern'],
    code: `.btn {
  display: inline-block;
  padding: 10px 24px;
  background: #b8860b;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn:hover {
  background: #d4a843;
}`,
  },
  {
    id: 'css-gradient',
    label: 'Gradient Background',
    description: 'Linear gradient background',
    icon: '🌈',
    tag: 'css',
    keywords: ['gradient', 'background', 'linear', 'color'],
    code: `background: linear-gradient(135deg, #1a1a1a, #4a4a5a);`,
  },
  {
    id: 'css-animation',
    label: 'Fade In Animation',
    description: 'Keyframe fade-in animation',
    icon: '✨',
    tag: 'css',
    keywords: ['animation', 'fade', 'keyframe', 'transition'],
    code: `@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.element {
  animation: fadeIn 0.3s ease;
}`,
  },
  {
    id: 'css-responsive',
    label: 'Media Query',
    description: 'Responsive breakpoint',
    icon: '📱',
    tag: 'css',
    keywords: ['media', 'query', 'responsive', 'mobile', 'breakpoint'],
    code: `@media (max-width: 768px) {
  /* Mobile styles */
}`,
  },

  /* ── JS Snippets ────────────────────────────────────────── */
  {
    id: 'js-event-listener',
    label: 'Event Listener',
    description: 'Click event listener on element',
    icon: '👆',
    tag: 'js',
    keywords: ['event', 'listener', 'click', 'dom', 'query'],
    code: `document.getElementById('myBtn').addEventListener('click', function() {
  // Handle click
});`,
  },
  {
    id: 'js-fetch',
    label: 'Fetch API',
    description: 'GET request with fetch',
    icon: '🌐',
    tag: 'js',
    keywords: ['fetch', 'api', 'get', 'request', 'http'],
    code: `fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,
  },
  {
    id: 'js-toggle',
    label: 'Toggle Class',
    description: 'Toggle a CSS class on an element',
    icon: '🔀',
    tag: 'js',
    keywords: ['toggle', 'class', 'active', 'show', 'hide'],
    code: `element.classList.toggle('active');`,
  },
  {
    id: 'js-create-element',
    label: 'Create Element',
    description: 'Create and append a DOM element',
    icon: '➕',
    tag: 'js',
    keywords: ['create', 'element', 'append', 'dom', 'html'],
    code: `const el = document.createElement('div');
el.className = 'my-class';
el.textContent = 'Hello';
document.body.appendChild(el);`,
  },
  {
    id: 'js-debounce',
    label: 'Debounce Function',
    description: 'Debounce utility for performance',
    icon: '⏱️',
    tag: 'js',
    keywords: ['debounce', 'performance', 'delay', 'throttle', 'utility'],
    code: `function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
  },
];

/**
 * Search snippets by query string.
 * @param {string} query
 * @returns {Array}
 */
export function searchSnippets(query) {
  if (!query) return SNIPPETS;
  const q = query.toLowerCase();
  return SNIPPETS.filter(s =>
    s.label.toLowerCase().includes(q) ||
    s.keywords.some(k => k.includes(q)) ||
    s.tag.includes(q)
  );
}
