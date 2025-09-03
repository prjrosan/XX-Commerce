#!/bin/bash
set -e
echo "Starting build process..."
cd server
echo "Installing dependencies..."
npm install
echo "Building TypeScript..."
npm run build
echo "Build completed successfully!"
