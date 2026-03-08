# Projeto Pulso Politico

Monorepo do MVP do Pulso Politico, com frontend React, API FastAPI, fluxo local de operacao/release e base funcional para CRM politico, onboarding, relatorios, billing e monitoramento de adversarios.

Repositorio publico:
- `https://github.com/mendoncaantonio926-max/Antonio-Rincon`

Release publicada mais recente:
- `https://github.com/mendoncaantonio926-max/Antonio-Rincon/releases/tag/v0.1.6`

## Estrutura

- `apps/web`: frontend React + Vite
- `apps/api`: backend FastAPI
- `packages/ui`: componentes compartilhados de UI
- `packages/types`: tipos TypeScript compartilhados
- `packages/config`: configuracoes compartilhadas
- `docs`: documentacao de produto e engenharia
- `infra`: infraestrutura local

## Setup rapido

Para preparar frontend e backend de uma vez:

```bat
scripts\setup.cmd
```

Ou:

```bash
npm run setup
```

Para diagnosticar rapidamente o ambiente local:

```bat
scripts\doctor.cmd
scripts\doctor.cmd --json
scripts\write-doctor-summary.cmd
```

Ou:

```bash
npm run doctor:summary
```

Para listar os comandos principais do workspace:

```bat
scripts\help.cmd
```

Para validar qualidade de codigo sem esperar o build/smoke completo:

```bat
scripts\check-quality.cmd
scripts\check-quality.cmd --json
```

Ou:

```bash
npm run verify:quality
npm run lint
npm run lint:write
```

Onde:

- `scripts\check-quality.cmd` agora inclui typecheck do frontend, lint com Biome e compilacao estrutural do backend
- `npm run lint` valida frontend, componentes compartilhados e scripts web com Biome
- `npm run lint:write` aplica os ajustes seguros do Biome no mesmo escopo

Para validar a cobertura automatizada de frontend:

```bash
npm run test:web
```

- `npm run test:web` roda Vitest com Testing Library sobre fluxos criticos do app web

Para validar o app em navegador real:

```bat
scripts\browser-audit.cmd
scripts\browser-audit.cmd --skip-build
```

Ou:

```bash
npm run browser:audit
```

- `scripts\browser-audit.cmd` executa auditoria real com Chrome local, API local e frontend buildado
- `--skip-build` reaproveita o `dist` atual quando voce ja acabou de rodar `build` ou `rebuild`

Para obter um relatorio estruturado da verificacao ponta a ponta:

```bat
scripts\verify-report.cmd --json
scripts\write-verify-summary.cmd
scripts\verify-summary.cmd
```

Ou:

```bash
npm run verify:summary
```

Esse relatorio agora tambem incorpora detalhes estruturados de versao, testes do backend, build do frontend, smoke da API, smoke do frontend, snapshot de release e diagnostico de ambiente. O resumo Markdown sintetiza esse JSON para leitura humana e para o summary da CI, incluindo erro e etapas com falha quando existirem. O comando `verify:summary` regenera `verify-report.json`, `doctor-report.json`, `doctor-report.md` e depois escreve o resumo final da verificacao.
Antes dos testes e smokes, a verificacao agora tambem exige `typecheck` explicito do frontend e compilacao estrutural do backend.

Para limpar artefatos locais do workspace:

```bat
scripts\clean.cmd
scripts\clean.cmd --keep-reports
scripts\clean.cmd --keep-release
```

Para reconstruir ambiente e validar tudo do zero:

```bat
scripts\rebuild.cmd
```

Para preparar artefato local de release:

```bat
scripts\release-local.cmd
scripts\release-local.cmd --with-browser-audit
```

Para simular a geracao sem rebuild nem escrita:

```bat
scripts\release-local.cmd --dry-run
scripts\release-local.cmd --dry-run --json
```

Ou:

```bash
npm run release:local
npm run release:local -- --with-browser-audit
```

- `--with-browser-audit` exige que a release rode a auditoria real de navegador antes de zipar os artefatos

Para informar uma versao explicitamente:

```bat
scripts\release-local.cmd vX.Y.Z
scripts\release-local.cmd X.Y.Z
scripts\release-local.cmd vX.Y.Z --dry-run
```

Ou:

```bash
npm run release:local -- vX.Y.Z
```

Esse fluxo gera:
- `release/web-dist-vX.Y.Z.zip`
- `release/release-vX.Y.Z.json`
- `release/release-vX.Y.Z.md`

Para validar zip e manifesto gerados:

```bat
scripts\verify-release.cmd vX.Y.Z
scripts\verify-release.cmd X.Y.Z
scripts\verify-release.cmd vX.Y.Z --json
```

