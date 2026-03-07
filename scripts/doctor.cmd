@echo off
setlocal EnableDelayedExpansion

if /I "%~1"=="--json" (
  powershell -ExecutionPolicy Bypass -File "%~dp0doctor.ps1" -Json
  exit /b %ERRORLEVEL%
)

cd /d "%~dp0.."

echo [Workspace]
echo %CD%
echo.

echo [Version]
if exist "VERSION" (
  set /p CURRENT_VERSION=<VERSION
  echo !CURRENT_VERSION!
) else (
  echo VERSION ausente
)
echo.

echo [Git]
git rev-parse --is-inside-work-tree 2>nul
git rev-parse --show-toplevel 2>nul
set "GIT_TOPLEVEL="
for /f "delims=" %%P in ('git rev-parse --show-toplevel 2^>nul') do (
  set "GIT_TOPLEVEL=%%~fP"
)
if defined GIT_TOPLEVEL (
  if /I "!GIT_TOPLEVEL!"=="%CD%" (
    git status --short -- . 2>nul
  ) else (
    echo aviso: workspace aninhado em repo Git maior
  )
)
echo.

echo [Node]
where node 2>nul
node --version 2>nul
echo.

echo [NPM]
where npm 2>nul
cmd /c npm --version 2>nul
echo.

echo [Python]
for /f "delims=" %%P in ('where python 2^>nul') do (
  echo %%P
  echo %%P | findstr /I "WindowsApps" >nul
  if not errorlevel 1 echo aviso: python no PATH aponta para alias da Windows Store
)
python --version 2>nul
echo.

echo [Bootstrap Python]
if defined PULSO_BOOTSTRAP_PYTHON (
  echo %PULSO_BOOTSTRAP_PYTHON%
) else (
  echo PULSO_BOOTSTRAP_PYTHON nao definido
)
echo.

echo [Frontend]
if exist "package-lock.json" (
  echo package-lock.json encontrado
) else (
  echo package-lock.json ausente
)
if exist "apps\web\dist\index.html" (
  echo dist pronto
) else (
  echo dist ausente
)
echo.

echo [Verify]
if exist "doctor-report.json" (
  echo doctor-report.json encontrado
) else (
  echo doctor-report.json ausente
)
if exist "doctor-report.md" (
  echo doctor-report.md encontrado
) else (
  echo doctor-report.md ausente
)
if exist "verify-report.json" (
  echo verify-report.json encontrado
) else (
  echo verify-report.json ausente
)
if exist "verify-report.md" (
  echo verify-report.md encontrado
) else (
  echo verify-report.md ausente
)
echo.

echo [Release]
if exist "release" (
  echo diretorio release encontrado
) else (
  echo diretorio release ausente
)
for /f "delims=" %%L in ('powershell -ExecutionPolicy Bypass -File "scripts\release-status.ps1" 2^>nul') do echo %%L
echo.

echo [Backend]
if exist "apps\api\.venv\Scripts\python.exe" (
  echo venv encontrada
  "apps\api\.venv\Scripts\python.exe" --version 2>nul
) else (
  echo venv ausente
)
if exist "apps\api\.localdata\pulso-politico.db" (
  echo sqlite local encontrado
) else (
  echo sqlite local ausente
)
echo.

echo [Scripts]
if exist "scripts\verify-all.cmd" echo verify-all pronto
if exist "scripts\prepare-pr.cmd" echo prepare-pr pronto
if exist "scripts\smoke-api.cmd" echo smoke-api pronto
if exist "scripts\smoke-web.cmd" echo smoke-web pronto
if exist "scripts\release-local.cmd" echo release-local pronto
if exist "scripts\release-status.cmd" echo release-status pronto
if exist "scripts\resolve-release-version.ps1" echo resolve-release-version pronto
if exist "scripts\clean.cmd" echo clean pronto
if exist "scripts\help.cmd" echo help pronto
if exist "scripts\ci-bootstrap.cmd" echo ci-bootstrap pronto
echo.

echo [Workflows]
if exist ".github\workflows\verify.yml" echo verify.yml pronto
if exist ".github\workflows\labeler.yml" echo labeler.yml pronto
if exist ".github\workflows\release-drafter.yml" echo release-drafter.yml pronto
if exist ".github\workflows\release.yml" echo release.yml pronto
