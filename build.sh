#!/bin/bash
set -e

echo "🔧 Starting POS System build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install || { echo "❌ Failed to install root dependencies"; exit 1; }
echo "✅ Root dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install || { echo "❌ Failed to install frontend dependencies"; exit 1; }
cd ..
echo "✅ Frontend dependencies installed"

# Build backend
echo "🏗️  Building backend..."
npm run build:server || { echo "❌ Backend build failed"; exit 1; }

# Verify backend build output
if [ ! -f "dist/server.js" ]; then
  echo "❌ Error: dist/server.js was not created!"
  echo "📂 Checking what's in dist directory:"
  ls -la dist/ || echo "dist directory does not exist"
  exit 1
fi
echo "✅ Backend built successfully - dist/server.js created"

# Build frontend
echo "🏗️  Building frontend..."
npm run build:client || { echo "❌ Frontend build failed"; exit 1; }
echo "✅ Frontend built successfully"

# Copy frontend build to backend dist
echo "📋 Copying frontend build to backend..."
mkdir -p dist/public
cp -r frontend/dist/* dist/public/ || { echo "❌ Failed to copy frontend build"; exit 1; }
echo "✅ Frontend files copied to dist/public"

echo "✅ Build completed successfully!"
echo "📦 Final dist structure:"
ls -la dist/ || echo "dist directory does not exist"
