@echo off
setlocal
set "JSON_FLAG="
if /I "%~1"=="--json" set "JSON_FLAG=-Json"
powershell -ExecutionPolicy Bypass -File "%~dp0invoke-powershell-script.ps1" -ScriptPath "%~dp0smoke-api.ps1" %JSON_FLAG%
exit /b %errorlevel%
