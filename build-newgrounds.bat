@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title Never Ending Level Game ++ - Newgrounds Build

echo ============================================================
echo  Never Ending Level Game ++ - Newgrounds HTML5 Build
echo ============================================================
echo.

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or is not available in PATH.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\typescript\bin\tsc" goto install_packages
if not exist "node_modules\vite\bin\vite.js" goto install_packages
goto packages_ready

:install_packages
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Required project packages are missing and npm is unavailable.
  echo Reinstall Node.js, run npm install, then try again.
  pause
  exit /b 1
)

echo [1/4] Installing project packages...
call npm.cmd install
if errorlevel 1 (
  echo [ERROR] Package installation failed.
  pause
  exit /b 1
)

:packages_ready
echo [1/4] Checking TypeScript...
node "node_modules\typescript\bin\tsc"
if errorlevel 1 (
  echo.
  echo [ERROR] TypeScript compilation failed. No upload ZIP was created.
  pause
  exit /b 1
)

echo [2/4] Building the HTML5 game...
node "node_modules\vite\bin\vite.js" build --base ./
if errorlevel 1 (
  echo.
  echo [ERROR] Vite production build failed. No upload ZIP was created.
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo [ERROR] dist\index.html was not generated.
  pause
  exit /b 1
)

echo [3/4] Creating the Newgrounds upload ZIP...
if not exist "release" mkdir "release"

set "NELG_DIST=%CD%\dist"
set "NELG_NEWGROUNDS_ZIP=%CD%\release\creamsoda-newgrounds.zip"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$dist=[IO.Path]::GetFullPath($env:NELG_DIST);" ^
  "$zip=[IO.Path]::GetFullPath($env:NELG_NEWGROUNDS_ZIP);" ^
  "Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zip -Force;" ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "$archive=[IO.Compression.ZipFile]::OpenRead($zip);" ^
  "try { $found=$false; foreach ($entry in $archive.Entries) { if ($entry.FullName -eq 'index.html') { $found=$true; break } }; if (-not $found) { throw 'index.html is not at the ZIP root.' } } finally { $archive.Dispose() }"

if errorlevel 1 (
  echo.
  echo [ERROR] Failed to create or validate the Newgrounds ZIP.
  pause
  exit /b 1
)

echo [4/4] Build complete.
echo.
echo Upload this file to Newgrounds:
echo %NELG_NEWGROUNDS_ZIP%
echo.
echo The ZIP contains index.html at its root and does not include source,
echo environment, walkthrough, or server-only files.
echo.
pause
exit /b 0
