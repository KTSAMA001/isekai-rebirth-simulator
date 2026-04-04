@echo off
title Isekai Rebirth Simulator
cd /d "%~dp0"

echo.
echo   Isekai Rebirth Simulator
echo   =============================
echo.

if not exist "dist\index.html" (
    echo   [ERROR] dist folder missing, package may be broken.
    pause
    exit /b 1
)
echo   [OK] Game files ready

REM 优先用 PowerShell（Windows 自带），Node.js 做备选
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Using Node.js
    echo.
    echo   URL: http://localhost:3000/
    echo   Close this window to stop.
    echo   =============================
    echo.
    node serve.mjs %1
) else (
    echo   [OK] Using PowerShell
    powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
)
pause
