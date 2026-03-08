@echo off
setlocal

echo Pulso Politico - comandos locais
echo.
echo Setup:
echo   scripts\setup.cmd
echo   npm run setup
echo   scripts\rebuild.cmd
echo   npm run rebuild
echo.
echo Diagnostico:
echo   scripts\doctor.cmd
echo   scripts\doctor.cmd --json
echo   scripts\write-doctor-summary.cmd
echo   npm run doctor
echo   npm run doctor:summary
echo.
echo Execucao:
echo   scripts\run-api.cmd
echo   scripts\run-web.cmd
echo   scripts\build-web.cmd
echo   scripts\build-web.cmd --json
echo   npm run start:api
echo   npm run start:web
echo.
echo Smoke:
echo   scripts\smoke-api.cmd
echo   scripts\smoke-api.cmd --json
echo   scripts\smoke-web.cmd
echo   scripts\smoke-web.cmd --json
echo   scripts\smoke-all.cmd
echo   scripts\smoke-all.cmd --json
echo   scripts\browser-audit.cmd
echo   scripts\browser-audit.cmd --skip-build
echo   npm run smoke:api
echo   npm run smoke:web
echo   npm run smoke
echo   npm run browser:audit
echo.
echo Verificacao:
echo   scripts\verify-all.cmd
echo   npm run verify
echo   npm run verify:docs
echo   npm run verify:changelog
echo   scripts\verify-report.cmd --json
echo   scripts\write-verify-summary.cmd
echo   scripts\verify-summary.cmd
echo   npm run verify:report
echo   npm run verify:summary
echo   scripts\verify-version.cmd
echo   scripts\verify-version.cmd --json
echo   scripts\verify-release-readiness.cmd
echo   scripts\verify-release-readiness.cmd patch
echo   scripts\verify-release-readiness.cmd patch --json
echo   npm run verify:release-readiness
echo.
echo PR:
echo   scripts\prepare-pr.cmd
echo   npm run prepare:pr
echo.
echo Release:
echo   scripts\release-status.cmd
echo   scripts\release-status.cmd --json
echo   npm run release:status
echo   scripts\plan-release.cmd
echo   scripts\plan-release.cmd patch
echo   scripts\plan-release.cmd patch --json
echo   npm run release:plan -- patch
echo   scripts\show-version.cmd
echo   scripts\bump-version.cmd X.Y.Z ^| patch ^| minor ^| major
echo   npm run version:bump -- X.Y.Z
echo   npm run version:bump -- patch
echo   scripts\prepare-release.cmd X.Y.Z ^| patch ^| minor ^| major --dry-run
echo   scripts\prepare-release.cmd patch --dry-run --json
echo   scripts\prepare-release.cmd X.Y.Z ^| patch ^| minor ^| major
echo   npm run release:prepare -- patch --dry-run
echo   scripts\cut-release-changelog.cmd vX.Y.Z
echo   npm run release:cut-changelog -- vX.Y.Z
echo   powershell -ExecutionPolicy Bypass -File scripts\resolve-release-version.ps1
echo   scripts\verify-release.cmd vX.Y.Z
echo   scripts\verify-release.cmd vX.Y.Z --json
echo   scripts\release-local.cmd --dry-run
echo   scripts\release-local.cmd --dry-run --json
echo   scripts\release-local.cmd
echo   scripts\release-local.cmd --with-browser-audit
echo   scripts\release-local.cmd vX.Y.Z --dry-run
echo   scripts\release-local.cmd vX.Y.Z
echo   scripts\release-local.cmd vX.Y.Z --with-browser-audit
echo   npm run release:local
echo   npm run version:show
echo   npm run release:local -- vX.Y.Z
echo   gera zip e manifesto em release\
echo.
echo Limpeza:
echo   scripts\clean.cmd
echo   scripts\clean.cmd --keep-reports
echo   scripts\clean.cmd --keep-release
echo   npm run clean
