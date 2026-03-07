param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$stdoutFile = [System.IO.Path]::GetTempFileName()
$stderrFile = [System.IO.Path]::GetTempFileName()
$startedAt = Get-Date

Push-Location $repoRoot
try {
    $proc = Start-Process `
        -FilePath "cmd.exe" `
        -ArgumentList "/c", "scripts\test-api.cmd" `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $stdoutFile `
        -RedirectStandardError $stderrFile `
        -Wait `
        -PassThru

    $stdout = if (Test-Path $stdoutFile) { Get-Content $stdoutFile -Raw } else { "" }
    $stderr = if (Test-Path $stderrFile) { Get-Content $stderrFile -Raw } else { "" }
    $elapsedMs = [int][Math]::Round(((Get-Date) - $startedAt).TotalMilliseconds)

    $summaryLine = $null
    if ($stdout) {
        $summaryLine = ($stdout -split "\r?\n" | Where-Object { $_ -match "passed|failed|error|skipped" } | Select-Object -Last 1)
    }

    if ($Json) {
        $payload = [ordered]@{
            ok = $(if ($proc.ExitCode -eq 0) { "sim" } else { "nao" })
            exit_code = $proc.ExitCode
            elapsed_ms = $elapsedMs
        }

        if ($summaryLine) {
            $payload.summary = $summaryLine.Trim()
        }

        if ($proc.ExitCode -ne 0) {
            if ($stdout) {
                $payload.stdout = $stdout.Trim()
            }
            if ($stderr) {
                $payload.stderr = $stderr.Trim()
            }
            $payload | ConvertTo-Json -Depth 5
            exit $proc.ExitCode
        }

        $payload | ConvertTo-Json -Depth 5
        return
    }

    if ($stdout) {
        [Console]::Out.Write($stdout)
    }
    if ($stderr) {
        [Console]::Error.Write($stderr)
    }

    exit $proc.ExitCode
}
finally {
    Pop-Location
    Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
}
