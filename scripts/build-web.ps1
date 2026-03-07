param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $repoRoot "apps\web\dist"
$metaPath = Join-Path $distDir "meta.json"
$indexPath = Join-Path $distDir "index.html"
$stdoutFile = [System.IO.Path]::GetTempFileName()
$stderrFile = [System.IO.Path]::GetTempFileName()
$startedAt = Get-Date

Push-Location $repoRoot
try {
    $proc = Start-Process `
        -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm run build:web" `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $stdoutFile `
        -RedirectStandardError $stderrFile `
        -Wait `
        -PassThru

    $stdout = if (Test-Path $stdoutFile) { Get-Content $stdoutFile -Raw } else { "" }
    $stderr = if (Test-Path $stderrFile) { Get-Content $stderrFile -Raw } else { "" }
    $elapsedMs = [int][Math]::Round(((Get-Date) - $startedAt).TotalMilliseconds)

    $payload = [ordered]@{
        ok = $(if ($proc.ExitCode -eq 0) { "sim" } else { "nao" })
        exit_code = $proc.ExitCode
        elapsed_ms = $elapsedMs
    }

    if ($proc.ExitCode -eq 0) {
        $payload.dist_dir = $distDir
        $payload.index_exists = $(if (Test-Path $indexPath) { "sim" } else { "nao" })
        $payload.meta_exists = $(if (Test-Path $metaPath) { "sim" } else { "nao" })

        if (Test-Path $metaPath) {
            try {
                $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
                $outputs = @($meta.outputs.PSObject.Properties.Name)
                $payload.output_count = $outputs.Count
                $payload.outputs = $outputs
            }
            catch {
            }
        }
    }
    else {
        if ($stdout) {
            $payload.stdout = $stdout.Trim()
        }
        if ($stderr) {
            $payload.stderr = $stderr.Trim()
        }
    }

    if ($Json) {
        $payload | ConvertTo-Json -Depth 6
        exit $proc.ExitCode
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
