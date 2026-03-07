param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

if ($Version -match '^v\d+\.\d+\.\d+$') {
    Write-Output $Version
    return
}

if ($Version -match '^\d+\.\d+\.\d+$') {
    Write-Output "v$Version"
    return
}

throw "Use uma versao no formato vX.Y.Z ou X.Y.Z."
