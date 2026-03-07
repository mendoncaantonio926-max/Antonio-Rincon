param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitRoot = (& git -C $repoRoot rev-parse --show-toplevel 2>$null)
$insideGit = (& git -C $repoRoot rev-parse --is-inside-work-tree 2>$null)
$versionFile = Join-Path $repoRoot "VERSION"
$version = if (Test-Path $versionFile) { (Get-Content $versionFile -Raw).Trim() } else { "" }
$nodePath = (& where.exe node 2>$null) -split "`r?`n" | Where-Object { $_ } | Select-Object -First 1
$nodeVersion = try { (& node --version 2>$null) } catch { "" }
$npmPaths = (& where.exe npm 2>$null) -split "`r?`n" | Where-Object { $_ }
$npmVersion = try { (& cmd /c npm --version 2>$null) } catch { "" }
$pythonPaths = (& where.exe python 2>$null) -split "`r?`n" | Where-Object { $_ }
$pythonVersion = try { (& python --version 2>$null) } catch { "" }
$bootstrapPython = $env:PULSO_BOOTSTRAP_PYTHON
$releaseStatus = @{}

try {
    $releaseStatusJson = & "$PSScriptRoot\release-status.ps1" -Json
    if ($releaseStatusJson) {
        $releaseStatus = $releaseStatusJson | ConvertFrom-Json
    }
}
catch {
    $releaseStatus = @{ erro = $_.Exception.Message }
}

$doctor = [ordered]@{
    workspace = @{
        path = $repoRoot
    }
    version = @{
        current = $version
    }
    git = @{
        inside_work_tree = $insideGit
        root = $gitRoot
        nested_workspace = $(if ($gitRoot -and ($gitRoot -ne $repoRoot)) { 'sim' } else { 'nao' })
    }
    node = @{
        path = $nodePath
        version = $nodeVersion
    }
    npm = @{
        paths = $npmPaths
        version = $npmVersion
    }
    python = @{
        paths = $pythonPaths
        version = $pythonVersion
        windows_store_alias = $(if ($pythonPaths | Where-Object { $_ -match 'WindowsApps' }) { 'sim' } else { 'nao' })
        bootstrap = $(if ($bootstrapPython) { $bootstrapPython } else { "" })
    }
    frontend = @{
        package_lock = $(if (Test-Path (Join-Path $repoRoot "package-lock.json")) { 'sim' } else { 'nao' })
        dist = $(if (Test-Path (Join-Path $repoRoot "apps/web/dist/index.html")) { 'sim' } else { 'nao' })
    }
    backend = @{
        venv = $(if (Test-Path (Join-Path $repoRoot "apps/api/.venv/Scripts/python.exe")) { 'sim' } else { 'nao' })
        sqlite = $(if (Test-Path (Join-Path $repoRoot "apps/api/.localdata/pulso-politico.db")) { 'sim' } else { 'nao' })
    }
    verify = @{
        doctor_report = $(if (Test-Path (Join-Path $repoRoot "doctor-report.json")) { 'sim' } else { 'nao' })
        doctor_summary = $(if (Test-Path (Join-Path $repoRoot "doctor-report.md")) { 'sim' } else { 'nao' })
        report_json = $(if (Test-Path (Join-Path $repoRoot "verify-report.json")) { 'sim' } else { 'nao' })
        report_md = $(if (Test-Path (Join-Path $repoRoot "verify-report.md")) { 'sim' } else { 'nao' })
    }
    release = $releaseStatus
}

if ($Json) {
    $doctor | ConvertTo-Json -Depth 5
    return
}

$doctor
