@echo off
setlocal
set "SKIP_BUILD="
set "JSON_FLAG="
if /I "%~1"=="--skip-build" set "SKIP_BUILD=-SkipBuild"
if /I "%~1"=="--json" set "JSON_FLAG=-Json"
if /I "%~2"=="--skip-build" set "SKIP_BUILD=-SkipBuild"
if /I "%~2"=="--json" set "JSON_FLAG=-Json"
powershell -ExecutionPolicy Bypass -File "%~dp0smoke-web.ps1" %SKIP_BUILD% %JSON_FLAG%
