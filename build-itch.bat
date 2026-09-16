@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title Never Ending Level Game ++ - itch.io Build

echo ============================================================
echo  Never Ending Level Game ++ - itch.io HTML5 Build
echo ============================================================
echo.

rem Windows PowerShell may exist even when its directory is missing from PATH.
set "NELG_POWERSHELL=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if exist "%NELG_POWERSHELL%" goto powershell_ready
set "NELG_POWERSHELL="
for %%P in (pwsh.exe powershell.exe) do for %%Q in (%%~$PATH:P) do if not defined NELG_POWERSHELL set "NELG_POWERSHELL=%%~Q"
if defined NELG_POWERSHELL goto powershell_ready
echo [ERROR] PowerShell was not found. Install PowerShell or restore its PATH entry.
if /i not "%~1"=="--no-pause" pause
exit /b 1

:powershell_ready
where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or is not available in PATH.
  echo Install Node.js, then run this file again.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

if not exist "node_modules\typescript\bin\tsc" goto install_packages
if not exist "node_modules\vite\bin\vite.js" goto install_packages
if not exist "node_modules\javascript-obfuscator\package.json" goto install_packages
goto packages_ready

:install_packages
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Required project packages are missing and npm is unavailable.
  echo Reinstall Node.js, run npm install, then try again.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

echo [1/4] Installing project packages...
call npm.cmd install
if errorlevel 1 (
  echo [ERROR] Package installation failed.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

:packages_ready
echo [1/4] Checking TypeScript...
node "node_modules\typescript\bin\tsc"
if errorlevel 1 (
  echo.
  echo [ERROR] TypeScript compilation failed. No upload ZIP was created.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

echo [2/4] Building the HTML5 game...
rem Override any local Newgrounds settings for the itch.io package.
set "VITE_NEWGROUNDS_ENABLED=false"
set "VITE_NEWGROUNDS_APP_ID="
set "VITE_NEWGROUNDS_ENCRYPTION_KEY="
node "node_modules\vite\bin\vite.js" build --base ./ --mode itch --outDir dist/itch
if errorlevel 1 (
  echo.
  echo [ERROR] Vite production build failed. No upload ZIP was created.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

if not exist "dist\itch\index.html" (
  echo [ERROR] dist\itch\index.html was not generated.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

echo [3/4] Creating the itch.io upload ZIP...
if not exist "release" mkdir "release"

set "NELG_DIST=%CD%\dist\itch"
set "NELG_ITCH_ZIP=%CD%\release\creamsoda-itch.zip"

"%NELG_POWERSHELL%" -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$dist=[IO.Path]::GetFullPath($env:NELG_DIST);" ^
  "$zip=[IO.Path]::GetFullPath($env:NELG_ITCH_ZIP);" ^
  "if (-not (Test-Path -LiteralPath (Join-Path $dist 'index.html') -PathType Leaf)) { throw 'dist/index.html is missing.' };" ^
  "if (-not (Test-Path -LiteralPath (Join-Path $dist 'assets') -PathType Container)) { throw 'dist/assets is missing.' };" ^
  "Add-Type -AssemblyName System.IO.Compression;" ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force };" ^
  "$archive=[IO.Compression.ZipFile]::Open($zip,[IO.Compression.ZipArchiveMode]::Create);" ^
  "try { foreach ($file in Get-ChildItem -LiteralPath $dist -Recurse -File) { $entryName=$file.FullName.Substring($dist.Length).TrimStart([char]92,[char]47).Replace([char]92,[char]47); [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,$entryName,[IO.Compression.CompressionLevel]::Optimal) | Out-Null } } finally { $archive.Dispose() };" ^
  "$archive=[IO.Compression.ZipFile]::OpenRead($zip);" ^
  "try { $allowed=@('assets/music/level34.mp3','assets/music/level34proto.mp3','assets/music/level35phase9.wav','assets/music/level47.mp3'); $music=@($archive.Entries.FullName | Where-Object { $_ -like 'assets/music/*' }); if (@(Compare-Object $allowed $music).Count -ne 0) { throw 'The ZIP music does not match Levels 34, 35, and 47.' }; if ($archive.Entries.Count -gt 1000) { throw 'The ZIP exceeds the itch.io file count limit.' }; if (($archive.Entries | Measure-Object Length -Sum).Sum -gt 500000000) { throw 'The extracted ZIP exceeds 500 MB.' }; foreach ($entry in $archive.Entries) { if ($entry.Length -gt 200000000 -or $entry.FullName.Length -gt 240) { throw ('The file exceeds itch.io limits: ' + $entry.FullName) } } } finally { $archive.Dispose() };" ^
  "$archive=[IO.Compression.ZipFile]::OpenRead($zip);" ^
  "try { $entries=@($archive.Entries.FullName); if ($entries -notcontains 'index.html') { throw 'index.html is not at the ZIP root.' }; if (-not ($entries | Where-Object { $_ -like 'assets/*' } | Select-Object -First 1)) { throw 'The assets folder is missing from the ZIP.' }; if ($entries | Where-Object { $_.Contains([char]92) } | Select-Object -First 1) { throw 'The ZIP contains a Windows-style path separator.' } } finally { $archive.Dispose() }"

if errorlevel 1 (
  echo.
  echo [ERROR] Failed to create or validate the itch.io ZIP.
  if /i not "%~1"=="--no-pause" pause
  exit /b 1
)

echo [4/4] Build complete.
echo.
echo Upload this file to itch.io:
echo %NELG_ITCH_ZIP%
echo.
echo The ZIP contains index.html at its root and does not include source,
echo environment, walkthrough, or server-only files. All internal paths use
echo web-compatible forward slashes.
echo Background music is excluded except for Levels 34, 35, and 47.
echo.
if /i not "%~1"=="--no-pause" pause
exit /b 0
