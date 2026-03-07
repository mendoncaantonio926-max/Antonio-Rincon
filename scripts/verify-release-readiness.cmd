@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "JSON_FLAG="
set "TARGET_VERSION="

if "%~1"=="" (
  for /f "usebackq delims=" %%V in (`powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%show-version.ps1"`) do set "TARGET_VERSION=%%V"
  if not defined TARGET_VERSION (
    echo Nao foi possivel ler a versao atual.
    exit /b 1
  )
) else (
  :parse_args
  if "%~1"=="" goto ensure_target
  if /I "%~1"=="--json" (
    set "JSON_FLAG=-Json"
  ) else if not defined TARGET_VERSION (
    set "TARGET_VERSION=%~1"
  )
  shift
  goto parse_args
)

:ensure_target
if not defined TARGET_VERSION (
  for /f "usebackq delims=" %%V in (`powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%show-version.ps1"`) do set "TARGET_VERSION=%%V"
  if not defined TARGET_VERSION (
    echo Nao foi possivel ler a versao atual.
    exit /b 1
  )
)

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%check-release-readiness.ps1" -Version "%TARGET_VERSION%" %JSON_FLAG%
