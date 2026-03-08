# Changelog

Todas as mudancas relevantes deste repositorio devem ser registradas aqui.

O formato segue uma estrutura simples inspirada em Keep a Changelog:

- Added
- Changed
- Fixed
- Docs
- Ops

## [Unreleased]

### Added

- IA agora expone foco sugerido, dono recomendado, janela de resposta, bloqueadores e sinais de contexto por modulo, incluindo billing
- lint automatizado com Biome para frontend, componentes compartilhados e scripts web do monorepo
- testes automatizados de frontend com Vitest e Testing Library cobrindo autenticacao e protecao de rota
- testes automatizados de fluxos autenticados cobrindo contatos, tarefas, relatorios, adversarios, leads e acoes comerciais de billing

### Changed

- `verify:quality` agora inclui lint alem de typecheck e compilacao estrutural
- `verify-all` agora inclui etapa dedicada de testes do frontend antes do build final
### Fixed

### Docs

### Ops

## [0.1.6] - 2026-03-08

### Added

- billing com historico comercial por eventos e leitura de ciclo, proxima referencia e cancelamento agendado
- IA com acao recomendada, motivo e urgencia por modulo no dashboard
- resumo historico de adversarios com watchlist comparativa, eventos recentes e leitura temporal da timeline
- nova direcao visual premium para landing, auth, shell autenticado e componentes compartilhados
- auditoria real de navegador com Playwright, API dedicada e validacao ponta a ponta dos fluxos centrais do frontend

### Changed

- transicoes de billing/trial agora refletem melhor o fluxo comercial local, incluindo pendencia financeira e reativacao operacional
- sumarizacao de IA agora prioriza a proxima acao contextual em vez de apenas listar observacoes gerais
- experiencia do frontend deixou de ser scaffold visual basico e passou a usar linguagem editorial mais forte, distinta e menos generica
- build operacional do frontend agora usa um builder deterministico proprio em vez do encadeamento anterior do workspace
- dashboard autenticado e assinatura passaram a usar composicao executiva mais densa e menos generica, com hierarquia visual mais premium
- contatos, adversarios e relatorios agora seguem a mesma linha premium nas telas autenticadas, com resumo melhor, blocos mais editoriais e leitura mais clara
- equipe e tarefas agora usam leitura operacional mais refinada, com cards, board mais legivel e hierarquia visual alinhada ao restante do produto
- auditoria agora apresenta leitura de governanca mais clara e tambem entra na auditoria real de navegador
- shell autenticado e leads agora usam contexto editorial mais consistente, com topo por rota, melhor narrativa comercial e acabamento visual mais uniforme
- primitives visuais, microinteracoes e ritmo de pagina agora estao mais refinados, com botoes, campos, cards e navegacao mais consistentes

### Fixed

- restauracao de sessao no frontend agora lida com `localStorage` corrompido sem quebrar o carregamento
- captura de lead passou a indicar estado de envio para evitar submissao repetida
- frontend estatico deixou de quebrar no runtime por dependencia fragil de `import.meta.env`
- formularios assincronos do frontend agora preservam a referencia do elemento antes de `await`, evitando falhas apos submit bem-sucedido
- API agora aceita CORS local para os ambientes web de auditoria e desenvolvimento
- listagem de relatorios agora normaliza metricas legadas em vez de falhar com erro 500

### Docs

### Ops

## [0.1.5] - 2026-03-07

### Added

- checagem dedicada de qualidade com `scripts\check-quality.cmd` e alias `npm run verify:quality`
- CRM aprofundado com status de contato, filtros por status/tag/cidade e busca ampliada no historico
- onboarding com progresso visual, proximo passo recomendado e mensagens contextuais
- relatorios com metricas estruturadas, filtro por tipo e exportacao CSV tabular
- dashboard com leitura executiva ampliada e recomendacao operacional imediata
- modulo de adversarios com filtros por busca/tag e timeline filtravel por severidade
- classificacao de adversarios por tipo e nivel de monitoramento, com comparacao simples entre monitorados
- billing com catalogo de planos, leitura de trial restante e sugestao de upgrade
- camada inicial de IA com resumo e recomendacoes derivadas do estado real do workspace
- IA com foco selecionavel por modulo no dashboard (`workspace`, `contatos`, `tarefas`, `adversarios`)
- corte guiado de `Unreleased` para uma versao com `scripts\cut-release-changelog.cmd`
- diagnostico resumido do estado de release com `scripts\release-status.cmd`
- preparo encadeado de release com `scripts\prepare-release.cmd`
- resolucao semantica de versao com `patch`, `minor` e `major`
- status de release agora expone os proximos valores semanticos calculados
- `release-local` agora suporta simulacao por `--dry-run`
- checagem de prontidao de release agora aceita versao-alvo e incremento semantico
- scripts locais de release agora aceitam `X.Y.Z` ou `vX.Y.Z`
- workflow manual de release agora aceita vazio, `X.Y.Z`, `vX.Y.Z`, `patch`, `minor` e `major`
- planejamento local de release sem mutacao por `scripts\plan-release.cmd`
- release efetivo agora falha cedo quando a versao-alvo ainda esta apenas preparavel
- status de release agora informa se os proximos incrementos estao executaveis, preparaveis ou bloqueados
- status e planejamento de release agora mostram colisao potencial de artefatos locais
- status e planejamento de release agora podem ser consumidos em JSON
- diagnostico geral do workspace agora pode ser exportado em JSON
- dry-runs de preparo e release local agora podem ser consumidos em JSON
- checagem de prontidao de release agora tambem pode ser consumida em JSON
- validacao final de artefato de release agora tambem pode ser consumida em JSON
- validacao de consistencia de versao agora tambem pode ser consumida em JSON
- verificacao ponta a ponta agora tambem pode gerar relatorio JSON
- smoke agregado do sistema agora tambem pode ser consumido em JSON
- a CI de verificacao agora publica o relatorio JSON junto do artefato do frontend
- smoke da API agora tambem pode ser consumido em JSON
- smoke do frontend agora tambem pode ser consumido em JSON
- build do frontend agora tambem pode ser consumido em JSON
- smoke agregado do sistema agora incorpora detalhes estruturados dos smokes de API e frontend
- resumo Markdown da verificacao agora pode ser gerado a partir de `verify-report.json`
- alias `npm run verify:summary` agora expone o resumo Markdown da verificacao
- `verify-summary` agora regenera o JSON base antes de escrever o resumo Markdown
- `verify-summary` agora tambem materializa `doctor-report.json`
- `verify-summary` agora tambem materializa `doctor-report.md`
- alias `npm run doctor:summary` agora expone o resumo humano do diagnostico
- relatórios locais de verificacao agora sao tratados como artefatos gerados e limpos por `scripts\clean.cmd`
- o diagnostico agora tambem expone a presenca dos artefatos locais de verificacao
- a CI agora tambem publica `doctor-report.json` para diagnostico do ambiente
- `doctor-report.json` agora tambem e tratado como artefato gerado local
- o resumo Markdown da verificacao agora destaca erro global e etapas com falha
- `clean.cmd` agora pode preservar relatorios locais com `--keep-reports`
- agora tambem existe `doctor-report.md` como resumo humano do diagnostico

