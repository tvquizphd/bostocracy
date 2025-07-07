const Math = require('mathjs');

function toIconLine(color, degrees, thickness, length, opacity) {
  const hexColor = `#${color}`;
  const style = (
    `fill:none;stroke-width:${thickness};` +
    `stroke:${hexColor};stroke-opacity:${opacity}`
  );
  const radians = Math.pi * (degrees / 180);
  const y0 = -1 * Math.sin(radians - Math.pi) * length / 2;
  const x0 = Math.cos(radians - Math.pi) * length / 2;
  const y1 = -1 * Math.sin(radians) * length / 2;
  const x1 = Math.cos(radians) * length / 2;
  return (
    `<path d="M${x0} ${y0}L${x1} ${y1}" style="${style}"/>`
  );
}

function toIcon(properties) {
  const gray = "558";
  const lines = [];
  
  for (const [color, degrees] of properties) {
    lines.push(
      toIconLine(gray, degrees, 3, 10, 1),
      toIconLine(color, degrees, 2, 7, 0.9)
    );
  }
  
  const core = lines
    .filter((_, i) => i % 2 === 0)
    .concat(lines)
    .map(line => `<g transform="translate(5 5)">${line}</g>`)
    .join('');
    
  return `<?xml version="1.0" encoding="UTF-8"?><svg id="svg5" width="25" height="25" version="1.1" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">${core}</svg>`;
}

function toLine(color, degrees) {
  return toIcon([[color, degrees]]);
}

function toLines(color1, degrees1, color2, degrees2) {
  return toIcon([
    [color1, degrees1], [color2, degrees2]
  ]);
}

module.exports = {
  toLine,
  toLines,
  toIcon,
  toIconLine
}; 