@echo off
setlocal
set "REPORT_PATH=%~1"
set "OUTPUT_PATH=%~2"

if "%REPORT_PATH%"=="" set "REPORT_PATH=verify-report.json"
if "%OUTPUT_PATH%"=="" set "OUTPUT_PATH=verify-report.md"

powershell -ExecutionPolicy Bypass -File "%~dp0write-verify-summary.ps1" -ReportPath "%REPORT_PATH%" -OutputPath "%OUTPUT_PATH%"
exit /b %errorlevel%
