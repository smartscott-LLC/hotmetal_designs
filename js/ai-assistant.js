/* ============================================================
   SmarTools HTML Studio — AI Assistant Module
   Floating orb/box interface powered by OpenRouter.
   - Orb: 48px diameter, gold gradient, draggable
   - Box: 380px × 520px, dark bg, gold accents
   - Model: openrouter/owl-alpha (default)
   - API key stored in localStorage; user provides their own key
   ============================================================ */

const AI_KEY_STORE   = 'htmlstudio-ai-api-key';
const AI_MODEL_STORE = 'htmlstudio-ai-model';
const AI_POS_STORE   = 'htmlstudio-ai-position';
const DEFAULT_MODEL  = 'openrouter/owl-alpha';
const OPENROUTER_API = 'https://openrouter.ai/api/v1';

/* Inline icon */
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#1a1a1a"/>
  <text x="256" y="200" font-family="monospace" font-size="160" fill="#c0c0c0"
        text-anchor="middle" dominant-baseline="middle">⬡</text>
  <text x="256" y="340" font-family="monospace" font-size="90" fill="#b8860b"
        text-anchor="middle" dominant-baseline="middle">H</text>
  <circle cx="150" cy="340" r="18" fill="#b8860b"/>
  <circle cx="362" cy="340" r="18" fill="#b8860b"/>
  <line x1="168" y1="340" x2="220" y2="340" stroke="#c0c0c0" stroke-width="6"/>
  <line x1="292" y1="340" x2="344" y2="340" stroke="#c0c0c0" stroke-width="6"/>
</svg>`;

/* ── Module state ────────────────────────────────────────────── */
let _messages         = [];
let _studio           = null;
let _isStreaming      = false;
let _expanded         = false;
let _showingSettings  = false;
let _didDrag          = false;
let _widget           = null;
let _pendingFile      = null;

/* ── HTML escaping ───────────────────────────────────────────── */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── localStorage helpers ────────────────────────────────────── */
function _getApiKey() { return localStorage.getItem(AI_KEY_STORE) || ''; }
function _getModel()  { return localStorage.getItem(AI_MODEL_STORE) || DEFAULT_MODEL; }

function _loadPos() {
  try {
    const p = JSON.parse(localStorage.getItem(AI_POS_STORE) || 'null');
    if (p && typeof p.x === 'number' && typeof p.y === 'number') return p;
  } catch { /* ignore */ }
  return null;
}

function _savePos(x, y) {
  localStorage.setItem(AI_POS_STORE, JSON.stringify({ x, y }));
}

/* ── Position & drag ─────────────────────────────────────────── */
function _clamp(x, y) {
  const w = _widget.offsetWidth;
  const h = _widget.offsetHeight;
  return {
    x: Math.max(0, Math.min(x, window.innerWidth  - w)),
    y: Math.max(0, Math.min(y, window.innerHeight - h)),
  };
}

function _applyPos(x, y) {
  _widget.style.left   = `${x}px`;
  _widget.style.top    = `${y}px`;
  _widget.style.right  = 'auto';
  _widget.style.bottom = 'auto';
}

function _initDrag() {
  let dragging = false;
  let startX = 0, startY = 0;
  let originX = 0, originY = 0;

  _widget.addEventListener('pointerdown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (['button', 'input', 'textarea', 'a', 'select', 'label'].includes(tag)) return;
    if (e.target.closest('.ai-chat-messages')) return;

    dragging = true;
    _didDrag = false;
    startX   = e.clientX;
    startY   = e.clientY;
    originX  = _widget.offsetLeft;
    originY  = _widget.offsetTop;
    _widget.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  _widget.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) _didDrag = true;
    const { x, y } = _clamp(originX + dx, originY + dy);
    _applyPos(x, y);
  });

  _widget.addEventListener('pointerup', () => {
    if (!dragging) return;
    const wasDragging = _didDrag;
    dragging = false;
    _didDrag = false;
    _savePos(_widget.offsetLeft, _widget.offsetTop);
    if (!wasDragging && !_expanded) {
      _expand();
    }
  });
}

/* ── OpenRouter API ──────────────────────────────────────────── */
function _buildSystemPrompt() {
  const all = _studio?.editor?.getAllContents?.() || {
    html: '',
    css: '',
    js: '',
  };

  const activeTab = _studio?.editor?.getActiveTab?.() || 'html';

  return `You are an expert HTML/CSS/JavaScript AI assistant embedded in SmarTools HTML Studio — a local-first PWA HTML builder. Help users create, edit, and understand web pages and components.

