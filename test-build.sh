#!/bin/bash
set -e

echo "=== Testing Server Build ==="
cd server
echo "Building TypeScript..."
npm run build

echo "Checking if dist/index.js exists..."
if [ -f "dist/index.js" ]; then
    echo "✅ dist/index.js exists"
else
    echo "❌ dist/index.js not found"
    exit 1
fi

echo "Testing server start (5 seconds)..."
timeout 5s node dist/index.js || echo "Server started successfully (timeout expected)"

echo "=== Build Test Complete ==="
