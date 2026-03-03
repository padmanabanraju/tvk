#!/bin/bash

echo "========================================"
echo " AI Trade Nexus - Quick Start"
echo "========================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please download and install Node.js from:"
    echo "https://nodejs.org"
    echo ""
    exit 1
fi

echo "Node.js found! Version:"
node --version
echo ""

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "========================================"
echo " Starting development server..."
echo "========================================"
echo ""
echo "The app will open in your browser at:"
echo "http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