Antes da release, mantenha `VERSION`, os `package.json` do monorepo, o `package-lock.json` e `apps/api/pyproject.toml` alinhados com a versao alvo.
Para isso, voce pode usar:

```bat
scripts\bump-version.cmd X.Y.Z
```

Ou:

```bash
npm run version:bump -- X.Y.Z
```

Tambem e possivel usar incremento semantico direto:

```bat
scripts\bump-version.cmd patch
scripts\bump-version.cmd minor
scripts\bump-version.cmd major
```

Para consultar a versao atual:

```bat
scripts\show-version.cmd
```

Para inspecionar o estado atual de release:

```bat
scripts\release-status.cmd
scripts\release-status.cmd --json
```

Esse status tambem mostra os proximos incrementos `patch`, `minor` e `major`.
Ele tambem indica se cada um esta `executavel`, `preparavel` ou `bloqueada`.
E agora informa se ja existem artefatos locais para esses proximos alvos.

Para planejar uma release sem mutar nada:

```bat
scripts\plan-release.cmd
scripts\plan-release.cmd patch
scripts\plan-release.cmd patch --json
```

O planejamento tambem mostra colisao potencial de zip, manifesto e notas para a versao alvo.

Ou:

```bash
npm run version:show
```

Se `VERSION` ja estiver correta, tanto `scripts\release-local.cmd` quanto o workflow manual de release podem usar essa versao automaticamente.
`npm run verify:version` valida esse alinhamento antes da release.
`scripts\verify-version.cmd --json` exporta a mesma checagem de forma estruturada.
O release tambem exige uma secao correspondente em `CHANGELOG.md`.
`npm run verify:release-readiness` combina essas duas validacoes para a versao atual do repo.
`scripts\verify-release-readiness.cmd patch` valida se a proxima versao calculada esta preparavel a partir de `Unreleased`.
`scripts\verify-release-readiness.cmd patch --json` exporta essa checagem de forma estruturada.
No workflow manual do GitHub, a publicacao efetiva exige que a versao alvo ja seja a `VERSION` atual do branch.

Para cortar a secao `Unreleased` para uma versao e reabrir o changelog:

```bat
scripts\cut-release-changelog.cmd vX.Y.Z
```

Ou:

```bash
npm run release:cut-changelog -- vX.Y.Z
```

Para preparar uma release nova de ponta a ponta antes do artefato:

```bat
scripts\prepare-release.cmd X.Y.Z --dry-run
scripts\prepare-release.cmd X.Y.Z
scripts\prepare-release.cmd patch --dry-run
scripts\prepare-release.cmd patch --dry-run --json
```

Para um smoke do sistema inteiro:

```bat
scripts\smoke-all.cmd
scripts\smoke-all.cmd --json
```

No modo JSON, o smoke agregado agora incorpora detalhes estruturados dos smokes de API e frontend.

Se o frontend ja tiver sido buildado:

```bat
scripts\smoke-all.cmd --skip-web-build
```

Se a API ja tiver sido validada separadamente:

```bat
scripts\smoke-all.cmd --skip-api --skip-web-build
```

### Frontend

```bash
npm ci --ignore-scripts
npm run build:web
```

No Windows com restricao de PowerShell para `npm.ps1`, use:

```bat
scripts\run-web.cmd
```

Por padrao, `scripts\run-web.cmd` usa cache local de `npm`, tenta `npm ci --ignore-scripts` quando existe lockfile e cai para `npm install --ignore-scripts` se o Windows bloquear a limpeza de `node_modules`. Depois disso ele gera o `dist` e sobe um preview estatico em `http://127.0.0.1:4173`.

Para rodar o fluxo de desenvolvimento com Vite explicitamente:

```bat
scripts\run-web.cmd --dev
```

Para preparar dependencias sem subir servidor:

```bat
scripts\run-web.cmd --setup-only
```

Para um smoke test operacional do frontend:

```bat
scripts\smoke-web.cmd
scripts\smoke-web.cmd --json
```

Se o `dist` ja tiver sido gerado e voce quiser apenas validar a subida local do artefato:

```bat
scripts\smoke-web.cmd --skip-build
scripts\smoke-web.cmd --skip-build --json
```

Para obter metadados estruturados do build do frontend:

```bat
scripts\build-web.cmd --json
```

Para verificar o monorepo inteiro em sequencia:

```bat
scripts\verify-all.cmd
```

Ou via `npm`:

```bash
npm run verify
```

Para validar changelog local:

```bash
npm run verify:changelog
```

Para preparar a branch para PR:

```bat
scripts\prepare-pr.cmd
```

Para validar somente referencias de documentacao:

```bash
npm run verify:docs
```

