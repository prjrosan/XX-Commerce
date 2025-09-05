#!/bin/bash
set -e

echo "Building client for Render deployment..."

# Set environment variable to override rollup platform detection
export VITE_ROLLUP_PLATFORM_OVERRIDE=true

# Navigate to client directory
cd client

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building with platform override..."
npm run build

echo "Build completed successfully!"
