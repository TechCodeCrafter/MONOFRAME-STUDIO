#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const publicDir = path.join(__dirname, 'apps', 'web', 'public');

async function convertSVGtoPNG() {
  console.log('🎬 Converting SVG to PNG using screencapture...\n');
  
  // Try using built-in macOS tools or Node.js methods
  const conversions = [
    { svg: 'og-monoframe.svg', png: 'og-monoframe.png', width: 1200, height: 630 },
    { svg: 'og-monoframe-demo.svg', png: 'og-monoframe-demo.png', width: 1200, height: 630 },
    { svg: 'icon.svg', png: 'icon.png', width: 512, height: 512 },
  ];
  
  // For now, let's create placeholder HTML files that render the SVGs
  // and can be screenshot
  for (const { svg, png, width, height } of conversions) {
    const svgPath = path.join(publicDir, svg);
    const pngPath = path.join(publicDir, png);
    const htmlPath = path.join(publicDir, `_temp_${svg}.html`);
    
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; }
    svg { display: block; width: ${width}px; height: ${height}px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
    
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ Created temp HTML: ${path.basename(htmlPath)}`);
  }
  
  console.log('\n📝 To convert to PNG:');
  console.log('   1. Open the _temp_*.html files in Chrome');
  console.log('   2. Right-click → "Save image as..." → PNG');
  console.log('   3. Or use: https://cloudconvert.com/svg-to-png');
  console.log('\n💡 Or run this command for each file:');
  console.log('   npx playwright screenshot file://path/to/_temp_og-monoframe.svg.html og-monoframe.png --viewport-size=1200,630');
}

convertSVGtoPNG().catch(console.error);


