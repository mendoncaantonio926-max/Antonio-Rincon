param(
    [string]$BaseUrl = "http://127.0.0.1:4173",
    [switch]$SkipBuild,
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $repoRoot "apps\web\.localdata\smoke"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$stdoutLog = Join-Path $logDir "web-smoke.stdout.log"
$stderrLog = Join-Path $logDir "web-smoke.stderr.log"

Push-Location $repoRoot
try {
    $env:npm_config_cache = (Resolve-Path ".npm-cache").Path
    $startedAt = Get-Date
    if (-not $SkipBuild) {
        if ($Json) {
            cmd /c scripts\build-web.cmd --json | Out-Null
        }
        else {
            cmd /c npm run build:web
        }

        if ($LASTEXITCODE -ne 0) {
            throw "Falha no build do frontend."
        }
    }

    $proc = Start-Process -FilePath "node.exe" `
        -ArgumentList "scripts/serve-web-dist.mjs", "apps/web/dist", "4173" `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru

    try {
        $targetUrl = "$BaseUrl/"
        $deadline = (Get-Date).AddSeconds(20)
        $responseContent = $null

        while ((Get-Date) -lt $deadline) {
            if ($proc.HasExited) {
                throw "O servidor web encerrou antes do smoke. Veja $stdoutLog e $stderrLog."
            }

            try {
                $response = Invoke-WebRequest -UseBasicParsing $targetUrl -TimeoutSec 2
                if ($response.StatusCode -eq 200 -and $response.Content -match "Pulso Politico") {
                    $responseContent = $response.Content
                    break
                }
            } catch {
                Start-Sleep -Milliseconds 500
            }
        }

        if (-not $responseContent) {
            throw "Timeout aguardando $targetUrl. Veja $stdoutLog e $stderrLog."
        }

        if ($Json) {
            [ordered]@{
                ok = "sim"
                base_url = $BaseUrl
                skip_build = $(if ($SkipBuild) { "sim" } else { "nao" })
                elapsed_ms = [int][Math]::Round(((Get-Date) - $startedAt).TotalMilliseconds)
                target_url = $targetUrl
                response_contains = "Pulso Politico"
                stdout_log = $stdoutLog
                stderr_log = $stderrLog
            } | ConvertTo-Json -Depth 5
            return
        }

        Write-Output $responseContent
        return
    }
    finally {
        if ($proc -and -not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
finally {
    Pop-Location
}
