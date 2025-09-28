#!/bin/bash

echo "🚀 PicZFlip Deployment Script"
echo "=============================="

# Check if Firebase CLI is authenticated
echo "Checking Firebase authentication..."
if ! firebase projects:list &>/dev/null; then
    echo "❌ Not authenticated with Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Firebase authenticated"

# Build functions
echo "📦 Building Functions..."
cd functions
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Functions build failed"
    exit 1
fi
cd ..

# Build web app
echo "📦 Building Web App..."
cd web
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only functions,hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Visit: https://piczflip.web.app"
else
    echo "❌ Deployment failed"
    exit 1
fi