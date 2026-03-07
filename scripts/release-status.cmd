@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

set "JSON_FLAG="

:parse_args
if "%~1"=="" goto run_command
if /I "%~1"=="--json" set "JSON_FLAG=-Json"
shift
goto parse_args

:run_command

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%release-status.ps1" %JSON_FLAG%
