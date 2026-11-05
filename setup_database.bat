@echo off
setlocal enabledelayedexpansion

title GreenLoop Database Setup

echo =====================================================================
echo         GreenLoop - Database Migration and Demo Reset                
echo =====================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)

echo [1/2] Running PostgreSQL Migrations...
call npm run db:migrate
if %errorlevel% neq 0 (
    echo [ERROR] Migration failed. Check your server\.env database credentials!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Seeding initial clean demo listings and accounts...
call npm run db:clean
if %errorlevel% neq 0 (
    echo [ERROR] Demo reset failed.
    pause
    exit /b %errorlevel%
)

echo.
echo =====================================================================
echo [SUCCESS] Database schema and demo data initialized cleanly!
echo =====================================================================
echo.
pause