## Current project tabs

### HTML tab
\`\`\`html
${all.html || '(empty)'}
\`\`\`

### CSS tab
\`\`\`css
${all.css || '(empty)'}
\`\`\`

### JavaScript tab
\`\`\`javascript
${all.js || '(empty)'}
\`\`\`

Active tab: \`${activeTab}\`

## Your capabilities via the studio controller:
- studio.editor.getActiveContent() — read current tab content
- studio.editor.setActiveContent(code) — replace active tab content
- studio.editor.getTabContent(tab) — read any tab ('html'/'css'/'js')
- studio.editor.setTabContent(tab, code) — set any tab
- studio.editor.getAllContents() — get {html, css, js}
- studio.editor.setAllContents({html, css, js}) — set all tabs
- studio.editor.switchTab(tab) — switch active tab
- studio.editor.getSelection() — get selected text
- studio.editor.getRange(from, to) — get text between positions
- studio.editor.replaceRange(text, from, to) — replace a range
- studio.editor.insertAtCursor(text) — insert at cursor
- studio.editor.undo() / studio.editor.redo() — undo/redo
- studio.editor.getLine(n) / studio.editor.lineCount() — line access
- studio.editor.getCursor() — cursor position
- studio.editor.execCommand(name) — run CodeMirror commands
- studio.preview.render() — refresh preview
- studio.preview.buildCombinedHtml() — build standalone HTML
- studio.vault.saveFile(name) / studio.vault.loadFile(name) — file I/O
- studio.templates.getAll() / studio.templates.applyTemplate(id) — templates
- studio.snippets.getAll() / studio.snippets.search(q) / studio.snippets.insertById(id) — snippets
- studio.status.report(level, msg) — report status

## Rules:
- Always wrap code in appropriate \`\`\`html, \`\`\`css, or \`\`\`javascript code blocks
- Be concise and helpful
- When rewriting a whole page, provide complete valid HTML/CSS/JS
- For partial edits, describe what changed
- Prefer modern semantic HTML, CSS custom properties, flexbox/grid, and vanilla JS
- Use studio.editor.setTabContent(tab, code) when changing a specific tab
- Use studio.editor.setAllContents({html, css, js}) when changing multiple tabs
- Use studio.status.report('ok', 'message') to confirm actions`;
}

