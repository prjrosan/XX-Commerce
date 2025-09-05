#!/bin/bash
set -e
echo "Starting build process..."

# Set NODE_ENV to production
export NODE_ENV=production

echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server
npm install

echo "Building TypeScript..."
npm run build

echo "Verifying build..."
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: dist/index.js not found after build!"
    exit 1
fi

echo "Build completed successfully!"
