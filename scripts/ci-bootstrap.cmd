@echo off
setlocal
cd /d "%~dp0.."
set "NPM_CACHE=%CD%\.npm-cache"
if not exist "%NPM_CACHE%" mkdir "%NPM_CACHE%"
set "npm_config_cache=%NPM_CACHE%"
set "PYTHON_BIN="

if defined PULSO_BOOTSTRAP_PYTHON if exist "%PULSO_BOOTSTRAP_PYTHON%" set "PYTHON_BIN=%PULSO_BOOTSTRAP_PYTHON%"
if not defined PYTHON_BIN (
  for /f "usebackq delims=" %%P in (`where python 2^>nul ^| findstr /V /I "WindowsApps"`) do set "PYTHON_BIN=%%P"
)
if not defined PYTHON_BIN if exist "apps\api\.venv\Scripts\python.exe" set "PYTHON_BIN=%CD%\apps\api\.venv\Scripts\python.exe"
if not defined PYTHON_BIN (
  echo Nenhum Python funcional encontrado para o bootstrap da CI.
  exit /b 1
)

echo [CI bootstrap] Frontend dependencies
cmd /c npm ci --ignore-scripts
if errorlevel 1 exit /b %ERRORLEVEL%

echo [CI bootstrap] Backend bootstrap dependencies
"%PYTHON_BIN%" -c "import fastapi, pytest, uvicorn" >nul 2>nul
if not errorlevel 1 if exist "apps\api\.venv\Scripts\ruff.exe" (
  echo [CI bootstrap] Dependencias de backend ja disponiveis.
  echo [CI bootstrap] Ambiente pronto.
  exit /b 0
)

"%PYTHON_BIN%" -m pip install --upgrade pip
if errorlevel 1 exit /b %ERRORLEVEL%
"%PYTHON_BIN%" -m pip install -e "apps/api[dev]"
if errorlevel 1 exit /b %ERRORLEVEL%

echo [CI bootstrap] Ambiente pronto.
