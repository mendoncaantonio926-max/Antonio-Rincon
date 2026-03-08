@echo off
setlocal
set "SKIP_BUILD="

if /I "%~1"=="--skip-build" (
  set "SKIP_BUILD=sim"
)

if not defined SKIP_BUILD (
  call "%~dp0build-web.cmd"
  if errorlevel 1 exit /b 1
)

node "%~dp0browser-audit.mjs"
exit /b %errorlevel%
