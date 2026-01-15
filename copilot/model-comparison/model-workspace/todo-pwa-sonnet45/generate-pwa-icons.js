const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'images', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG content for each size
function generateSVG(size) {
  const scale = size / 512;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="rounded">
      <rect width="${size}" height="${size}" rx="${size * 0.225}" ry="${size * 0.225}"/>
    </clipPath>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.225}" fill="#6366f1"/>
  
  <!-- White circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${150 * scale}" fill="white" opacity="0.95"/>
  
  <!-- Checkmark -->
  <path d="M ${195 * scale} ${256 * scale} L ${235 * scale} ${296 * scale} L ${320 * scale} ${211 * scale}" 
        stroke="#6366f1" stroke-width="${32 * scale}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Decorative lines -->
  <line x1="${150 * scale}" y1="${150 * scale}" x2="${220 * scale}" y2="${150 * scale}" 
        stroke="white" stroke-width="${16 * scale}" stroke-linecap="round" opacity="0.8"/>
  <line x1="${150 * scale}" y1="${190 * scale}" x2="${200 * scale}" y2="${190 * scale}" 
        stroke="white" stroke-width="${16 * scale}" stroke-linecap="round" opacity="0.6"/>
  <line x1="${292 * scale}" y1="${320 * scale}" x2="${362 * scale}" y2="${320 * scale}" 
        stroke="white" stroke-width="${16 * scale}" stroke-linecap="round" opacity="0.8"/>
  <line x1="${312 * scale}" y1="${360 * scale}" x2="${362 * scale}" y2="${360 * scale}" 
        stroke="white" stroke-width="${16 * scale}" stroke-linecap="round" opacity="0.6"/>
</svg>`;
}

// Generate PNG icons using SVG
sizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  const svgFilepath = path.join(iconsDir, svgFilename);
  
  // Save SVG file
  fs.writeFileSync(svgFilepath, svg);
  console.log(`Generated SVG: ${svgFilename}`);
  
  // For PNG generation, we'll create a data URL that can be used in browsers
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  
  // Create a simple HTML file that can be used to convert SVG to PNG
  const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Convert ${filename}</title></head>
<body style="margin:0;padding:0;">
<canvas id="canvas" width="${size}" height="${size}"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = function() {
  ctx.drawImage(img, 0, 0, ${size}, ${size});
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '${filename}';
    a.click();
  }, 'image/png');
};
img.src = '${dataUrl}';
</script>
</body></html>`;
  
  const htmlPath = path.join(iconsDir, `convert-${size}.html`);
  fs.writeFileSync(htmlPath, htmlContent);
});

// Create a master HTML file to convert all icons
const masterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow Icon Generator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
            background: #f8fafc;
        }
        h1 { color: #6366f1; }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .icons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .icon-item {
            text-align: center;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
        }
        canvas {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .filename {
            margin-top: 10px;
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
        }
        button {
            background: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 5px 0 0;
        }
        button:hover { background: #4f46e5; }
        .instructions {
            background: #e0e7ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            color: #3730a3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 TaskFlow Icon Generator</h1>
        
        <div class="instructions">
            <h3>Quick Start:</h3>
            <ol>
                <li>Click "Download All Icons" to save all PNG files at once</li>
                <li>Or right-click individual icons below and "Save image as..."</li>
                <li>Place all downloaded PNG files in the <code>images/icons/</code> folder</li>
            </ol>
        </div>

        <button onclick="downloadAll()">📦 Download All Icons</button>
        <button onclick="location.reload()">🔄 Regenerate</button>
        
        <div class="icons-grid" id="iconsGrid"></div>
    </div>

    <script>
        const sizes = ${JSON.stringify(sizes)};
        
        function drawIcon(canvas, size) {
            const ctx = canvas.getContext('2d');
            const scale = size / 512;
            
            canvas.width = size;
            canvas.height = size;
            
            // Enable high quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Background with rounded corners
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            const radius = size * 0.225;
            ctx.roundRect(0, 0, size, size, radius);
            ctx.fill();
            
            // White circle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(size/2, size/2, 150 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Checkmark
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 32 * scale;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(195 * scale, 256 * scale);
            ctx.lineTo(235 * scale, 296 * scale);
            ctx.lineTo(320 * scale, 211 * scale);
            ctx.stroke();
            
            // Decorative lines
            ctx.lineCap = 'round';
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 16 * scale;
            ctx.beginPath();
            ctx.moveTo(150 * scale, 150 * scale);
            ctx.lineTo(220 * scale, 150 * scale);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(150 * scale, 190 * scale);
            ctx.lineTo(200 * scale, 190 * scale);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.moveTo(292 * scale, 320 * scale);
            ctx.lineTo(362 * scale, 320 * scale);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(312 * scale, 360 * scale);
            ctx.lineTo(362 * scale, 360 * scale);
            ctx.stroke();
        }

        function generateIcons() {
            const grid = document.getElementById('iconsGrid');
            grid.innerHTML = '';
            
            sizes.forEach(size => {
                const container = document.createElement('div');
                container.className = 'icon-item';
                
                const canvas = document.createElement('canvas');
                canvas.id = 'canvas-' + size;
                drawIcon(canvas, size);
                
                const filename = document.createElement('div');
                filename.className = 'filename';
                filename.textContent = \`icon-\${size}x\${size}.png\`;
                
                container.appendChild(canvas);
                container.appendChild(filename);
                grid.appendChild(container);
            });
        }

        function downloadCanvas(canvas, filename) {
            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                    setTimeout(resolve, 100);
                }, 'image/png');
            });
        }

        async function downloadAll() {
            for (const size of sizes) {
                const canvas = document.getElementById('canvas-' + size);
                if (canvas) {
                    await downloadCanvas(canvas, \`icon-\${size}x\${size}.png\`);
                }
            }
            alert('All icons downloaded! Check your Downloads folder.');
        }

        // Auto-generate on load
        window.addEventListener('load', generateIcons);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'icon-generator.html'), masterHtml);

console.log('\n✅ Icon generation setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Open: images/icons/icon-generator.html in your browser');
console.log('2. Click "Download All Icons" button');
console.log('3. PNG files will be automatically saved to your Downloads folder');
console.log('4. Move the PNG files to images/icons/ folder');
