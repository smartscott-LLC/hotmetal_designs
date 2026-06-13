const fs = require('fs');
let lines = fs.readFileSync('js/themer.js', 'utf8').split('\n');

// Find the corrupted line (line 156 in 1-based = index 155)
// It contains: borderRadius duplicated + outline + border-image all mangled together
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('borderRadius') && lines[i].includes('outlineWidth') && lines[i].includes('borderImageSource')) {
    // Replace this single corrupted line with 4 clean separate lines
    lines[i] = "  if (s.borderRadius && s.borderRadius > 0) lines.push('border-radius: ' + s.borderRadius + 'px;');";
    lines.splice(i + 1, 0,
      "  if (s.outlineWidth && s.outlineWidth > 0) lines.push('outline: ' + s.outlineWidth + 'px ' + s.outlineStyle + ' ' + s.outlineColor + ');",
      "  if (s.outlineOffset !== 0) lines.push('outline-offset: ' + s.outlineOffset + 'px;');",
      "  if (s.borderImageSource && s.borderImageSource !== 'none') lines.push('border-image: ' + s.borderImageSource + ' ' + s.borderImageSlice + ' ' + s.borderImageWidth + ' ' + s.borderImageOutset + ' ' + s.borderImageRepeat + ');"
    );
    console.log('Fixed corrupted line at index', i);
    break;
  }
}

fs.writeFileSync('js/themer.js', lines.join('\n'));
console.log('Done. File is now', lines.length, 'lines');
