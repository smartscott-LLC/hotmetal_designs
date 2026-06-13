# 🔥 HoT MetaL Designs

**They're blazing fast!!**

A powerful, AI-powered visual HTML builder PWA. Code on the left, live preview on the right — with a full Style Studio, Animation Builder, Image Manager, and AI assistant built right in.

![Palette](https://img.shields.io/badge/Style_Studio-Complete-gold)
![AI](https://img.shields.io/badge/AI_Assistant-OpenRouter-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![License](https://img.shields.io/badge/License-MIT-slate)

---

## ✨ Features

### 🎨 Visual Editor
- **Split-pane layout** — code editor on the left, live preview on the right
- **3 editor tabs** — HTML, CSS, and JavaScript with full syntax highlighting
- **Live preview** — real-time rendered output as you type
- **Draggable divider** — resize panels to your preference
- **Undo/Redo** — 50-step history per tab
- **Command Palette** (Ctrl+K) — search templates, snippets, and actions

### 🖼️ Style Studio (🎨 Style Panel)
A complete visual CSS editor — no coding required:

- **Colors** — text, background, accent, link, border, shadow with color pickers + hex input
- **Typography** — font family (10+ fonts), size, weight, line height, letter spacing, text align, text transform
- **Borders** — width, color, style (solid/dashed/dotted/double/groove/ridge), radius
- **Outline** — width, color, style (solid/dashed/dotted/double/groove/ridge), offset (independent of border)
- **Spacing** — padding and margin sliders
- **Shadows** — X/Y offset, blur, spread, color, and opacity
- **Gradients** — linear and radial with color stops and angle control
- **CSS Filters** — blur, brightness, contrast, saturate, grayscale, hue-rotate, invert, sepia, opacity
- **Preset Palettes** — 10 beautiful one-click color schemes (Midnight, Forest, Sunset, Ocean, Lavender, Gold & Slate, Paper, Neon, Pastel, Earth)
- **Layout Editor** — visual Flexbox and CSS Grid controls with child properties
- **Animation Builder** — keyframe timeline editor with 9 presets (Fade In, Slide Up, Slide Left, Bounce, Pulse, Shake, Rotate, Flip, Zoom In)
- **Generated CSS** — live-updating CSS output with copy to clipboard and apply to editor

### 🖼️ Image Manager (🖼️ Images Panel)
- **Drag & drop upload** — or click to browse
- **OPFS storage** — images stored locally in the browser, persist across sessions
- **Thumbnail grid** — visual gallery of stored images
- **One-click insert** — adds `<img>` tag at cursor position
- **Image Border & Outline** — configure border (width, color, style, radius) and outline (width, color, style, offset) before inserting — generates inline styles on the `<img>` tag
- **Storage meter** — see how much space you're using
- **Supports** — PNG, JPG, GIF, WebP, SVG, AVIF

### 🤖 AI Assistant
- **Floating orb** — gold gradient, draggable, pulses to get your attention
- **Expandable chat** — tap to expand into full chat panel
- **OpenRouter powered** — bring your own API key, access multiple AI models
- **Context aware** — AI sees your current code and can apply changes directly
- **"Apply to Editor"** — one-click to insert AI-generated code
- **File attachment** — attach code files for AI review
- **Chat history** — persists across sessions

### 💾 Vault (Local Storage)
- **OPFS (Origin Private File System)** — files stored locally, never leave the device
- **Save/Load** — persist projects across sessions
- **Recent files** — quick access to recently opened projects
- **Storage management** — see usage, delete old files

### 📤 Export
- **Standalone HTML** — single file with all CSS/JS inlined
- **Copy to clipboard** — quick copy of combined HTML
- **ZIP package** — separate HTML, CSS, JS files (coming soon)

### 📱 PWA
- **Installable** — add to home screen, works like a native app
- **Offline capable** — service worker for offline access
- **Responsive** — works on desktop and mobile

---

## 🚀 Quick Start

### Option 1: Open directly
1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari)
2. Start building! All features work out of the box.

### Option 2: Serve locally (recommended)
```bash
# Using the included dev server
node server.mjs
# → http://localhost:3000

# Or use any static server
npx serve .
# → http://localhost:3000
```

### Option 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🎯 Usage

### Getting Started
1. **Choose a template** — press `Ctrl+K` and search "template" to pick from 8 starter templates (Blank, Landing Page, Dashboard, Contact Form, Portfolio, Card, Navbar, Pricing)
2. **Edit code** — type HTML/CSS/JS in the editor tabs
3. **See changes instantly** — the preview updates as you type
4. **Style visually** — click 🎨 Style to open the Style Studio
5. **Add images** — click 🖼️ Images to upload and manage images, configure border & outline styles before inserting
6. **Get AI help** — click the gold orb in the bottom-right corner
7. **Save** — press `Ctrl+S` or click 💾 Save
8. **Export** — click 📤 Export to download your project

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open Command Palette |
| `Ctrl+S` | Save to Vault |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+F` | Find in editor |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Space` | Autocomplete |

### Style Studio Workflow
1. Select a **target element** (body, h1, p, button, img, etc.)
2. Adjust colors, typography, borders, outline, spacing, shadows
3. Add gradients, filters, or animations
4. Pick a preset palette for instant theming
5. Set up Flexbox or Grid layouts
6. Click **Copy CSS** or **Apply to CSS Tab**

### Animation Workflow
1. Check **Enable Animation**
2. Set name, duration, timing, delay, iterations, direction
3. Pick a **preset** or build custom keyframes
4. Click keyframes in the timeline to edit properties (opacity, translate, scale, rotate, background)
5. Add/remove keyframes with the **+ Add** button
6. Copy or apply the generated CSS

### Image Border & Outline Workflow
1. Open the **Image Manager** (🖼️ Images)
2. **Select an image** from the thumbnail grid
3. In the **Border & Outline** section:
   - Set **border** width, color, style, and radius
   - Set **outline** width, color, style, and offset (outline sits outside the border)
4. Click **⬆ Insert into HTML** — the `<img>` tag includes inline styles like:
   ```html
   <img src="images/photo.png" alt="photo.png" style="border: 3px solid #b8860b; border-radius: 8px; outline: 2px dashed #d4a843; outline-offset: 4px;" />
   ```
5. Or use the **Style Studio** → select `img — Image` target to apply outline/border via CSS rules

---

## 🏗️ Architecture

```
smarthub/
├── index.html              # PWA entry point
├── manifest.json           # PWA manifest
├── icon.svg                # App icon
├── server.mjs              # Dev server (ESM-compatible)
├── css/
│   ├── app.css             # Main styles + CSS variables
│   ├── ai-widget.css       # AI orb + chat panel styles
│   └── themer.css          # Style Studio panel styles
├── js/
│   ├── app.js              # Main orchestrator
│   ├── editor.js           # CodeMirror editor
│   ├── preview.js          # Live iframe preview
│   ├── themer.js           # Style Studio module
│   ├── ai-assistant.js     # AI chat module
│   ├── smartbar.js         # Command palette
│   ├── vault.js            # OPFS file storage
│   ├── images.js           # Image vault storage
│   ├── image-panel.js      # Image manager UI
│   ├── templates.js        # HTML templates
│   └── snippets.js         # Code snippets
└── README.md               # This file
```

**Tech Stack:**
- Vanilla JavaScript (ES modules) — no frameworks
- CodeMirror 5 — code editor
- OPFS — local file storage
- OpenRouter — AI API
- CSS Custom Properties — theming
- PWA — installable, offline-ready

---

## 🎨 Color Palette

The app uses a sophisticated neutral palette designed to never clash with user content:

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Gold | `#b8860b` | Accents, active states |
| Bright Gold | `#d4a843` | Highlights, hover states |
| Black | `#1a1a1a` | Primary dark bg, text |
| Slate Grey | `#4a4a5a` | Secondary dark, borders |
| Liquid Silver | `#c0c0c0` | Light bg, dividers |
| Off-white | `#e8e8e8` | Text on dark backgrounds |

---

## 🤖 AI Setup

The AI assistant uses OpenRouter for model access:

1. Click the **gold orb** in the bottom-right corner
2. Click the **⚙️ Settings** button
3. Enter your **OpenRouter API key** (free signup at [openrouter.ai](https://openrouter.ai))
4. Optionally change the **model ID** (default: `openrouter/owl-alpha`)
5. Click **Save & Start Chatting**

---

## 📝 License

MIT License — use it, modify it, share it.

---

## 🙏 Credits

Built by **SmartScott** with 🦉 **Owl Alpha** — the monster AI that doesn't quit.

**HoT MetaL Designs** — *They're blazing fast!!*
