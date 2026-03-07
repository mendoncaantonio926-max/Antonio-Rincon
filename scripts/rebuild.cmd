@echo off
setlocal
cd /d "%~dp0.."
set "CLEAN_ARGS=%~1"

echo [1/3] Limpando workspace local
cmd /c scripts\clean.cmd %CLEAN_ARGS%
if errorlevel 1 exit /b %ERRORLEVEL%

echo [2/3] Recriando ambiente
cmd /c scripts\setup.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo [3/3] Validando monorepo
cmd /c scripts\verify-all.cmd
if errorlevel 1 exit /b %ERRORLEVEL%

echo Rebuild completo concluido.
