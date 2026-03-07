@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0check-quality.ps1" %*
exit /b %errorlevel%