async function _testKey() {
  const resultEl = document.getElementById('ai-test-result');
  const keyInput = document.getElementById('ai-api-key-input');
  const key = (keyInput?.value || '').trim() || _getApiKey();

  if (!key) {
    if (resultEl) resultEl.textContent = '❌ No key entered.';
    return;
  }
  if (resultEl) resultEl.textContent = `⏳ Testing key …${key.slice(-6)}`;

  try {
    const res = await fetch(`${OPENROUTER_API}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: _getModel(),
        stream: false,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    const body = await res.text();
    if (res.ok) {
      if (resultEl) resultEl.innerHTML = `<span style="color:#27ae60">✓ ${res.status} OK — key works!</span>`;
    } else {
      let detail = body.slice(0, 300);
      try { detail = JSON.parse(body)?.error?.message || detail; } catch { /* ok */ }
      if (resultEl) resultEl.innerHTML = `<span style="color:#c0392b">✗ ${res.status}: ${_esc(detail)}</span>`;
    }
  } catch (err) {
    if (resultEl) resultEl.innerHTML = `<span style="color:#c0392b">✗ Network error: ${_esc(err.message)}</span>`;
  }
}

async function _callAPI(userText, onChunk, onDone, onError) {
  const apiKey = _getApiKey();
  if (!apiKey) {
    onError('No API key configured — open settings (⚙️) to enter your OpenRouter key.');
    return;
  }

  _messages.push({ role: 'user', content: userText });

  const payload = {
    model: _getModel(),
    stream: true,
    messages: [
      { role: 'system', content: _buildSystemPrompt() },
      ..._messages,
    ],
  };

  let accumulated = '';

  try {
    const res = await fetch(`${OPENROUTER_API}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${apiKey}`,
        'HTTP-Referer':   window.location.origin,
        'X-Title':        'SmarTools HTML Studio',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      let msg;
      try {
        const json = JSON.parse(text);
        msg = json?.error?.message || text.slice(0, 200);
      } catch {
        msg = text.slice(0, 200);
      }
      if (res.status === 401) {
        msg = `OpenRouter 401 Unauthorized: ${msg}`;
      }
      throw new Error(`OpenRouter ${res.status}: ${msg}`);
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let streamError = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw   = decoder.decode(value, { stream: true });
      const lines = raw.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            streamError = parsed.error.message || JSON.stringify(parsed.error);
            break;
          }
          const delta  = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            accumulated += delta;
            onChunk(accumulated);
          }
        } catch { /* ignore malformed SSE frames */ }
      }

      if (streamError) break;
    }

    if (streamError) throw new Error(`OpenRouter stream error: ${streamError}`);

    _messages.push({ role: 'assistant', content: accumulated });
    onDone(accumulated);
  } catch (err) {
    _messages.pop();
    onError(err.message);
  }
}

/* ── Message rendering ───────────────────────────────────────── */
function _renderContent(text) {
  const parts = [];
  const fence  = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;

  while ((m = fence.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
    parts.push({ type: 'code', lang: m[1] || '', content: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });

  return parts.map((p) => {
    if (p.type === 'text') {
      const html = _esc(p.content)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`\n]+)`/g,   '<code class="ai-inline-code">$1</code>')
        .replace(/\n/g, '<br>');
      return `<span class="ai-text-block">${html}</span>`;
    }

    const isCode = ['html', 'css', 'javascript', 'js'].includes(p.lang);
    const codeEsc = _esc(p.content);
    return `<div class="ai-code-block">
      <div class="ai-code-header">
        <span class="ai-code-lang">${_esc(p.lang || 'code')}</span>
        ${isCode
          ? `<button class="ai-btn-apply" data-code="${codeEsc}">⬆ Apply to Editor</button>`
          : ''}
        <button class="ai-btn-copy" data-code="${codeEsc}">⎘ Copy</button>
      </div>
      <pre class="ai-code-pre"><code>${codeEsc}</code></pre>
    </div>`;
  }).join('');
}

function _appendMessage(role, text, id) {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return null;

  const el = document.createElement('div');
  el.className = `ai-message ai-message-${role}`;
  if (id) el.id = id;

  if (role === 'assistant') {
    el.innerHTML =
      `<div class="ai-message-avatar">${ICON_SVG}</div>` +
      `<div class="ai-message-body">${_renderContent(text)}</div>`;
  } else {
    el.innerHTML =
      `<div class="ai-message-body ai-message-user-body">${_esc(text).replace(/\n/g, '<br>')}</div>`;
  }

  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

function _updateStreamEl(el, fullText) {
  if (!el) return;
  const body = el.querySelector('.ai-message-body');
  if (body) body.innerHTML = _renderContent(fullText);
  const container = document.getElementById('ai-chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

/* ── Expand / collapse ───────────────────────────────────────── */
function _expand() {
  if (_expanded) return;
  _expanded = true;
  _widget.classList.remove('ai-orb-mode');
  _widget.classList.add('ai-box-mode');
  _widget.querySelector('.ai-orb-face').hidden = true;
  _widget.querySelector('.ai-box').hidden = false;

  requestAnimationFrame(() => {
    const { x, y } = _clamp(_widget.offsetLeft, _widget.offsetTop);
    _applyPos(x, y);
    _savePos(x, y);

    if (!_getApiKey()) {
      _toggleSettings(true);
    } else {
      _toggleSettings(false);
      const msgs = document.getElementById('ai-chat-messages');
      if (msgs && !msgs.querySelector('.ai-message')) {
        _appendMessage('assistant',
          `Hi! I'm your AI assistant for HTML, CSS, and JavaScript. ` +
          `I can see your current code and apply changes directly to the editor.\n\n` +
          `Try: *"Create a responsive navbar"* or *"Add a dark mode toggle"*`
        );
      }
      document.getElementById('ai-chat-input')?.focus();
    }
  });
}

