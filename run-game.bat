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

if not exist "node_modules\.bin\vercel.cmd" (
  echo Installing the Vercel development server...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] Package installation failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting Never Ending Level Game ++...
echo The game and Vercel Function will run together at:
echo http://127.0.0.1:5173
echo.
echo On the first run, Vercel may ask you to log in and link this folder.
echo Press Ctrl+C in this window to stop both servers.
echo.

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "$url='http://127.0.0.1:5173'; for($attempt=0; $attempt -lt 120; $attempt++){ try { $response=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1; if($response.StatusCode -ge 200){ Start-Process $url; break } } catch {}; Start-Sleep -Milliseconds 500 }"

call npm.cmd run dev:full

if errorlevel 1 (
  echo.
  echo [ERROR] The game server stopped unexpectedly.
  pause
  exit /b 1
)

endlocal
