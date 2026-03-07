@echo off
setlocal
cd /d "%~dp0.."

echo [1/2] Validando changelog local
powershell -ExecutionPolicy Bypass -File "%~dp0check-changelog.ps1" -Mode working-tree
if errorlevel 1 exit /b %ERRORLEVEL%

echo [2/2] Validando monorepo
cmd /c scripts\verify-all.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo Branch pronta para abrir PR.

