#!/bin/bash
set -e

echo "🔧 Starting POS System build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build backend
echo "🏗️  Building backend..."
npm run build:server

# Build frontend
echo "🏗️  Building frontend..."
npm run build:client

# Copy frontend build to backend dist
echo "📋 Copying frontend build to backend..."
mkdir -p dist/public
cp -r frontend/dist/* dist/public/

echo "✅ Build completed successfully!"
