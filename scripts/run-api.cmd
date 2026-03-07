@echo off
setlocal

set "ROOT=%~dp0.."
set "API_DIR=%ROOT%\apps\api"
set "LOCAL_DATA=%API_DIR%\.localdata"
set "LOCAL_TMP=%LOCAL_DATA%\tmp"
set "VENV_PYTHON=%API_DIR%\.venv\Scripts\python.exe"

if not exist "%LOCAL_DATA%" mkdir "%LOCAL_DATA%"
if not exist "%LOCAL_TMP%" mkdir "%LOCAL_TMP%"
set "TMP=%LOCAL_TMP%"
set "TEMP=%LOCAL_TMP%"
set "PIP_BUILD_TRACKER=%LOCAL_DATA%\pip-build-tracker"
if not exist "%PIP_BUILD_TRACKER%" mkdir "%PIP_BUILD_TRACKER%"

call :resolve_bootstrap_python
if errorlevel 1 exit /b 1

call :ensure_local_runtime
if errorlevel 1 exit /b 1

call :select_runtime
if errorlevel 1 exit /b 1

if /I "%~1"=="--setup-only" exit /b 0

set "PYTHONPATH=%API_DIR%"
if /I "%~1"=="--reload" (
  "%RUNTIME_PYTHON%" -m uvicorn app.main:app --reload --app-dir "%API_DIR%"
  exit /b %errorlevel%
)

"%RUNTIME_PYTHON%" -m uvicorn app.main:app --app-dir "%API_DIR%"
exit /b %errorlevel%

:resolve_bootstrap_python
if defined PULSO_BOOTSTRAP_PYTHON if exist "%PULSO_BOOTSTRAP_PYTHON%" set "BOOTSTRAP_PYTHON=%PULSO_BOOTSTRAP_PYTHON%"
if defined BOOTSTRAP_PYTHON exit /b 0

for /f "usebackq delims=" %%P in (`where python 2^>nul ^| findstr /V /I "WindowsApps"`) do set "BOOTSTRAP_PYTHON=%%P"
if defined BOOTSTRAP_PYTHON exit /b 0

if exist "%AppData%\uv\python" for /r "%AppData%\uv\python" %%P in (python.exe) do set "BOOTSTRAP_PYTHON=%%P"
if defined BOOTSTRAP_PYTHON exit /b 0

for %%P in (
  "%LocalAppData%\Programs\Python\Python313\python.exe"
  "%ProgramFiles%\Python313\python.exe"
  "%ProgramFiles%\Python312\python.exe"
) do if exist %%~P set "BOOTSTRAP_PYTHON=%%~P"
if defined BOOTSTRAP_PYTHON exit /b 0

echo Nenhum Python funcional foi encontrado.
echo Defina PULSO_BOOTSTRAP_PYTHON com o caminho de um python.exe valido e rode novamente.
exit /b 1

:ensure_local_runtime
if not exist "%VENV_PYTHON%" "%BOOTSTRAP_PYTHON%" -m venv "%API_DIR%\.venv" >nul 2>nul
if not exist "%VENV_PYTHON%" exit /b 0

"%VENV_PYTHON%" -m pip --version >nul 2>nul
if errorlevel 1 call :copy_pip

"%VENV_PYTHON%" -m pip --version >nul 2>nul
if errorlevel 1 exit /b 0

call :write_local_pth

"%VENV_PYTHON%" -c "import fastapi, uvicorn, pytest" >nul 2>nul
if not errorlevel 1 exit /b 0

"%BOOTSTRAP_PYTHON%" -c "import fastapi, uvicorn, pytest" >nul 2>nul
if errorlevel 1 exit /b 0

call :sync_site_packages
exit /b 0

:copy_pip
"%BOOTSTRAP_PYTHON%" -c "from pathlib import Path; import shutil, site; src=Path(site.getsitepackages()[-1]); dst=Path(r'%API_DIR%\.venv\Lib\site-packages'); [shutil.copytree(item, dst / item.name, dirs_exist_ok=True) for pattern in ('pip', 'pip-*.dist-info') for item in src.glob(pattern)]" >nul 2>nul
exit /b 0

:sync_site_packages
"%BOOTSTRAP_PYTHON%" "%ROOT%\scripts\bootstrap_api_runtime.py" "%API_DIR%\.venv\Lib\site-packages" "%API_DIR%" >nul 2>nul
exit /b 0

:write_local_pth
> "%API_DIR%\.venv\Lib\site-packages\pulso_local_app.pth" echo %API_DIR%
exit /b 0

:select_runtime
if exist "%VENV_PYTHON%" "%VENV_PYTHON%" -c "import fastapi, uvicorn, pytest" >nul 2>nul
if not errorlevel 1 (
  set "RUNTIME_PYTHON=%VENV_PYTHON%"
  exit /b 0
)

"%BOOTSTRAP_PYTHON%" -c "import fastapi, uvicorn, pytest" >nul 2>nul
if errorlevel 1 (
  echo O Python encontrado nao possui as dependencias do backend.
  echo Use um ambiente com FastAPI+pytest ou prepare apps\api\.venv manualmente.
  exit /b 1
)

set "RUNTIME_PYTHON=%BOOTSTRAP_PYTHON%"
exit /b 0
