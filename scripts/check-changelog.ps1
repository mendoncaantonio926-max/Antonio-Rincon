param(
    [string]$BaseRef = "origin/main",
    [ValidateSet("merge-base", "working-tree")]
    [string]$Mode = "merge-base"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    $gitRoot = (& git rev-parse --show-toplevel 2>$null)
    if ($LASTEXITCODE -ne 0) {
        Write-Output "Workspace sem repo Git detectado. Validacao de changelog ignorada."
        exit 0
    }

    if ($Mode -eq "working-tree" -and ((Resolve-Path $gitRoot).Path -ne (Resolve-Path $repoRoot).Path)) {
        Write-Output "Workspace aninhado em repo Git maior. Validacao local de changelog ignorada."
        exit 0
    }

    if ($Mode -eq "working-tree") {
        cmd /c "git rev-parse --verify HEAD >nul 2>nul"
        if ($LASTEXITCODE -eq 0) {
            $changedFiles = git diff --name-only HEAD
        }
        else {
            $changedFiles = git status --short | ForEach-Object {
                if ($_ -match '^\?\?\s+(.+)$') { $matches[1] }
                elseif ($_ -match '^[ MADRCU?!]{2}\s+(.+)$') { $matches[1] }
            }
        }
    }
    else {
        $changedFiles = git diff --name-only $BaseRef...HEAD
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao comparar changelog no modo $Mode."
    }

    if (-not $changedFiles) {
        Write-Output "Nenhuma mudanca para validar."
        exit 0
    }

    $requiresChangelog = $false
    foreach ($file in $changedFiles) {
        if ($file -eq "CHANGELOG.md") {
            continue
        }

        if (
            $file.StartsWith("apps/") -or
            $file.StartsWith("packages/") -or
            $file.StartsWith("scripts/") -or
            $file.StartsWith(".github/workflows/")
        ) {
            $requiresChangelog = $true
            break
        }
    }

    if (-not $requiresChangelog) {
        Write-Output "Mudanca sem impacto de changelog obrigatorio."
        exit 0
    }

    if ($changedFiles -contains "CHANGELOG.md") {
        Write-Output "CHANGELOG.md atualizado."
        exit 0
    }

    throw "Mudancas de codigo/operacao detectadas sem atualizacao de CHANGELOG.md."
}
finally {
    Pop-Location
}
