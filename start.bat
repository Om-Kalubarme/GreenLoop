@echo off
setlocal enabledelayedexpansion

title GreenLoop Platform Runner

echo =====================================================================
echo          GreenLoop - Circular Waste-to-Resource Platform             
echo =====================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js (v18 or higher) from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [1/4] Node.js detected:
node -v
echo.

:: 2. Ensure environment files exist
echo [2/4] Verifying environment configurations...
if not exist "server\.env" (
    echo [*] Creating server\.env from server\.env.example...
    copy "server\.env.example" "server\.env" >nul
)
if not exist "client\.env" (
    echo [*] Creating client\.env from client\.env.example...
    copy "client\.env.example" "client\.env" >nul
)
echo [OK] Environment configurations verified.
echo.

:: 3. Check and install dependencies if needed
echo [3/4] Checking project dependencies...
if not exist "node_modules" (
    echo [*] Installing root dependencies...
    call npm install
)
if not exist "server\node_modules" (
    echo [*] Installing server dependencies...
    call npm --prefix server install
)
if not exist "client\node_modules" (
    echo [*] Installing client dependencies...
    call npm --prefix client install
)
echo [OK] All dependencies installed.
echo.

:: 4. Launching GreenLoop
echo =====================================================================
echo  Services Starting:
echo    - Frontend App:  http://localhost:5173
echo    - REST API:      http://localhost:5001/api
echo.
echo  Demo Credentials (Ready to use):
echo    - Donor:     rahul@greenloop.org    / Password123!
echo    - Artisan:   ananya@artisan.org     / Password123!
echo    - Recipient: sakshi@ecocrafts.org   / Password123!
echo =====================================================================
echo.
echo Launching browser in 4 seconds...
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:5173"

echo Starting Backend and Frontend servers (Press Ctrl+C to stop)...
echo.
call npm run dev

pause
