param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [switch]$Json
)

$ErrorActionPreference = "Stop"

$checkVersionScript = Join-Path $PSScriptRoot "check-version.mjs"

$jsonFlag = if ($Json) { "--json" } else { $null }

node $checkVersionScript $Version $jsonFlag
if ($LASTEXITCODE -ne 0) {
    throw "Falha na validacao de versao do monorepo."
}
