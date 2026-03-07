param(
    [string[]]$Files = @(
        "README.md",
        "CONTRIBUTING.md",
        "SECURITY.md",
        "CHANGELOG.md",
        "docs/README.md",
        "docs/ARCHITECTURE.md",
        "docs/OPERATIONS.md",
        "docs/ROADMAP.md",
        "docs/RELEASE_CHECKLIST.md"
    )
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$missing = New-Object System.Collections.Generic.List[string]

function Test-DocPathCandidate {
    param(
        [string]$Token
    )

    if ([string]::IsNullOrWhiteSpace($Token)) { return $false }
    if ($Token -match '^(https?:|mailto:|origin/|\$\{\{)') { return $false }
    if ($Token -match '^\.\.\.$') { return $false }
    if ($Token -match '^[/\\]') { return $false }
    if ($Token -match '^\w+\s') { return $false }
    if ($Token -match '^(npm|python|uvicorn|git|docker|cmd|powershell|set)\b') { return $false }
    return $Token.Contains("/") -or $Token.Contains("\")
}

function Test-OptionalGeneratedPath {
    param(
        [string]$PathValue
    )

    return (
        $PathValue.StartsWith("apps/web/dist") -or
        $PathValue.StartsWith("apps/web/.localdata") -or
        $PathValue.StartsWith("apps/api/.localdata") -or
        $PathValue.StartsWith("apps/api/.venv") -or
        $PathValue.StartsWith("release/") -or
        $PathValue.StartsWith("node_modules")
    )
}

Push-Location $repoRoot
try {
    foreach ($relativeFile in $Files) {
        if (-not (Test-Path $relativeFile)) {
            $missing.Add("Arquivo de documentacao ausente: $relativeFile")
            continue
        }

        $content = Get-Content $relativeFile -Raw
        $matches = [regex]::Matches($content, '`([^\r\n`]+)`')

        foreach ($match in $matches) {
            $token = $match.Groups[1].Value.Trim()
            if (-not (Test-DocPathCandidate -Token $token)) {
                continue
            }

            $normalized = $token.Replace('\', '/')
            $candidatePath = $normalized.Split(" ")[0]
            $candidatePath = $candidatePath.TrimEnd('.', ',', ';', ':', ')')

            if (Test-OptionalGeneratedPath -PathValue $candidatePath) {
                continue
            }

            if (-not (Test-Path $candidatePath)) {
                $missing.Add("$relativeFile -> caminho inexistente: $candidatePath")
            }
        }
    }

    if ($missing.Count -gt 0) {
        $missing | ForEach-Object { Write-Error $_ }
        exit 1
    }

    Write-Output "Referencias de caminhos em documentacao validadas."
}
finally {
    Pop-Location
}
