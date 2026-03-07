@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "SKIP_API_FLAG="
set "SKIP_WEB_BUILD_FLAG="
set "JSON_FLAG="

:parse_args
if "%~1"=="" goto run_command
if /I "%~1"=="--skip-api" (
  set "SKIP_API_FLAG=-SkipApi"
) else if /I "%~1"=="--skip-web-build" (
  set "SKIP_WEB_BUILD_FLAG=-SkipWebBuild"
) else if /I "%~1"=="--json" (
  set "JSON_FLAG=-Json"
)
shift
goto parse_args

:run_command
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%smoke-all.ps1" %SKIP_API_FLAG% %SKIP_WEB_BUILD_FLAG% %JSON_FLAG%
