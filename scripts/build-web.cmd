@echo off
setlocal
set "JSON_FLAG="
if /I "%~1"=="--json" set "JSON_FLAG=-Json"
powershell -ExecutionPolicy Bypass -File "%~dp0build-web.ps1" %JSON_FLAG%
exit /b %errorlevel%
