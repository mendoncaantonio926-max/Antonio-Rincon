@echo off
setlocal

call "%~dp0build-web.cmd"
if errorlevel 1 exit /b 1

node "%~dp0browser-audit.mjs"
exit /b %errorlevel%
