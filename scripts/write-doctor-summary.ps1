param(
    [string]$ReportPath = "doctor-report.json",
    [string]$OutputPath = "doctor-report.md"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedReportPath = if ([System.IO.Path]::IsPathRooted($ReportPath)) { $ReportPath } else { Join-Path $repoRoot $ReportPath }
$resolvedOutputPath = if ([System.IO.Path]::IsPathRooted($OutputPath)) { $OutputPath } else { Join-Path $repoRoot $OutputPath }

if (-not (Test-Path $resolvedReportPath)) {
    throw "Relatorio nao encontrado em $resolvedReportPath."
}

$doctor = Get-Content $resolvedReportPath -Raw | ConvertFrom-Json

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Doctor Summary")
$lines.Add("")
$lines.Add("- workspace: $($doctor.workspace.path)")
$lines.Add("- version: $($doctor.version.current)")
$lines.Add("- nested_workspace: $($doctor.git.nested_workspace)")
$lines.Add("- node: $($doctor.node.version)")
$lines.Add("- npm: $($doctor.npm.version)")
$lines.Add("- python: $($doctor.python.version)")
$lines.Add("- python_windows_store_alias: $($doctor.python.windows_store_alias)")
$lines.Add("")
$lines.Add("## Backend")
$lines.Add("")
$lines.Add("- venv: $($doctor.backend.venv)")
$lines.Add("- sqlite: $($doctor.backend.sqlite)")
$lines.Add("")
$lines.Add("## Frontend")
$lines.Add("")
$lines.Add("- package_lock: $($doctor.frontend.package_lock)")
$lines.Add("- dist: $($doctor.frontend.dist)")
$lines.Add("")
$lines.Add("## Verify Artifacts")
$lines.Add("")
$lines.Add("- doctor_report: $($doctor.verify.doctor_report)")
$lines.Add("- verify_report_json: $($doctor.verify.report_json)")
$lines.Add("- verify_report_md: $($doctor.verify.report_md)")
$lines.Add("")
$lines.Add("## Release")
$lines.Add("")
$lines.Add("- current_version: $($doctor.release.versao_atual)")
$lines.Add("- next_patch: $($doctor.release.proximo_patch)")
$lines.Add("- next_patch_status: $($doctor.release.proximo_patch_status)")
$lines.Add("- next_minor_status: $($doctor.release.proximo_minor_status)")
$lines.Add("- next_major_status: $($doctor.release.proximo_major_status)")
$lines.Add("- changelog_version_section: $($doctor.release.changelog_secao_versao)")
$lines.Add("- unreleased_items: $($doctor.release.changelog_itens_unreleased)")

$content = ($lines -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText($resolvedOutputPath, $content, [System.Text.Encoding]::UTF8)
Write-Output $resolvedOutputPath
