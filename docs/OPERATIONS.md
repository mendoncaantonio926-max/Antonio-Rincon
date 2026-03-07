# Operacao Local

## Comandos principais

- preparar ambiente: `scripts\setup.cmd`
- limpar artefatos locais: `scripts\clean.cmd`
- `scripts\clean.cmd --keep-reports` preserva `doctor-report.json`, `verify-report.json` e `verify-report.md`
- `scripts\clean.cmd --keep-release` preserva `release/`
- reconstruir ambiente do zero: `scripts\rebuild.cmd`
- diagnosticar ambiente: `scripts\doctor.cmd`
- `scripts\doctor.cmd --json` exporta o diagnostico em formato estruturado
- `scripts\write-doctor-summary.cmd` gera um resumo Markdown a partir de `doctor-report.json`
- `npm run doctor:summary` expoe o mesmo resumo por alias
- o diagnostico tambem informa se `doctor-report.json`, `doctor-report.md`, `verify-report.json` e `verify-report.md` estao presentes no workspace
- a CI agora tambem publica `doctor-report.json` a partir desse diagnostico
- listar comandos principais: `scripts\help.cmd`
- validar documentacao: `npm run verify:docs`
- validar changelog local: `npm run verify:changelog`
- validar consistencia de versao: `npm run verify:version`
- validar qualidade de codigo: `scripts\check-quality.cmd`
- `scripts\check-quality.cmd --json` exporta o resultado estruturado da checagem de qualidade
- `npm run verify:quality` expoe o mesmo fluxo por alias
- a validacao de versao tambem aceita `--json`
- `scripts\verify-report.cmd --json` gera um resumo estruturado da verificacao ponta a ponta, com versao, testes do backend, build/smokes do frontend, snapshot de release e diagnostico de ambiente
- a verificacao ponta a ponta agora tambem inclui uma etapa dedicada de qualidade antes dos testes e smokes
- `scripts\write-verify-summary.cmd` gera um resumo Markdown a partir de `verify-report.json`
- `scripts\verify-summary.cmd` e `npm run verify:summary` regeneram `verify-report.json`, `doctor-report.json`, `doctor-report.md` e depois escrevem o resumo Markdown da verificacao
- o resumo Markdown tambem destaca erro global e etapas com falha quando presentes no relatorio
- esse relatorio agora tambem inclui detalhes estruturados do build do frontend
- validar prontidao de release da versao atual: `npm run verify:release-readiness`
- validar se a proxima versao esta preparavel: `scripts\verify-release-readiness.cmd patch`
- a checagem de prontidao de release tambem aceita `--json`
- validar monorepo inteiro: `scripts\verify-all.cmd`
- preparar branch para PR: `scripts\prepare-pr.cmd`
- mostrar versao atual: `scripts\show-version.cmd`
- inspecionar status de release: `scripts\release-status.cmd`
- planejar uma release sem mutacao: `scripts\plan-release.cmd`
- ambos tambem aceitam `--json` para automacao local
- resolver incremento de versao por `patch`, `minor` ou `major` nos comandos de bump/release
- o status de release tambem mostra os proximos valores `patch`, `minor` e `major`
- o status de release tambem indica se cada proxima versao esta executavel, preparavel ou bloqueada
- o status e o planejamento de release tambem apontam se ja existem artefatos locais para o alvo
- preparar release local usando `VERSION`: `scripts\release-local.cmd`
- simular release local sem escrita: `scripts\release-local.cmd --dry-run`
- `scripts\release-local.cmd --dry-run --json` e `scripts\prepare-release.cmd patch --dry-run --json` tambem geram saida estruturada
- preparar release local usando `VERSION` por npm: `npm run release:local`
- preparar nova release com bump + changelog + validacao: `scripts\prepare-release.cmd X.Y.Z`
- preparar release local: `scripts\release-local.cmd vX.Y.Z`
- preparar release local por npm: `npm run release:local -- vX.Y.Z`
- validar release local: `scripts\verify-release.cmd vX.Y.Z`
- a validacao final do artefato tambem aceita `--json`

## Execucao por area

- backend: `scripts\run-api.cmd`
- backend smoke: `scripts\smoke-api.cmd`
- `scripts\smoke-api.cmd --json` exporta o smoke da API em formato estruturado
- frontend preview: `scripts\run-web.cmd`
- frontend smoke: `scripts\smoke-web.cmd`
- `scripts\smoke-web.cmd --json` exporta o smoke do frontend em formato estruturado
- metadados estruturados do build do frontend: `scripts\build-web.cmd --json`
- smoke de app inteiro: `scripts\smoke-all.cmd`
- `scripts\smoke-all.cmd --json` exporta o smoke agregado em formato estruturado, com detalhes dos smokes de API e frontend

Aliases via `npm`:

- backend: `npm run start:api`
- frontend: `npm run start:web`
- smoke API: `npm run smoke:api`
- smoke frontend: `npm run smoke:web`
- smoke completo: `npm run smoke`

## Sequencia recomendada

1. `scripts\setup.cmd`
2. `scripts\doctor.cmd`
3. `scripts\run-api.cmd`
4. `scripts\run-web.cmd`

Para validar antes de entrega:

1. `scripts\prepare-pr.cmd`

Para reset completo do ambiente:

1. `scripts\rebuild.cmd`

Para preparar artefato de release local:

1. `scripts\release-local.cmd`
1. `scripts\release-local.cmd vX.Y.Z`

## Observacoes

- neste ambiente Windows, o `python` do PATH pode apontar para o alias da Microsoft Store
- o backend contorna isso com bootstrap de runtime local
- o frontend prioriza `npm ci --ignore-scripts`, com fallback para `npm install --ignore-scripts` se o Windows bloquear limpeza de `node_modules`
- neste workspace, o diretorio pode estar aninhado em um repo Git maior; nesse caso `verify:changelog` informa que a validacao local foi ignorada
- `scripts\clean.cmd` tambem remove artefatos gerados em `release/`
- `scripts\clean.cmd` tambem remove `doctor-report.json`, `doctor-report.md`, `verify-report.json` e `verify-report.md`
- `scripts\release-local.cmd` preserva `release/` durante o rebuild para nao perder artefatos anteriores
