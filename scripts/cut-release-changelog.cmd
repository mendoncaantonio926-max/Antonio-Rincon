@echo off
setlocal

if "%~1"=="" (
  echo Uso: scripts\cut-release-changelog.cmd vX.Y.Z
  exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%~dp0cut-release-changelog.ps1" -Version "%~1"
