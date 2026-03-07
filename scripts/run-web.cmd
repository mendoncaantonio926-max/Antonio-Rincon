@echo off
setlocal
cd /d "%~dp0.."
set "NPM_CACHE=%CD%\.npm-cache"
if not exist "%NPM_CACHE%" mkdir "%NPM_CACHE%"
set "npm_config_cache=%NPM_CACHE%"

if /I "%~1"=="--preview" goto preview
if /I "%~1"=="--setup-only" goto setup
if /I "%~1"=="--dev" goto dev
if /I "%~1"=="" goto preview

echo Uso: scripts\run-web.cmd [--preview] [--dev] [--setup-only]
exit /b 1

:install_deps
if exist package-lock.json (
  cmd /c npm ci --ignore-scripts
  if not errorlevel 1 exit /b 0
)
cmd /c npm install --ignore-scripts
exit /b %ERRORLEVEL%

:setup
call :install_deps
exit /b %ERRORLEVEL%

:preview
call :install_deps
if errorlevel 1 exit /b %ERRORLEVEL%
cmd /c npm run build:web
if errorlevel 1 exit /b %ERRORLEVEL%
node scripts\serve-web-dist.mjs apps\web\dist 4173
exit /b %ERRORLEVEL%

:dev
call :install_deps
if errorlevel 1 exit /b %ERRORLEVEL%
cmd /c npm run dev:web
exit /b %ERRORLEVEL%
