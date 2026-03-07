@echo off
setlocal
cd /d "%~dp0.."

echo [1/7] Documentation checks
powershell -ExecutionPolicy Bypass -File "%~dp0check-doc-paths.ps1"
if errorlevel 1 exit /b %ERRORLEVEL%

echo [2/7] Version checks
cmd /c npm run verify:version
if errorlevel 1 exit /b %ERRORLEVEL%

echo [3/7] Quality checks
cmd /c scripts\check-quality.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo [4/7] Backend tests
cmd /c scripts\test-api.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo [5/7] API smoke
powershell -ExecutionPolicy Bypass -File "%~dp0invoke-cmd-command.ps1" -Command "scripts\smoke-api.cmd"
if errorlevel 1 exit /b %ERRORLEVEL%

echo [6/7] Frontend build
cmd /c npm run build:web
if errorlevel 1 exit /b %ERRORLEVEL%

echo [7/7] Frontend smoke
powershell -ExecutionPolicy Bypass -File "%~dp0invoke-cmd-command.ps1" -Command "scripts\smoke-all.cmd --skip-api --skip-web-build"
if errorlevel 1 exit /b %ERRORLEVEL%

echo Verificacao completa do monorepo concluida.