function _collapse() {
  if (!_expanded) return;
  _expanded = false;
  _widget.classList.remove('ai-box-mode');
  _widget.classList.add('ai-orb-mode');
  _widget.querySelector('.ai-orb-face').hidden = false;
  _widget.querySelector('.ai-box').hidden = true;

  requestAnimationFrame(() => {
    const { x, y } = _clamp(_widget.offsetLeft, _widget.offsetTop);
    _applyPos(x, y);
    _savePos(x, y);
  });
}

function _toggleSettings(force) {
  _showingSettings = (force !== undefined) ? force : !_showingSettings;
  const sp = document.getElementById('ai-settings-panel');
  const cp = document.getElementById('ai-chat-panel');
  if (sp) sp.hidden = !_showingSettings;
  if (cp) cp.hidden = _showingSettings;

  if (_showingSettings) {
    const ki = document.getElementById('ai-api-key-input');
    if (ki) ki.value = _getApiKey();
    const mi = document.getElementById('ai-model-input');
    if (mi) mi.value = _getModel();
  }
}

/* ── File attachment ─────────────────────────────────────────── */
const ATTACH_MAX_BYTES = 100 * 1024;

function _clearPendingFile() {
  _pendingFile = null;
  const badge = document.getElementById('ai-attach-badge');
  if (badge) badge.hidden = true;
  const fileInput = document.getElementById('ai-file-input');
  if (fileInput) fileInput.value = '';
}

function _showAttachBadge(name) {
  const badge = document.getElementById('ai-attach-badge');
  const nameEl = document.getElementById('ai-attach-name');
  if (badge)  badge.hidden = false;
  if (nameEl) nameEl.textContent = name;
}

function _handleFileSelect(file) {
  if (!file) return;
  const allowed = ['.html', '.css', '.js', '.md', '.txt', '.json'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowed.includes(ext)) {
    if (_studio) _studio.status.report('warning', `File type "${ext}" not supported`);
    return;
  }
  if (file.size > ATTACH_MAX_BYTES) {
    if (_studio) _studio.status.report('warning', `File too large (max 100 KB)`);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    _pendingFile = { name: file.name, content: e.target.result };
    _showAttachBadge(file.name);
    document.getElementById('ai-chat-input')?.focus();
  };
  reader.readAsText(file);
}

function _applyCodeToStudio(code, lang = '') {
  if (!_studio?.editor) return;

  const normalizedLang = lang.toLowerCase();

  if (normalizedLang === 'css') {
    _studio.editor.setTabContent('css', code);
    _studio.status.report('ok', 'AI CSS applied to CSS tab');
    return;
  }

  if (normalizedLang === 'javascript' || normalizedLang === 'js') {
    _studio.editor.setTabContent('js', code);
    _studio.status.report('ok', 'AI JavaScript applied to JS tab');
    return;
  }

  if (normalizedLang === 'html' || /^<!doctype|<html/i.test(code.trim())) {
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const scriptMatch = code.match(/<script(?!\s*src)[^>]*>([\s\S]*?)<\/script>/i);

    const css = styleMatch ? styleMatch[1].trim() : '';
    const js = scriptMatch ? scriptMatch[1].trim() : '';

    const cleanHtml = code
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script(?!\s*src)[^>]*>[\s\S]*?<\/script>/gi, '')
      .trim();

    _studio.editor.setAllContents({
      html: cleanHtml,
      css,
      js,
    });

    _studio.status.report('ok', 'AI HTML applied across tabs');
    return;
  }

  _studio.editor.setActiveContent(code);
  _studio.status.report('ok', 'AI code applied to editor');
}