### Changed

- o fluxo principal de verificacao agora inclui uma etapa explicita de qualidade antes de testes e smokes
- a experiencia autenticada do frontend ficou mais orientada a uso real em dashboard, onboarding, CRM, relatorios, adversarios e billing
- o modulo de adversarios agora tambem apoia leitura comparativa entre incumbentes, desafiantes e monitoramentos criticos
- o resumo de IA deixou de ser predominantemente estatico e passou a refletir tarefas, contatos, relatorios e monitoramento do workspace
- a camada de IA agora tambem pode resumir contextos especificos por modulo em vez de apenas uma visao geral unica
- validacao e publicacao de release agora incluem notas Markdown derivadas do changelog
- roadmap operacional foi atualizado para refletir o fluxo de release ja consolidado
- o relatorio JSON de verificacao agora incorpora detalhes estruturados de versao, testes do backend, build do frontend, smokes, snapshot de release e diagnostico de ambiente
- a CI agora tambem pode publicar um sumario Markdown derivado do relatorio de verificacao

### Fixed

- `verify-report` e `smoke-all` deixaram de travar ao capturar comandos que sobem subprocessos no Windows atual

### Docs

- README, arquitetura, operacao e checklist de release alinhados com o novo corte de changelog e a etapa de qualidade

### Ops

- prontidao de release consolidada em wrapper reutilizavel para uso local

## [0.1.4] - 2026-03-06

### Added

- verificacao ponta a ponta do monorepo via `scripts\verify-all.cmd`
- smoke test do frontend via `scripts\smoke-web.cmd`
- CI em GitHub Actions para validar o fluxo principal em Windows
- templates de PR e issue, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS` e `dependabot`
- bootstrap unico local via `scripts\setup.cmd`
- diagnostico de ambiente via `scripts\doctor.cmd`
- smoke agregado do sistema via `scripts\smoke-all.cmd`
- fluxo local de pre-PR via `scripts\prepare-pr.cmd`
- limpeza controlada de artefatos locais via `scripts\clean.cmd`
- ajuda rapida de comandos via `scripts\help.cmd`
- aliases `npm` para start e smoke por area
- exibicao e sincronizacao local de versao via `VERSION`, `show-version` e `bump-version`
- guias operacionais e tecnicos em `docs/OPERATIONS.md`, `docs/ARCHITECTURE.md` e `docs/ROADMAP.md`
- indice da documentacao em `docs/README.md`
- checagem automatica de caminhos em documentacao via `scripts/check-doc-paths.ps1`
- rascunho automatico de release e labeler de PR no GitHub Actions
- upload de artefato do frontend na CI
- workflow manual de release com verificacao previa e zip do frontend
- manifesto JSON com checksum para releases locais e na CI
- bootstrap compartilhado da CI via `scripts/ci-bootstrap.cmd`
- verificacao de versao integrada ao fluxo principal de validacao
- geracao de manifesto de release centralizada em script compartilhado
- validacao de changelog por versao antes do release local e na CI

### Changed

- onboarding agora cobre campanha inicial, equipe inicial e primeiro adversario em um fluxo guiado
- frontend passou a usar preview estatico local para validacao operacional
- verificacao local agora inclui checagem estrutural de documentacao
- setup do frontend passou a priorizar `npm ci --ignore-scripts` com fallback para `npm install --ignore-scripts`

### Fixed

- persistencia do backend consolidada em SQLite local com bootstrap reproduzivel
- build do frontend endurecido para o ambiente Windows atual
- testes do backend agora usam SQLite isolado por execucao
- propagacao de erro do `pytest` corrigida em `scripts\test-api.cmd`

### Docs

- README ampliado com scripts operacionais e verificacao completa
- checklist de release adicionada em `docs/RELEASE_CHECKLIST.md`
- documentacao de contribuicao, seguranca e operacao consolidada

### Ops

- scripts de backend e frontend padronizados para setup, smoke e validacao ponta a ponta
- CI, changelog, release e triagem de PR alinhados ao fluxo local


