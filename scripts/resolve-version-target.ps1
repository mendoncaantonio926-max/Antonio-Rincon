param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"

if (-not (Test-Path $versionFile)) {
    throw "Arquivo VERSION nao encontrado."
}

$currentVersion = (Get-Content $versionFile -Raw).Trim()
if ($currentVersion -notmatch '^(\d+)\.(\d+)\.(\d+)$') {
    throw "VERSION contem um valor invalido: $currentVersion"
}

if ($Version -match '^v(\d+\.\d+\.\d+)$') {
    Write-Output $Matches[1]
    return
}

if ($Version -match '^\d+\.\d+\.\d+$') {
    Write-Output $Version
    return
}

$major = [int]$Matches[1]
$minor = [int]$Matches[2]
$patch = [int]$Matches[3]

switch ($Version.ToLowerInvariant()) {
    "patch" {
        Write-Output ("{0}.{1}.{2}" -f $major, $minor, ($patch + 1))
        return
    }
    "minor" {
        Write-Output ("{0}.{1}.0" -f $major, ($minor + 1))
        return
    }
    "major" {
        Write-Output ("{0}.0.0" -f ($major + 1))
        return
    }
    default {
        throw "Use uma versao no formato X.Y.Z ou um incremento patch|minor|major."
    }
}
