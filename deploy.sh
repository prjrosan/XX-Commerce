#!/bin/bash
set -e

echo "=== XX-Commerce Deployment Script ==="
echo "Starting deployment process..."

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-10000}

echo "Environment:"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build and start server
echo "Building server..."
cd server
npm install
npm run build

echo "Verifying build..."
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: dist/index.js not found after build!"
    exit 1
fi

echo "Starting server..."
node dist/index.js
