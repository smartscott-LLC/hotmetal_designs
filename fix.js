const fs = require('fs');
let lines = fs.readFileSync('js/themer.js', 'utf8').split('\n');

// Find and fix the corrupted line containing duplicate borderRadius
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("borderRadius") && lines[i].includes("outlineWidth")) {
    // This is the corrupted line - replace it with clean separate lines
    const clean = [
      "  if (s.borderRadius && s.borderRadius > 0) lines.push('border-radius: ' + s.borderRadius + 'px;');",
      "  if (s.outlineWidth && s.outlineWidth > 0) lines.push('outline: ' + s.outlineWidth + 'px ' + s.outlineStyle + ' ' + s.outlineColor + ');",
      "  if (s.outlineOffset !== 0) lines.push('outline-offset: ' + s.outlineOffset + 'px;');",
      "  if (s.borderImageSource && s.borderImageSource !== 'none') lines.push('border-image: ' + s.borderImageSource + ' ' + s.borderImageSlice + ' ' + s.borderImageWidth + ' ' + s.borderImageOutset + ' ' + s.borderImageRepeat + ');"
    ];
    lines.splice(i, 1, ...clean);
    console.log('Fixed corrupted line at index', i);
    break;
  }
}

fs.writeFileSync('js/themer.js', lines.join('\n'));
console.log('Done. File is now', lines.length, 'lines');
