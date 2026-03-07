@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "VERSION_ARG="
set "DRY_RUN_FLAG="
set "JSON_FLAG="
set "POSITIONAL_VERSION="

:parse_args
if "%~1"=="" goto run_command
if /I "%~1"=="--dry-run" (
  set "DRY_RUN_FLAG=-DryRun"
) else if /I "%~1"=="--json" (
  set "JSON_FLAG=-Json"
) else if not defined POSITIONAL_VERSION (
  set "POSITIONAL_VERSION=%~1"
  set "VERSION_ARG=-Version ""%~1"""
)
shift
goto parse_args

:run_command

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%release-local.ps1" %VERSION_ARG% %DRY_RUN_FLAG% %JSON_FLAG%
