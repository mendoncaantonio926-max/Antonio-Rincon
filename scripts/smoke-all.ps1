param(
    [switch]$SkipApi,
    [switch]$SkipWebBuild,
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-SmokeStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [switch]$CaptureJson
    )

    $startedAt = Get-Date
    $stdoutFile = [System.IO.Path]::GetTempFileName()
    $stderrFile = [System.IO.Path]::GetTempFileName()

    try {
        $proc = Start-Process `
            -FilePath "cmd.exe" `
            -ArgumentList "/c", $Command `
            -WorkingDirectory $repoRoot `
            -RedirectStandardOutput $stdoutFile `
            -RedirectStandardError $stderrFile `
            -Wait `
            -PassThru

        $exitCode = $proc.ExitCode
        $output = if (Test-Path $stdoutFile) { Get-Content $stdoutFile -Raw } else { "" }
        $errorOutput = if (Test-Path $stderrFile) { Get-Content $stderrFile -Raw } else { "" }
    }
    finally {
        Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
    }

    $finishedAt = Get-Date

    $result = [ordered]@{
        name = $Name
        command = $Command
        exit_code = $exitCode
        ok = $(if ($exitCode -eq 0) { "sim" } else { "nao" })
        elapsed_ms = [int][Math]::Round(($finishedAt - $startedAt).TotalMilliseconds)
    }

    if ($exitCode -ne 0 -and $errorOutput) {
        $result.stderr = $errorOutput.Trim()
    }

    if ($CaptureJson -and $exitCode -eq 0 -and $output) {
        try {
            $result.details = $output | ConvertFrom-Json
        }
        catch {
        }
    }

    return $result
}

Push-Location $repoRoot
try {
    $steps = @()

    if (-not $SkipApi) {
        $apiStep = Invoke-SmokeStep -Name "api_smoke" -Command "scripts\smoke-api.cmd --json" -CaptureJson
        $steps += $apiStep
        if ($apiStep.exit_code -ne 0) {
            throw "Falha em api_smoke."
        }
    } else {
        $steps += [ordered]@{
            name = "api_smoke"
            command = "scripts\smoke-api.cmd"
            exit_code = 0
            ok = "ignorado"
            elapsed_ms = 0
        }
    }

    $webCommand = if ($SkipWebBuild) { "scripts\smoke-web.cmd --skip-build --json" } else { "scripts\smoke-web.cmd --json" }
    $webStep = Invoke-SmokeStep -Name "web_smoke" -Command $webCommand -CaptureJson
    $steps += $webStep
    if ($webStep.exit_code -ne 0) {
        throw "Falha em web_smoke."
    }

    $report = [ordered]@{
        ok = "sim"
        skip_api = $(if ($SkipApi) { "sim" } else { "nao" })
        skip_web_build = $(if ($SkipWebBuild) { "sim" } else { "nao" })
        steps = $steps
        completed_at = (Get-Date).ToUniversalTime().ToString("o")
    }

    if ($Json) {
        $report | ConvertTo-Json -Depth 5
        return
    }

    if (-not $SkipApi) {
        Write-Output "[1/2] API smoke"
    } else {
        Write-Output "[1/2] API smoke ignorado"
    }
    Write-Output "[2/2] Frontend smoke"
    Write-Output "Smoke completo concluido."
}
catch {
    if ($Json) {
        [ordered]@{
            ok = "nao"
            error = $_.Exception.Message
            skip_api = $(if ($SkipApi) { "sim" } else { "nao" })
            skip_web_build = $(if ($SkipWebBuild) { "sim" } else { "nao" })
            steps = $steps
            completed_at = (Get-Date).ToUniversalTime().ToString("o")
        } | ConvertTo-Json -Depth 5
        exit 1
    }

    throw
}
finally {
    Pop-Location
}