### Backend

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```

Ou use o atalho:

```bat
scripts\run-api.cmd
```

Para hot reload explicito:

```bat
scripts\run-api.cmd --reload
```

Se o `python` do Windows apontar apenas para a Microsoft Store, defina antes:

```bat
set PULSO_BOOTSTRAP_PYTHON=C:\caminho\para\python.exe
```

Para rodar os testes do backend:

```bat
scripts\test-api.cmd
```

Para um smoke test operacional da API:

```bat
scripts\smoke-api.cmd
scripts\smoke-api.cmd --json
```

### Infra local

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Ou:

```bat
scripts\run-infra.cmd
```

## Estado atual

Este repositorio contem a fundacao inicial do projeto:
- landing page e app shell no frontend
- API FastAPI com healthcheck
- estrutura de pacotes compartilhados
- arquivos-base para evolucao do MVP

Indice da documentacao complementar:
- `docs/README.md`

## MVP ja scaffoldado

Backend:
- auth, login, registro e refresh
- tenant atual e roles basicos
- contatos
- tarefas
- adversarios e timeline
- onboarding
- billing/trial local
- relatorios e exportacao com watermark textual
- auditoria
- leads publicos

Frontend:
- landing page com captacao de lead
- login e registro
- dashboard autenticado
- onboarding
- contatos
- tarefas
- adversarios
- relatorios
- billing
- auditoria

## Observacoes

- o backend agora usa SQLite local por padrao em `apps/api/.localdata`
- os scripts de backend fazem bootstrap da `.venv` automaticamente quando encontram um Python funcional
- o frontend usa build estatico por `esbuild` e preview local via `scripts\serve-web-dist.mjs`
- existe uma verificacao ponta a ponta do monorepo em `scripts\verify-all.cmd`
- a verificacao ponta a ponta local agora inclui checagem estrutural da documentacao
- o repo agora inclui bootstrap unico local via `scripts\setup.cmd`
- o repo agora inclui diagnostico rapido de ambiente via `scripts\doctor.cmd`
- o diagnostico agora tambem mostra a presenca local de `doctor-report.json`, `doctor-report.md`, `verify-report.json` e `verify-report.md`
- o repo agora inclui ajuda rapida de comandos via `scripts\help.cmd`
- o repo agora inclui limpeza controlada de artefatos locais via `scripts\clean.cmd`
- os relatórios locais `verify-report.json` e `verify-report.md` agora sao tratados como artefatos gerados
- o repo agora inclui rebuild completo do ambiente via `scripts\rebuild.cmd`
- o repo agora inclui preparo local de release via `scripts\release-local.cmd`
- o repo agora inclui smoke agregado do sistema e guia operacional em `scripts\smoke-all.cmd` e `docs/OPERATIONS.md`
- artefatos locais de release em `release/` agora sao tratados como gerados e removidos por `scripts\clean.cmd`
- o release local agora preserva `release/` durante o rebuild para manter artefatos anteriores
- o repo agora inclui fluxo local de pre-PR com `scripts\prepare-pr.cmd`
- o repositorio agora inclui CI em GitHub Actions para executar a verificacao ponta a ponta em Windows
- contribuicoes agora tem guia em `CONTRIBUTING.md`, template de PR e templates de issue
- dependencias e workflows agora podem ser monitorados por `dependabot`
- o repo agora inclui `SECURITY.md` com orientacao minima para reporte e endurecimento
- o repo agora inclui `.editorconfig`, `CODEOWNERS` e configuracao central das issue templates
- o changelog e a categorizacao de release agora estao estruturados em `CHANGELOG.md` e `.github/release.yml`
- o repo agora inclui `.gitattributes` para estabilizar line endings e diffs entre Windows e demais ambientes
- a arquitetura atual e o backlog imediato foram consolidados em `docs/ARCHITECTURE.md` e `docs/ROADMAP.md`
- PRs agora podem validar automaticamente a presenca de atualizacao em `CHANGELOG.md`
- PRs agora tambem podem receber labels automaticos por area via `.github/labeler.yml`
- a CI agora pode validar caminhos referenciados na documentacao via `scripts/check-doc-paths.ps1`
- releases agora podem ter rascunho automatico via `.github/workflows/release-drafter.yml`
- a CI agora publica o artefato `apps/web/dist` quando a verificacao passa
- a CI agora tambem publica `verify-report.json`, `verify-report.md`, `doctor-report.json` e `doctor-report.md` para diagnostico pos-execucao
- o repo agora inclui workflow manual de release em `.github/workflows/release.yml`
- os workflows principais agora compartilham bootstrap por `scripts\ci-bootstrap.cmd`
- o repo agora usa `VERSION` como referencia simples para validar releases
