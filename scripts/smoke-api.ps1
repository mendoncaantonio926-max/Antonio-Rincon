param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [int]$TimeoutSeconds = 30,
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $root "apps\api"
$localData = Join-Path $apiDir ".localdata"
$localTmp = Join-Path $localData "tmp"
$logDir = Join-Path $apiDir ".localdata\smoke"
$stdoutLog = Join-Path $logDir "api.stdout.log"
$stderrLog = Join-Path $logDir "api.stderr.log"

function Get-RuntimePython {
    $venvPython = Join-Path $apiDir ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        & $venvPython -c "import fastapi, uvicorn, pytest" > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $venvPython
        }
    }

    if ($env:PULSO_BOOTSTRAP_PYTHON -and (Test-Path $env:PULSO_BOOTSTRAP_PYTHON)) {
        return $env:PULSO_BOOTSTRAP_PYTHON
    }

    $pythonCandidates = @(
        (Get-Command python -ErrorAction SilentlyContinue | Where-Object { $_.Source -notmatch "WindowsApps" } | Select-Object -ExpandProperty Source),
        (Get-Command py -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source)
    ) | Where-Object { $_ } | Select-Object -Unique

    foreach ($candidate in $pythonCandidates) {
        & $candidate -c "import fastapi, uvicorn, pytest" > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $candidate
        }
    }

    throw "Nenhum runtime Python funcional foi encontrado para o smoke da API."
}

New-Item -ItemType Directory -Force $localData, $localTmp, $logDir | Out-Null
New-Item -ItemType Directory -Force $logDir | Out-Null
Remove-Item $stdoutLog, $stderrLog -ErrorAction SilentlyContinue

cmd /c scripts\run-api.cmd --setup-only | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao preparar o runtime da API para o smoke."
}

$env:TMP = $localTmp
$env:TEMP = $localTmp
$env:PYTHONPATH = $apiDir

$runtimePython = Get-RuntimePython
$proc = Start-Process `
    -FilePath $runtimePython `
    -ArgumentList "-m", "uvicorn", "app.main:app" `
    -WorkingDirectory $apiDir `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog `
    -PassThru

try {
    $startedAt = Get-Date
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $healthUrl = "$BaseUrl/health"
    $healthContent = $null

    while ((Get-Date) -lt $deadline) {
        if ($proc.HasExited) {
            throw "A API encerrou antes do healthcheck. Veja $stdoutLog e $stderrLog."
        }

        try {
            $response = Invoke-WebRequest -UseBasicParsing $healthUrl -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                $healthContent = $response.Content
                break
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }

    if (-not $healthContent) {
        throw "Timeout aguardando $healthUrl. Veja $stdoutLog e $stderrLog."
    }
} finally {
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}

if ($Json) {
    [ordered]@{
        ok = "sim"
        base_url = $BaseUrl
        timeout_seconds = $TimeoutSeconds
        elapsed_ms = [int][Math]::Round(((Get-Date) - $startedAt).TotalMilliseconds)
        health_url = $healthUrl
        response = $healthContent
        stdout_log = $stdoutLog
        stderr_log = $stderrLog
    } | ConvertTo-Json -Depth 5
    return
}

Write-Output $healthContent
