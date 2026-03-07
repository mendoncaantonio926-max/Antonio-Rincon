@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "JSON_FLAG="

:parse_args
if "%~1"=="" goto resolve_current
if /I "%~1"=="--json" set "JSON_FLAG=-Json"
shift
goto parse_args

:resolve_current
for /f "usebackq delims=" %%V in (`powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%show-version.ps1"`) do set "CURRENT_VERSION=%%V"
if not defined CURRENT_VERSION (
  echo Nao foi possivel ler a versao atual.
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%check-version.ps1" -Version v%CURRENT_VERSION% %JSON_FLAG%
