@echo off
setlocal
cd /d "%~dp0.."

echo [1/2] Preparando frontend
cmd /c scripts\run-web.cmd --setup-only
if errorlevel 1 exit /b %ERRORLEVEL%

echo [2/2] Preparando backend
cmd /c scripts\run-api.cmd --setup-only
if errorlevel 1 exit /b %ERRORLEVEL%

echo Ambiente local preparado.

