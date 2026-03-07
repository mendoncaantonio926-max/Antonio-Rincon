@echo off
setlocal

if "%~1"=="" (
  echo Uso: scripts\bump-version.cmd X.Y.Z ^| patch ^| minor ^| major
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%~dp0bump-version.ps1" -Version "%~1"
