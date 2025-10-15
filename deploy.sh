#!/bin/bash

# PicZFlip Deployment Script
# This script helps deploy PicZFlip to Firebase Hosting

set -e  # Exit on error

echo "🚀 PicZFlip Deployment Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI found${NC}"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Firebase${NC}"
    echo "Logging in..."
    firebase login
fi

echo -e "${GREEN}✓ Firebase authenticated${NC}"

# Verify correct project
echo ""
echo "📋 Current Firebase project:"
firebase use

echo ""
read -p "Is this the correct project (piczflip-beta)? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting project to piczflip-beta..."
    firebase use piczflip-beta
fi

echo ""
echo "🔨 Building application..."
echo ""

# Build functions
echo "Building Cloud Functions..."
npm run build:functions
echo -e "${GREEN}✓ Functions built${NC}"

# Build web app
echo "Building web application..."
npm run build:web
echo -e "${GREEN}✓ Web app built${NC}"

echo ""
echo "🚀 Deploying to Firebase..."
echo ""

# Ask what to deploy
echo "What would you like to deploy?"
echo "1) Everything (hosting + functions)"
echo "2) Hosting only (web app)"
echo "3) Functions only (backend)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Deploying everything..."
        firebase deploy
        ;;
    2)
        echo "Deploying hosting only..."
        firebase deploy --only hosting
        ;;
    3)
        echo "Deploying functions only..."
        firebase deploy --only functions
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "🌐 Your site should be live at:"
echo "   - https://piczflip-beta.web.app"
echo "   - https://piczflip-beta.firebaseapp.com"
echo "   - https://www.piczflip.com (if custom domain is configured)"
echo ""
echo "📊 View deployment:"
echo "   Firebase Console: https://console.firebase.google.com/project/piczflip-beta"
echo ""
