#!/usr/bin/env bash
set -e

echo "====================================================================="
echo "         GreenLoop - Circular Waste-to-Resource Platform             "
echo "====================================================================="
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH!"
    echo "Please install Node.js (v18 or higher) from https://nodejs.org"
    exit 1
fi

echo "[1/4] Node.js detected: $(node -v)"
echo ""

# 2. Ensure environment files exist
echo "[2/4] Verifying environment configurations..."
if [ ! -f "server/.env" ]; then
    echo "[*] Creating server/.env from server/.env.example..."
    cp "server/.env.example" "server/.env"
fi
if [ ! -f "client/.env" ]; then
    echo "[*] Creating client/.env from client/.env.example..."
    cp "client/.env.example" "client/.env"
fi
echo "[OK] Environment configurations verified."
echo ""

# 3. Check and install dependencies if needed
echo "[3/4] Checking project dependencies..."
if [ ! -d "node_modules" ]; then
    echo "[*] Installing root dependencies..."
    npm install
fi
if [ ! -d "server/node_modules" ]; then
    echo "[*] Installing server dependencies..."
    npm --prefix server install
fi
if [ ! -d "client/node_modules" ]; then
    echo "[*] Installing client dependencies..."
    npm --prefix client install
fi
echo "[OK] All dependencies installed."
echo ""

# 4. Launching GreenLoop
echo "====================================================================="
echo " Services Starting:"
echo "   - Frontend App:  http://localhost:5173"
echo "   - REST API:      http://localhost:5001/api"
echo ""
echo " Demo Credentials (Ready to use):"
echo "   - Donor:     rahul@greenloop.org    / Password123!"
echo "   - Artisan:   ananya@artisan.org     / Password123!"
echo "   - Recipient: sakshi@ecocrafts.org   / Password123!"
echo "====================================================================="
echo ""

# Open browser in background after 3 seconds
(
  sleep 3
  if command -v open &> /dev/null; then
    open "http://localhost:5173"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173"
  fi
) &

echo "Starting Backend and Frontend servers (Press Ctrl+C to stop)..."
echo ""
npm run dev
