param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptPath,
    [string[]]$ScriptArguments = @(),
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$stdoutFile = [System.IO.Path]::GetTempFileName()
$stderrFile = [System.IO.Path]::GetTempFileName()

try {
    $resolvedArguments = @($ScriptArguments)
    if ($Json) {
        $resolvedArguments += "-Json"
    }

    $quotedArguments = @(
        "-NoLogo"
        "-NoProfile"
        "-ExecutionPolicy"
        "Bypass"
        "-File"
        ('"{0}"' -f $ScriptPath)
    )

    foreach ($argument in $resolvedArguments) {
        if ($argument -match "\s") {
            $quotedArguments += ('"{0}"' -f $argument)
        }
        else {
            $quotedArguments += $argument
        }
    }

    $proc = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList $quotedArguments `
        -RedirectStandardOutput $stdoutFile `
        -RedirectStandardError $stderrFile `
        -Wait `
        -PassThru

    if (Test-Path $stdoutFile) {
        [Console]::Out.Write((Get-Content $stdoutFile -Raw))
    }

    if ($proc.ExitCode -ne 0 -and (Test-Path $stderrFile)) {
        [Console]::Error.Write((Get-Content $stderrFile -Raw))
    }

    exit $proc.ExitCode
}
finally {
    Remove-Item $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
}
