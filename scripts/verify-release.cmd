@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

set "JSON_FLAG="
set "TARGET_VERSION="

:parse_args
if "%~1"=="" goto validate_args
if /I "%~1"=="--json" (
  set "JSON_FLAG=-Json"
) else if not defined TARGET_VERSION (
  set "TARGET_VERSION=%~1"
)
shift
goto parse_args

:validate_args
if not defined TARGET_VERSION (
  echo Uso: scripts\verify-release.cmd vX.Y.Z [--json]
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%verify-release.ps1" -Version "%TARGET_VERSION%" %JSON_FLAG%
