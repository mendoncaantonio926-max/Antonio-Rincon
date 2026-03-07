# Arquitetura Atual

## Monorepo

- `apps/api`: backend FastAPI
- `apps/web`: frontend React
- `packages/ui`: componentes compartilhados
- `scripts`: automacao operacional local

## Backend

- FastAPI como camada HTTP
- persistencia local em SQLite dentro de `apps/api/.localdata`
- bootstrap automatico de runtime Python via `scripts/run-api.cmd`
- verificacao por testes em `scripts/test-api.cmd`
- smoke operacional por `scripts/smoke-api.cmd`
- smoke operacional da API tambem pode ser exportado em JSON

## Frontend

- React com build estatico via `esbuild`
- artefato gerado em `apps/web/dist`
- build do frontend tambem pode ser inspecionado em JSON por `scripts/build-web.cmd`
- preview local servido por `scripts/serve-web-dist.mjs`
- smoke operacional por `scripts/smoke-web.cmd`
- smoke operacional do frontend tambem pode ser exportado em JSON
- o frontend autenticado agora cobre dashboard ampliado, onboarding orientado, CRM com estados, relatorios com metricas, billing comercial, timeline de adversarios com classificacao comparativa e resumo IA com foco por modulo

## Verificacao

- fluxo ponta a ponta local em `scripts/verify-all.cmd`
- CI em GitHub Actions reaproveitando o mesmo fluxo
- CI usa bootstrap compartilhado em `scripts/ci-bootstrap.cmd`
- CI publica o artefato do frontend quando a verificacao e bem-sucedida
- CI publica tambem um relatorio `verify-report.json` com o resumo estruturado da verificacao
- CI publica tambem um resumo Markdown `verify-report.md` derivado do relatorio JSON
- CI publica tambem `doctor-report.json` para diagnostico do ambiente, inclusive em falhas
- CI publica tambem `doctor-report.md` como resumo humano do diagnostico
- workflow manual de release reaproveita a mesma verificacao antes de publicar
- release publica zip do frontend e manifesto JSON com checksum
- release publica zip do frontend, manifesto JSON e notas derivadas do changelog
- bootstrap da CI evita `pip install` desnecessario quando as dependencias do backend ja estao presentes
- verificacao ponta a ponta agora inclui consistencia entre `VERSION`, manifests npm do monorepo, `package-lock.json` e `apps/api/pyproject.toml`
- release local e workflow manual podem resolver a versao automaticamente a partir de `VERSION`
- manifesto de release agora e gerado por script compartilhado entre fluxo local e CI
- release local e workflow manual tambem exigem secao correspondente em `CHANGELOG.md`
- validacao de release foi consolidada em `scripts/check-release-readiness.ps1`
- o changelog pode ser cortado de `Unreleased` para uma versao por `scripts/cut-release-changelog.ps1`
- a preparacao de uma nova release pode ser feita em lote por `scripts/prepare-release.ps1`
- resolucao de versao alvo agora aceita versao explicita ou incremento semantico (`patch`, `minor`, `major`)
- a checagem de prontidao de release aceita versao explicita ou incremento semantico, distinguindo release pronta da release apenas preparavel
- o workflow manual de release do GitHub espelha a mesma resolucao de versao usada localmente
- o planejamento de release local pode ser consultado sem mutacao por `scripts/plan-release.ps1`
- a execucao efetiva do release local e do workflow do GitHub exige versao ja preparada no branch atual
- status e planejamento de release podem ser exportados em JSON para automacao
- o diagnostico geral do workspace tambem pode ser exportado em JSON por `scripts/doctor.ps1`
- dry-runs de preparo e release local tambem podem ser exportados em JSON
- a propria checagem de prontidao de release tambem pode ser exportada em JSON
- a validacao final do artefato de release tambem pode ser exportada em JSON
- a validacao de consistencia de versao tambem pode ser exportada em JSON
- a verificacao ponta a ponta do monorepo agora tambem pode gerar relatorio JSON
- o relatorio JSON de verificacao agora incorpora detalhes estruturados de versao, testes do backend, build do frontend, smokes, snapshot de release e diagnostico de ambiente
- o smoke agregado do sistema tambem pode ser exportado em JSON, com detalhes dos smokes de API e frontend
- a verificacao agora tambem inclui checagem dedicada de qualidade com typecheck do frontend e compilacao estrutural do backend

## Decisoes operacionais

- evitar dependencia em Vite preview para validacao final no Windows atual
- manter scripts reais do repo como fonte unica de execucao
- priorizar validacao reproduzivel antes de automacoes paralelas mais sofisticadas

## Riscos remanescentes

- backend ainda usa SQLite local como padrao de scaffold
- politica de seguranca e LGPD ainda sao bases iniciais, nao hardening completo
- release ainda depende de disparo manual, mesmo com workflow dedicado
