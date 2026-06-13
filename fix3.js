const fs = require('fs');
let content = fs.readFileSync('js/themer.js', 'utf8');

// Replace the corrupted line 163 with clean separate lines
const corrupted = "  if (s.borderRadius && s.borderRadius > 0) lines.push(`border-radius: ${s.borderRadius}px;`);if (s.borderRadius && s.borderRadius > 0) lines.push('border-radius: ' + s.borderRadius + 'px;'); s.borderRadius > 0) lines.push('border-radius: ' + s.borderRadius + 'px;'); if (s.outlineWidth && s.outlineWidth > 0) lines.push('outline: ' + s.outlineWidth + 'px " + "s.outlineStyle + ' ' + s.outlineColor + ';'); if (s.outlineOffset !== 0) lines.push('outline-offset: ' + s.outlineOffset + 'px;'); if (s.borderImageSource && s.borderImageSource !== 'none') lines.push('border-image: ' + s.borderImageSource + ' ' + s.borderImageSlice + ' ' + s.borderImageWidth + ' ' + s.borderImageOutset + ' ' + s.borderImageRepeat + ';');";

const clean = [
  "  if (s.borderRadius && s.borderRadius > 0) lines.push('border-radius: ' + s.borderRadius + 'px;');",
  "  if (s.outlineWidth && s.outlineWidth > 0) lines.push('outline: ' + s.outlineWidth + 'px ' + s.outlineStyle + ' ' + s.outlineColor + ');",
  "  if (s.outlineOffset !== 0) lines.push('outline-offset: ' + s.outlineOffset + 'px;');",
  "  if (s.borderImageSource && s.borderImageSource !== 'none') lines.push('border-image: ' + s.borderImageSource + ' ' + s.borderImageSlice + ' ' + s.borderImageWidth + ' ' + s.borderImageOutset + ' ' + s.borderImageRepeat + ');"
].join('\n');

if (content.includes(corrupted)) {
  content = content.replace(corrupted, clean);
  console.log('Fixed corrupted line');
} else {
  // Try a more flexible approach - find the line by pattern
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('borderRadius') && lines[i].includes('outlineWidth') && lines[i].includes('borderImageSource')) {
      lines.splice(i, 1, ...clean.split('\n'));
      content = lines.join('\n');
      console.log('Fixed corrupted line at index', i);
      break;
    }
  }
}

fs.writeFileSync('js/themer.js', content);
console.log('Done');
