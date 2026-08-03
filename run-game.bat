@echo off
setlocal

cd /d "%~dp0"
title Never Ending Level Game ++

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or is not available in PATH.
  echo Install Node.js and run this file again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH.
  echo Reinstall Node.js and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing project packages...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] Package installation failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting Never Ending Level Game ++...
echo The browser will open automatically.
echo Press Ctrl+C in this window to stop the game server.
echo.

call npm.cmd run dev -- --host 127.0.0.1 --open

if errorlevel 1 (
  echo.
  echo [ERROR] The game server stopped unexpectedly.
  pause
  exit /b 1
)

endlocal
