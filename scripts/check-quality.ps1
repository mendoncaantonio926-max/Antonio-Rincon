param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $repoRoot "apps/api"
$venvPython = Join-Path $apiDir ".venv\Scripts\python.exe"
$ruffCommand = Join-Path $apiDir ".venv\Scripts\ruff.exe"
$pythonCommand = $null
$results = [ordered]@{}

Push-Location $repoRoot
try {
    cmd /c "scripts\run-api.cmd --setup-only" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao preparar runtime local do backend."
    }

    if (Test-Path $venvPython) {
        $pythonCommand = $venvPython
    }
    elseif ($env:PULSO_BOOTSTRAP_PYTHON -and (Test-Path $env:PULSO_BOOTSTRAP_PYTHON)) {
        $pythonCommand = $env:PULSO_BOOTSTRAP_PYTHON
    }
    else {
        throw "Nenhum python funcional foi encontrado para a checagem de qualidade."
    }

    & cmd /c "npm --workspace apps/web run typecheck"
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no typecheck do frontend."
    }
    $results.frontend_typecheck = "sim"

    & cmd /c "npm run lint"
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no lint do monorepo."
    }
    $results.monorepo_lint = "sim"

    if (-not (Test-Path $ruffCommand)) {
        throw "Ferramenta de lint do backend nao encontrada. Rode scripts\ensure-api-dev-tools.cmd."
    }

    & $ruffCommand check $apiDir\app $apiDir\tests
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no lint do backend."
    }
    $results.backend_lint = "sim"

    & $pythonCommand -m compileall -q $apiDir\app $apiDir\tests
    if ($LASTEXITCODE -ne 0) {
        throw "Falha na compilacao estrutural do backend."
    }
    $results.backend_compile = "sim"

    if ($Json) {
        [ordered]@{
            ok = "sim"
            frontend_typecheck = $results.frontend_typecheck
            monorepo_lint = $results.monorepo_lint
            backend_lint = $results.backend_lint
            backend_compile = $results.backend_compile
        } | ConvertTo-Json -Depth 4
        return
    }

    Write-Output "frontend_typecheck=sim"
    Write-Output "monorepo_lint=sim"
    Write-Output "backend_lint=sim"
    Write-Output "backend_compile=sim"
}
catch {
    if ($Json) {
        [ordered]@{
            ok = "nao"
            error = $_.Exception.Message
            frontend_typecheck = $(if ($results.frontend_typecheck) { $results.frontend_typecheck } else { "nao" })
            monorepo_lint = $(if ($results.monorepo_lint) { $results.monorepo_lint } else { "nao" })
            backend_lint = $(if ($results.backend_lint) { $results.backend_lint } else { "nao" })
            backend_compile = $(if ($results.backend_compile) { $results.backend_compile } else { "nao" })
        } | ConvertTo-Json -Depth 4
        exit 1
    }
    throw
}
finally {
    Pop-Location
}
