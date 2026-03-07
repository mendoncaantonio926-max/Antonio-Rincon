@echo off
setlocal
cd /d "%~dp0.."

cmd /c scripts\verify-report.cmd --json > verify-report.json
if errorlevel 1 exit /b %errorlevel%

cmd /c scripts\doctor.cmd --json > doctor-report.json
if errorlevel 1 exit /b %errorlevel%

cmd /c scripts\write-doctor-summary.cmd doctor-report.json doctor-report.md
if errorlevel 1 exit /b %errorlevel%

cmd /c scripts\write-verify-summary.cmd verify-report.json verify-report.md
exit /b %errorlevel%
