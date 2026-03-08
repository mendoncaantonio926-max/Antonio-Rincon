param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $repoRoot "apps/api"
$venvPython = Join-Path $apiDir ".venv\Scripts\python.exe"
$ruffExe = Join-Path $apiDir ".venv\Scripts\ruff.exe"

Push-Location $repoRoot
try {
    if (-not (Test-Path $venvPython)) {
        throw "Python da venv do backend nao encontrado. Rode scripts\run-api.cmd --setup-only antes."
    }

    & $venvPython -m pip --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "pip nao esta disponivel na venv do backend."
    }

    if (-not (Test-Path $ruffExe)) {
        & $venvPython -m pip install -e "apps/api[dev]"
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao instalar as ferramentas de desenvolvimento do backend."
        }
    }

    & $ruffExe --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "ruff nao ficou disponivel na venv do backend."
    }

    if ($Json) {
        [ordered]@{
            ok = "sim"
            backend_dev_tools = "sim"
            ruff = "sim"
        } | ConvertTo-Json -Depth 4
        return
    }

    Write-Output "backend_dev_tools=sim"
    Write-Output "ruff=sim"
}
finally {
    Pop-Location
}
