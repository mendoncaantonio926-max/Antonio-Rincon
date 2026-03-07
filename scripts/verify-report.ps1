param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-VerifyStep {
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

        $output = if (Test-Path $stdoutFile) { Get-Content $stdoutFile -Raw } else { "" }
        $errorOutput = if (Test-Path $stderrFile) { Get-Content $stderrFile -Raw } else { "" }
        $exitCode = $proc.ExitCode
    }
    finally {
        Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
    }

    $finishedAt = Get-Date

    $parsedJson = $null
    if ($CaptureJson -and $exitCode -eq 0 -and $output) {
        try {
            $parsedJson = $output | ConvertFrom-Json
        }
        catch {
            $parsedJson = $null
        }
    }

    $result = [ordered]@{
        name = $Name
        command = $Command
        exit_code = $exitCode
        ok = $(if ($exitCode -eq 0) { "sim" } else { "nao" })
        elapsed_ms = [int][Math]::Round(($finishedAt - $startedAt).TotalMilliseconds)
    }

    if ($parsedJson) {
        $result.details = $parsedJson
    }

    if ($exitCode -ne 0 -and $errorOutput) {
        $result.stderr = $errorOutput.Trim()
    }

    return $result
}

function Invoke-OptionalJsonCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

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

        if ($proc.ExitCode -ne 0) {
            return $null
        }

        $output = if (Test-Path $stdoutFile) { Get-Content $stdoutFile -Raw } else { "" }
        if (-not $output) {
            return $null
        }

        try {
            return $output | ConvertFrom-Json
        }
        catch {
            return $null
        }
    }
    finally {
        Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
    }
}

Push-Location $repoRoot
try {
    $steps = @()
    $steps += Invoke-VerifyStep -Name "docs" -Command "powershell -ExecutionPolicy Bypass -File scripts\check-doc-paths.ps1"
    if ($steps[-1].exit_code -ne 0) { throw "Falha em docs." }

    $steps += Invoke-VerifyStep -Name "version" -Command "scripts\verify-version.cmd --json" -CaptureJson
    if ($steps[-1].exit_code -ne 0) { throw "Falha em version." }

    $steps += Invoke-VerifyStep -Name "quality" -Command "scripts\check-quality.cmd --json" -CaptureJson
    if ($steps[-1].exit_code -ne 0) { throw "Falha em quality." }

    $steps += Invoke-VerifyStep -Name "api_tests" -Command "powershell -ExecutionPolicy Bypass -File scripts\test-api.ps1 -Json" -CaptureJson
    if ($steps[-1].exit_code -ne 0) { throw "Falha em api_tests." }

    $steps += Invoke-VerifyStep -Name "api_smoke" -Command "scripts\smoke-api.cmd --json" -CaptureJson
    if ($steps[-1].exit_code -ne 0) { throw "Falha em api_smoke." }

    $steps += Invoke-VerifyStep -Name "web_build" -Command "scripts\build-web.cmd --json" -CaptureJson
    if ($steps[-1].exit_code -ne 0) { throw "Falha em web_build." }

    $steps += Invoke-VerifyStep -Name "web_smoke" -Command "scripts\smoke-web.cmd --skip-build --json" -CaptureJson
    if ($steps[-1].exit_code -ne 0) { throw "Falha em web_smoke." }

    $report = [ordered]@{
        ok = "sim"
        steps = $steps
        total_steps = $steps.Count
        completed_at = (Get-Date).ToUniversalTime().ToString("o")
    }

    $releaseStatus = Invoke-OptionalJsonCommand -Command "scripts\release-status.cmd --json"
    if ($releaseStatus) {
        $report.release_status = $releaseStatus
    }

    $releaseReadiness = Invoke-OptionalJsonCommand -Command "scripts\verify-release-readiness.cmd --json"
    if ($releaseReadiness) {
        $report.release_readiness = $releaseReadiness
    }

    $doctor = Invoke-OptionalJsonCommand -Command "powershell -ExecutionPolicy Bypass -File scripts\doctor.ps1 -Json"
    if ($doctor) {
        $report.doctor = $doctor
    }

    if ($Json) {
        $report | ConvertTo-Json -Depth 5
        return
    }

    foreach ($step in $steps) {
        Write-Output "$($step.name)=ok;$($step.elapsed_ms)ms"
    }
    Write-Output "verify_report=ok"
}
catch {
    $report = [ordered]@{
        ok = "nao"
        error = $_.Exception.Message
        steps = $steps
        total_steps = $steps.Count
        completed_at = (Get-Date).ToUniversalTime().ToString("o")
    }

    if ($Json) {
        $report | ConvertTo-Json -Depth 5
        exit 1
    }

    throw
}
finally {
    Pop-Location
}
