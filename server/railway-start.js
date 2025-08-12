#!/usr/bin/env node

// Railway Production Start Script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting XX-Commerce Server for Railway...');

// Check if dist folder exists, if not build it
const fs = require('fs');
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.log('📦 Building TypeScript...');
  const build = spawn('npm', ['run', 'build'], { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build successful, starting server...');
      startServer();
    } else {
      console.error('❌ Build failed with code:', code);
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🚀 Starting server...');
  const server = spawn('node', ['dist/index.js'], { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  server.on('close', (code) => {
    console.log('Server exited with code:', code);
    process.exit(code);
  });
}
