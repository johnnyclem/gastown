#!/bin/bash
set -e

echo "🏗️  Building React Frontend..."
cd web/frontend
npm install
npm run build
cd ../..

echo "📂 Copying assets to Go backend..."
# Ensure the target directory exists and is empty
rm -rf internal/web/frontend/*
mkdir -p internal/web/frontend

# Copy the built files (index.html, assets/, etc.)
cp -r web/frontend/dist/* internal/web/frontend/

echo "🚀 Building Gas Town CLI..."
go build -o gt cmd/gt/main.go

echo "✅ Done! Run ./gt dashboard to start."
