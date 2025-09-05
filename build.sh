#!/bin/bash
set -e
echo "Starting build process..."
echo "Installing root dependencies..."
npm install
echo "Installing server dependencies..."
cd server
npm install
echo "Building TypeScript..."
npm run build
echo "Build completed successfully!"
