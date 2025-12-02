#!/usr/bin/env node

/**
 * MonoFrame Brand Asset Generator
 * Creates OG images and icons with cinematic branding
 */

const fs = require('fs');
const path = require('path');

// Output directory
const publicDir = path.join(__dirname, 'apps', 'web', 'public');

console.log('🎬 MonoFrame Brand Asset Generator\n');

// For now, we'll create SVG versions that can be converted to PNG
// In production, use proper image generation tools

// Create OG Image (1200x630) as SVG
const ogMonoframeSVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark cinematic gradient background -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
    </linearGradient>
    
    <!-- Film grain texture pattern -->
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend mode="overlay" in="SourceGraphic"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  <rect width="1200" height="630" fill="#000" opacity="0.02" filter="url(#grain)"/>
  
  <!-- Glowing frame lines -->
  <rect x="20" y="20" width="1160" height="590" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
  
  <!-- Brand wordmark -->
  <text 
    x="600" 
    y="280" 
    text-anchor="middle" 
    fill="white" 
    font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" 
    font-size="80" 
    font-weight="700" 
    letter-spacing="12">
    MONOFRAME
  </text>
  
  <!-- Tagline -->
  <text 
    x="600" 
    y="360" 
    text-anchor="middle" 
    fill="rgba(255,255,255,0.7)" 
    font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" 
    font-size="28" 
    font-weight="400" 
    letter-spacing="8">
    THE AI FILM EDITOR
  </text>
  
  <!-- Accent lines -->
  <line x1="400" y1="400" x2="800" y2="400" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
</svg>`;

// Create Demo OG Image (1200x630) as SVG
const ogDemoSVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark cinematic gradient background -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
    </linearGradient>
    
    <!-- Film grain texture pattern -->
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend mode="overlay" in="SourceGraphic"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  <rect width="1200" height="630" fill="#000" opacity="0.02" filter="url(#grain)"/>
  
  <!-- Glowing frame lines -->
  <rect x="20" y="20" width="1160" height="590" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
  
  <!-- Brand wordmark -->
  <text 
    x="600" 
    y="260" 
    text-anchor="middle" 
    fill="white" 
    font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" 
    font-size="72" 
    font-weight="700" 
    letter-spacing="10">
    MONOFRAME
  </text>
  
  <!-- Separator -->
  <text 
    x="600" 
    y="330" 
    text-anchor="middle" 
    fill="rgba(255,255,255,0.4)" 
    font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" 
    font-size="32" 
    font-weight="300">
    —
  </text>
  
  <!-- Tagline -->
  <text 
    x="600" 
    y="390" 
    text-anchor="middle" 
    fill="rgba(255,255,255,0.8)" 
    font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" 
    font-size="32" 
    font-weight="500" 
    letter-spacing="6">
    LIVE EDITOR DEMO
  </text>
</svg>`;

// Create Icon (512x512) as SVG
const iconSVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background -->
  <rect width="512" height="512" fill="#0a0a0a"/>
  
  <!-- Film frame outline -->
  <rect x="96" y="96" width="320" height="320" rx="8" stroke="white" stroke-width="12" fill="none" opacity="0.95"/>
  
  <!-- Film sprocket holes -->
  <rect x="80" y="140" width="20" height="40" fill="white" opacity="0.6" rx="4"/>
  <rect x="80" y="332" width="20" height="40" fill="white" opacity="0.6" rx="4"/>
  <rect x="412" y="140" width="20" height="40" fill="white" opacity="0.6" rx="4"/>
  <rect x="412" y="332" width="20" height="40" fill="white" opacity="0.6" rx="4"/>
  
  <!-- Geometric "M" -->
  <path 
    d="M 160 340 L 160 180 L 256 276 L 352 180 L 352 340" 
    stroke="white" 
    stroke-width="24" 
    stroke-linecap="square"
    stroke-linejoin="miter"
    fill="none"
  />
  
  <!-- Center vertical accent -->
  <line x1="256" y1="276" x2="256" y2="340" stroke="white" stroke-width="24" stroke-linecap="square"/>
</svg>`;

// Write SVG files (these can serve as fallbacks)
fs.writeFileSync(path.join(publicDir, 'og-monoframe.svg'), ogMonoframeSVG);
fs.writeFileSync(path.join(publicDir, 'og-monoframe-demo.svg'), ogDemoSVG);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSVG);

console.log('✅ Created SVG versions:');
console.log('   - og-monoframe.svg');
console.log('   - og-monoframe-demo.svg');
console.log('   - icon.svg');
console.log('\n📝 Note: For production PNG files, use one of these methods:');
console.log('   1. Open SVG files in browser and screenshot at exact dimensions');
console.log('   2. Use: npx @resvg/resvg-js og-monoframe.svg og-monoframe.png');
console.log('   3. Use online tool: https://svgtopng.com/');
console.log('   4. Use Figma/Sketch to export as PNG');
console.log('\n🎬 SVG files are production-ready and will work in most contexts!');


