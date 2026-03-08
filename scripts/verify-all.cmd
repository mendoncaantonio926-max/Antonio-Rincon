@echo off
setlocal
cd /d "%~dp0.."

echo [1/8] Documentation checks
powershell -ExecutionPolicy Bypass -File "%~dp0check-doc-paths.ps1"
if errorlevel 1 exit /b %ERRORLEVEL%

echo [2/8] Version checks
cmd /c npm run verify:version
if errorlevel 1 exit /b %ERRORLEVEL%

echo [3/8] Quality checks
cmd /c scripts\check-quality.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo [4/8] Backend tests
cmd /c scripts\test-api.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo [5/8] Frontend tests
cmd /c npm run test:web
if errorlevel 1 exit /b %ERRORLEVEL%

echo [6/8] API smoke
powershell -ExecutionPolicy Bypass -File "%~dp0invoke-cmd-command.ps1" -Command "scripts\smoke-api.cmd"
if errorlevel 1 exit /b %ERRORLEVEL%

echo [7/8] Frontend build
cmd /c npm run build:web
if errorlevel 1 exit /b %ERRORLEVEL%

echo [8/8] Frontend smoke
powershell -ExecutionPolicy Bypass -File "%~dp0invoke-cmd-command.ps1" -Command "scripts\smoke-all.cmd --skip-api --skip-web-build"
if errorlevel 1 exit /b %ERRORLEVEL%

echo Verificacao completa do monorepo concluida.
