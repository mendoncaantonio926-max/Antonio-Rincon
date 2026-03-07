@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

set "DRY_RUN_FLAG="
set "JSON_FLAG="
set "POSITIONAL_VERSION="

:parse_args
if "%~1"=="" goto validate_args
if /I "%~1"=="--dry-run" (
  set "DRY_RUN_FLAG=-DryRun"
) else if /I "%~1"=="--json" (
  set "JSON_FLAG=-Json"
) else if not defined POSITIONAL_VERSION (
  set "POSITIONAL_VERSION=%~1"
)
shift
goto parse_args

:validate_args
if not defined POSITIONAL_VERSION (
  echo Uso: scripts\prepare-release.cmd X.Y.Z ^| patch ^| minor ^| major [--dry-run] [--json]
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%prepare-release.ps1" -Version "%POSITIONAL_VERSION%" %DRY_RUN_FLAG% %JSON_FLAG%
