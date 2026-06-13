/* ============================================================
   SmarTools HTML Studio — Preview Module
   Renders HTML/CSS/JS in a sandboxed iframe using srcdoc.
   - No cross-origin issues (srcdoc is same-origin empty doc)
   - Live update on editor change
   - Error catching
   ============================================================ */

/** @type {HTMLIFrameElement} */
let _frame = null;

/**
 * Initialise the preview module.
 * @param {HTMLIFrameElement} frame
 */
export function initPreview(frame) {
  _frame = frame;
}

/**
 * Render the combined HTML/CSS/JS into the preview iframe.
 * Uses srcdoc to avoid cross-origin sandbox restrictions.
 * @param {string} html
 * @param {string} css
 * @param {string} js
 */
export function renderPreview(html, css, js) {
  if (!_frame) return;

  const fullDoc = buildDoc(html, css, js);

  // Use srcdoc instead of contentDocument to avoid sandbox cross-origin errors
  _frame.srcdoc = fullDoc;
}

/**
 * Build a complete HTML document from the three panes.
 */
function buildDoc(html, css, js) {
  const hasDoctype = html.trimStart().toLowerCase().startsWith('<!doctype');
  const hasHtml = html.includes('<html');

  let doc = '';

  if (hasDoctype && hasHtml) {
    doc = html;
    if (css.trim()) {
      const styleTag = `<style>\n${css}\n</style>`;
      if (doc.includes('</head>')) {
        doc = doc.replace('</head>', `${styleTag}\n</head>`);
      } else {
        doc = doc.replace('<html', `<html>\n<head>${styleTag}</head>`);
      }
    }
    if (js.trim()) {
      const scriptTag = `<script>\n${js}\n<\/script>`;
      if (doc.includes('</body>')) {
        doc = doc.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        doc += `\n${scriptTag}`;
      }
    }
  } else if (hasHtml) {
    doc = html;
    if (css.trim()) {
      const styleTag = `<style>\n${css}\n</style>`;
      if (doc.includes('</head>')) {
        doc = doc.replace('</head>', `${styleTag}\n</head>`);
      }
    }
    if (js.trim()) {
      const scriptTag = `<script>\n${js}\n<\/script>`;
      if (doc.includes('</body>')) {
        doc = doc.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        doc += `\n${scriptTag}`;
      }
    }
  } else {
    // Fragment — wrap in a full document
    doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
${css || '/* Add CSS here */'}
  </style>
</head>
<body>
${html || '<!-- Add HTML here -->'}
${js.trim() ? `<script>\n${js}\n<\/script>` : ''}
</body>
</html>`;
  }

  return doc;
}
