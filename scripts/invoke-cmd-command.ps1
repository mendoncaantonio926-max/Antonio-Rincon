param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [string]$WorkingDirectory
)

$ErrorActionPreference = "Stop"

if (-not $WorkingDirectory) {
    $WorkingDirectory = Split-Path -Parent $PSScriptRoot
}

$stdoutFile = [System.IO.Path]::GetTempFileName()
$stderrFile = [System.IO.Path]::GetTempFileName()

try {
    $proc = Start-Process `
        -FilePath "cmd.exe" `
        -ArgumentList "/c", $Command `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $stdoutFile `
        -RedirectStandardError $stderrFile `
        -Wait `
        -PassThru

    if (Test-Path $stdoutFile) {
        [Console]::Out.Write((Get-Content $stdoutFile -Raw))
    }

    if (Test-Path $stderrFile) {
        $stderr = Get-Content $stderrFile -Raw
        if ($stderr) {
            [Console]::Error.Write($stderr)
        }
    }

    exit $proc.ExitCode
}
finally {
    Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
}
