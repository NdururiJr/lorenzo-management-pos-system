#!/bin/bash

# Firebase Cloud Functions Setup Script
# Run with: bash setup.sh

set -e  # Exit on error

echo "=================================================="
echo "Lorenzo Dry Cleaners - Functions Setup"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm version: $(npm --version)"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✓ Firebase CLI version: $(firebase --version)"
fi

echo ""
echo "Step 1: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "Step 2: Creating .env file..."
if [ ! -f .env ]; then
    cp .env.functions .env
    echo "✓ Created .env file from template"
    echo "⚠️  Please edit .env and add your API keys"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "Step 3: Building functions..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Functions built successfully"
else
    echo "❌ Failed to build functions"
    exit 1
fi

echo ""
echo "=================================================="
echo "Setup Complete! 🎉"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your API keys:"
echo "   - Wati.io API key (WhatsApp)"
echo "   - Resend API key (Email)"
echo "   - Pesapal credentials (Payments)"
echo "   - OpenAI API key (AI features)"
echo ""
echo "2. Test locally:"
echo "   npm run serve"
echo ""
echo "3. Deploy to Firebase:"
echo "   firebase deploy --only functions"
echo ""
echo "Documentation:"
echo "   - README.md - Overview and setup"
echo "   - TESTING.md - Testing guide"
echo "   - DEPLOYMENT.md - Deployment guide"
echo ""
echo "Need help? Contact: hello@ai-agentsplus.com"
echo "=================================================="
