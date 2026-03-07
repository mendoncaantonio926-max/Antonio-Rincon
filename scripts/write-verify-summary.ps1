param(
    [string]$ReportPath = "verify-report.json",
    [string]$OutputPath = "verify-report.md"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedReportPath = if ([System.IO.Path]::IsPathRooted($ReportPath)) { $ReportPath } else { Join-Path $repoRoot $ReportPath }
$resolvedOutputPath = if ([System.IO.Path]::IsPathRooted($OutputPath)) { $OutputPath } else { Join-Path $repoRoot $OutputPath }

if (-not (Test-Path $resolvedReportPath)) {
    throw "Relatorio nao encontrado em $resolvedReportPath."
}

$report = Get-Content $resolvedReportPath -Raw | ConvertFrom-Json

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Verify Summary")
$lines.Add("")
$lines.Add("- status: $($report.ok)")
$lines.Add("- total_steps: $($report.total_steps)")
$lines.Add("- completed_at: $($report.completed_at)")

if ($report.error) {
    $lines.Add("- error: $($report.error)")
}

if ($report.release_readiness) {
    $lines.Add("- release_readiness: $($report.release_readiness.estado)")
}

if ($report.release_status) {
    $lines.Add("- current_version: $($report.release_status.versao_atual)")
    $lines.Add("- next_patch_status: $($report.release_status.proximo_patch_status)")
}

$lines.Add("")
$lines.Add("## Steps")
$lines.Add("")
$lines.Add("| Step | Status | Elapsed ms |")
$lines.Add("| --- | --- | ---: |")

foreach ($step in $report.steps) {
    $lines.Add("| $($step.name) | $($step.ok) | $($step.elapsed_ms) |")
}

if ($report.doctor) {
    $doctorReportPath = Join-Path $repoRoot "doctor-report.json"
    $lines.Add("")
    $lines.Add("## Environment")
    $lines.Add("")
    $lines.Add("- version: $($report.doctor.version.current)")
    $lines.Add("- node: $($report.doctor.node.version)")
    $lines.Add("- npm: $($report.doctor.npm.version)")
    $lines.Add("- python: $($report.doctor.python.version)")
    $lines.Add("- python_windows_store_alias: $($report.doctor.python.windows_store_alias)")
    $lines.Add("- backend_venv: $($report.doctor.backend.venv)")
    $lines.Add("- frontend_dist: $($report.doctor.frontend.dist)")
    if ($report.doctor.verify) {
        $lines.Add("- doctor_report: $(if (Test-Path $doctorReportPath) { 'sim' } else { 'nao' })")
        $lines.Add("- verify_report_json: $(if (Test-Path $resolvedReportPath) { 'sim' } else { 'nao' })")
        $lines.Add("- verify_report_md: sim")
    }
}

$failedSteps = @($report.steps | Where-Object { $_.ok -ne "sim" -and $_.ok -ne "ignorado" })
if ($failedSteps.Count -gt 0) {
    $lines.Add("")
    $lines.Add("## Failing Steps")
    $lines.Add("")

    foreach ($step in $failedSteps) {
        $lines.Add("- $($step.name): $($step.ok)")
        if ($step.stderr) {
            $lines.Add("  stderr: $($step.stderr)")
        }
    }
}

$content = ($lines -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText($resolvedOutputPath, $content, [System.Text.Encoding]::UTF8)
Write-Output $resolvedOutputPath
