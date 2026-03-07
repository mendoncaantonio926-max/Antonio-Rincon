@echo off
setlocal
cd /d "%~dp0.."
set "KEEP_RELEASE="
set "KEEP_REPORTS="
if /I "%~1"=="--keep-release" set "KEEP_RELEASE=1"
if /I "%~1"=="--keep-reports" set "KEEP_REPORTS=1"
if /I "%~2"=="--keep-release" set "KEEP_RELEASE=1"
if /I "%~2"=="--keep-reports" set "KEEP_REPORTS=1"

echo Removendo artefatos locais do frontend...
if exist "apps\web\dist" rmdir /s /q "apps\web\dist"

echo Removendo caches e logs locais...
if exist ".npm-cache\_logs" rmdir /s /q ".npm-cache\_logs"
if exist "apps\web\.localdata" rmdir /s /q "apps\web\.localdata"
if not defined KEEP_REPORTS if exist "doctor-report.json" del /q "doctor-report.json"
if not defined KEEP_REPORTS if exist "doctor-report.md" del /q "doctor-report.md"
if not defined KEEP_REPORTS if exist "verify-report.json" del /q "verify-report.json"
if not defined KEEP_REPORTS if exist "verify-report.md" del /q "verify-report.md"
if not defined KEEP_RELEASE if exist "release" rmdir /s /q "release"

echo Removendo bancos temporarios de teste...
for %%F in ("apps\api\.localdata\pytest-*.db") do if exist "%%~F" del /q "%%~F"

echo Limpeza concluida.
