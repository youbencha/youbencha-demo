// Simple script to generate PWA icons as SVG files
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'images', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for the TaskFlow icon
function generateIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" rx="115" fill="#6366f1"/>
  
  <!-- Checkmark circle -->
  <circle cx="256" cy="256" r="150" fill="white" opacity="0.95"/>
  
  <!-- Checkmark -->
  <path d="M195 256L235 296L320 211" stroke="#6366f1" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Lines decoration -->
  <line x1="150" y1="150" x2="220" y2="150" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.8"/>
  <line x1="150" y1="190" x2="200" y2="190" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.6"/>
  <line x1="292" y1="320" x2="362" y2="320" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.8"/>
  <line x1="312" y1="360" x2="362" y2="360" stroke="white" stroke-width="16" stroke-linecap="round" opacity="0.6"/>
</svg>`;
}

// Generate SVG icons
sizes.forEach(size => {
  const svg = generateIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`Generated: ${filename}`);
});

console.log('\nSVG icons generated successfully!');
console.log('Note: For production, convert these SVG files to PNG format using an image editor or conversion tool.');
