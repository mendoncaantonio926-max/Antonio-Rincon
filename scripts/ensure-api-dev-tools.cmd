@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0ensure-api-dev-tools.ps1" %*
exit /b %errorlevel%
