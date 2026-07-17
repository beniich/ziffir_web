const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#05070A';
  ctx.fillRect(0, 0, size, size);
  
  // Gold Logo 'Z'
  ctx.fillStyle = '#D4AF37';
  ctx.font = `bold ${size * 0.6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Z', size / 2, size / 2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/pwa-${size}x${size}.png`, buffer);
}

createIcon(192);
createIcon(512);
console.log('Icons created');