/* ── Send message ────────────────────────────────────────────── */
async function _handleSend() {
  if (_isStreaming) return;
  const input = document.getElementById('ai-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text && !_pendingFile) return;

  input.value = '';
  input.style.height = '';

  let fullText = text;
  if (_pendingFile) {
    const ext = _pendingFile.name.split('.').pop().toLowerCase();
    const lang = ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'js' ? 'javascript' : ext === 'json' ? 'json' : 'text';
    const fileBlock = `📎 **${_pendingFile.name}**\n\`\`\`${lang}\n${_pendingFile.content}\n\`\`\``;
    fullText = text ? `${fileBlock}\n\n${text}` : fileBlock;
    _clearPendingFile();
  }

  _appendMessage('user', fullText);

  const streamId = `ai-stream-${Date.now()}`;
  const streamEl = _appendMessage('assistant', '…', streamId);
  const sendBtn  = document.getElementById('ai-btn-send');

  _isStreaming = true;
  if (sendBtn) sendBtn.disabled = true;

  await _callAPI(
    fullText,
    (full) => { _updateStreamEl(streamEl, full); },
    (full) => {
      _isStreaming = false;
      if (sendBtn) sendBtn.disabled = false;
      _updateStreamEl(streamEl, full);
    },
    (errMsg) => {
      _isStreaming = false;
      if (sendBtn) sendBtn.disabled = false;
      const body = streamEl?.querySelector('.ai-message-body');
      if (body) body.innerHTML = `<span class="ai-error">⚠ ${_esc(errMsg)}</span>`;
    },
  );
}

/* ── Widget DOM ──────────────────────────────────────────────── */
function _buildWidget() {
  const el = document.createElement('div');
  el.id        = 'ai-widget';
  el.className = 'ai-widget ai-orb-mode';
  el.setAttribute('role', 'complementary');
  el.setAttribute('aria-label', 'AI assistant');

  const tpl = document.createElement('template');
  tpl.innerHTML = `
    <div class="ai-orb-face" title="Open AI Assistant (drag to move)">
      <div class="ai-orb-icon">${ICON_SVG}</div>
    </div>

    <div class="ai-box" hidden>
      <div class="ai-header">
        <div class="ai-header-icon">${ICON_SVG}</div>
        <span class="ai-header-title">AI Assistant</span>
        <button class="ai-btn-icon" id="ai-btn-settings" title="Settings" aria-label="Settings">⚙️</button>
        <button class="ai-btn-icon" id="ai-btn-minimize" title="Minimize" aria-label="Minimize">⤡</button>
      </div>

      <div class="ai-settings-panel" id="ai-settings-panel" hidden>
        <div class="ai-settings-scroll">
          <div class="ai-settings-banner">
            <strong>🔑 OpenRouter API Key required</strong>
            <p>The AI assistant uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a> to access AI models. Sign up for a <strong>free</strong> API key — no credit card needed.</p>
            <p>Default model: <code>openrouter/owl-alpha</code> — change it below if needed.</p>
          </div>
          <label class="ai-settings-label" for="ai-api-key-input">API Key</label>
          <input type="password" id="ai-api-key-input" class="ai-settings-input" placeholder="sk-or-…" autocomplete="new-password" spellcheck="false" />
          <label class="ai-settings-label" for="ai-model-input" style="margin-top:8px;">Model ID</label>
          <input type="text" id="ai-model-input" class="ai-settings-input" autocomplete="off" spellcheck="false" />
          <button id="ai-btn-save-settings" class="ai-btn-primary">Save &amp; Start Chatting</button>
          <button id="ai-btn-test-key" class="ai-btn-ghost">Test Key</button>
          <div id="ai-test-result" style="margin-top:6px;font-size:11px;word-break:break-all;"></div>
          <button id="ai-btn-clear-history" class="ai-btn-ghost">Clear Chat History</button>
        </div>
      </div>

      <div class="ai-chat-panel" id="ai-chat-panel" hidden>
        <div class="ai-chat-messages" id="ai-chat-messages" role="log" aria-live="polite"></div>
        <div class="ai-attach-badge" id="ai-attach-badge" hidden>
          <span class="ai-attach-icon">📎</span>
          <span class="ai-attach-name" id="ai-attach-name"></span>
          <button class="ai-attach-remove" id="ai-attach-remove" title="Remove attachment" aria-label="Remove attachment">✕</button>
        </div>
        <div class="ai-chat-input-row">
          <input type="file" id="ai-file-input" accept=".html,.css,.js,.md,.txt,.json" style="display:none" aria-label="Attach file" />
          <button id="ai-btn-attach" class="ai-btn-attach" title="Attach a code file" aria-label="Attach file">📎</button>
          <textarea
            id="ai-chat-input"
            class="ai-chat-input"
            rows="2"
            placeholder="Ask AI to help with your HTML, CSS, or JS…"
            aria-label="Message AI assistant"
            spellcheck="true"
          ></textarea>
          <button id="ai-btn-send" class="ai-btn-send" title="Send (Enter)" aria-label="Send">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  el.appendChild(tpl.content);
  return el;
}

/* ── Public init ─────────────────────────────────────────────── */
/**
 * Initialise the AI floating widget.
 * @param {{
 *   studio : import('./studio-controller.js').StudioController,
 * }} options
 */
export function initAIAssistant({ studio } = {}) {
  if (_widget && document.getElementById('ai-widget')) {
    if (studio) _studio = studio;
    return _widget;
  }

  _studio = studio || window.studio || null;

  window.aiAssistant = {
    ping() {
      return {
        ok: true,
        hasStudio: !!_studio,
        model: _getModel(),
        widgetMounted: !!_widget,
      };
    },

    setStudio(nextStudio) {
      _studio = nextStudio;
      return !!_studio;
    },

    getStudio() {
      return _studio;
    },
  };

  _widget = _buildWidget();
  document.body.appendChild(_widget);

  const saved = _loadPos();
  if (saved) {
    _applyPos(saved.x, saved.y);
  } else {
    requestAnimationFrame(() => {
      const x = window.innerWidth  - _widget.offsetWidth  - 24;
      const y = window.innerHeight - _widget.offsetHeight - 80;
      _applyPos(x, y);
      _savePos(x, y);
    });
  }

  _initDrag();

  document.getElementById('ai-btn-minimize').addEventListener('click', (e) => {
    e.stopPropagation();
    _collapse();
  });

  document.getElementById('ai-btn-settings').addEventListener('click', (e) => {
    e.stopPropagation();
    _toggleSettings();
  });

  document.getElementById('ai-btn-test-key').addEventListener('click', () => { _testKey(); });

  document.getElementById('ai-btn-save-settings').addEventListener('click', () => {
    const k = (document.getElementById('ai-api-key-input').value || '').trim();
    const m = (document.getElementById('ai-model-input').value  || '').trim() || DEFAULT_MODEL;
    if (k) localStorage.setItem(AI_KEY_STORE, k);
    localStorage.setItem(AI_MODEL_STORE, m);
    _toggleSettings(false);

    const msgs = document.getElementById('ai-chat-messages');
    if (msgs && !msgs.querySelector('.ai-message')) {
      _appendMessage('assistant',
        `All set! I can help you build HTML pages, CSS styles, and JavaScript interactions.\n\n` +
        `Any code I produce includes an **Apply to Editor** button to load it instantly.`
      );
    }
    document.getElementById('ai-chat-input')?.focus();
  });

  document.getElementById('ai-btn-clear-history').addEventListener('click', () => {
    _messages = [];
    const msgs = document.getElementById('ai-chat-messages');
    if (msgs) msgs.innerHTML = '';
    _toggleSettings(false);
    _appendMessage('assistant', 'Chat history cleared. How can I help with your code?');
    document.getElementById('ai-chat-input')?.focus();
  });

  document.getElementById('ai-btn-attach').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('ai-file-input').click();
  });

  document.getElementById('ai-file-input').addEventListener('change', (e) => {
    _handleFileSelect(e.target.files[0] || null);
  });

  document.getElementById('ai-attach-remove').addEventListener('click', (e) => {
    e.stopPropagation();
    _clearPendingFile();
  });

  document.getElementById('ai-btn-send').addEventListener('click', (e) => {
    e.stopPropagation();
    _handleSend();
  });

  document.getElementById('ai-chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      _handleSend();
    }
  });

  document.getElementById('ai-chat-input').addEventListener('input', (e) => {
    e.target.style.height = '';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
  });

  document.getElementById('ai-chat-messages').addEventListener('click', (e) => {
    const applyBtn = e.target.closest('.ai-btn-apply');
    const copyBtn  = e.target.closest('.ai-btn-copy');

    if (applyBtn) {
      const code = applyBtn.dataset.code;
      const lang = applyBtn.parentElement?.querySelector('.ai-code-lang')?.textContent || '';
      _applyCodeToStudio(code, lang);
      return;
    }


    if (copyBtn) {
      navigator.clipboard.writeText(copyBtn.dataset.code).then(() => {
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => { copyBtn.innerHTML = '⎘ Copy'; }, 1600);
      }).catch(() => {
        copyBtn.textContent = '✗ Failed';
        setTimeout(() => { copyBtn.innerHTML = '⎘ Copy'; }, 1600);
      });
    }
  });

  window.addEventListener('resize', () => {
    const { x, y } = _clamp(_widget.offsetLeft, _widget.offsetTop);
    _applyPos(x, y);
    _savePos(x, y);
  });
}
