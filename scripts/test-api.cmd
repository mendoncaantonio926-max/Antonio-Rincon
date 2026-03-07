@echo off
setlocal

call "%~dp0run-api.cmd" --setup-only
if errorlevel 1 exit /b 1

set "ROOT=%~dp0.."
set "API_DIR=%ROOT%\apps\api"
set "LOCAL_DATA=%API_DIR%\.localdata"
set "LOCAL_TMP=%LOCAL_DATA%\tmp"
set "VENV_PYTHON=%API_DIR%\.venv\Scripts\python.exe"
set "TEST_DB=%LOCAL_DATA%\pytest-%RANDOM%-%RANDOM%.db"

if not exist "%LOCAL_DATA%" mkdir "%LOCAL_DATA%"
if not exist "%LOCAL_TMP%" mkdir "%LOCAL_TMP%"
set "TMP=%LOCAL_TMP%"
set "TEMP=%LOCAL_TMP%"
set "PYTHONDONTWRITEBYTECODE=1"
set "PYTHONPATH=%API_DIR%"
set "DATABASE_URL=sqlite:///%TEST_DB:\=/%"

if exist "%VENV_PYTHON%" (
  "%VENV_PYTHON%" -c "import fastapi, pytest" >nul 2>nul
  if not errorlevel 1 (
    "%VENV_PYTHON%" -m pytest "%API_DIR%\tests" -p no:cacheprovider
    set "TEST_EXIT=%ERRORLEVEL%"
    exit /b %TEST_EXIT%
  )
)

if not defined PULSO_BOOTSTRAP_PYTHON (
  if exist "%AppData%\uv\python" for /r "%AppData%\uv\python" %%P in (python.exe) do set "PULSO_BOOTSTRAP_PYTHON=%%P"
)

:run_bootstrap
if not defined PULSO_BOOTSTRAP_PYTHON (
  echo Nenhum runtime Python disponivel para os testes.
  exit /b 1
)

"%PULSO_BOOTSTRAP_PYTHON%" -m pytest "%API_DIR%\tests" -p no:cacheprovider
set "TEST_EXIT=%ERRORLEVEL%"
exit /b %TEST_EXIT%
