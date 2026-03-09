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

- assinatura agora expone ocupacao real de assentos, pressao de capacidade, risco de renovacao, movimento comercial e ciclo recomendado
- leads agora podem ser convertidos diretamente em contatos no CRM, com persistencia da conversao, reutilizacao inteligente por email e auditoria da acao
- dashboard agora expone fila de leads total, convertida e pendente para dar visibilidade executiva da demanda comercial
- leads agora suportam estagio, responsavel e data de follow-up, com filtros de funil e atualizacao inline no painel autenticado
- dashboard agora expone leads quentes, follow-ups atrasados e follow-ups vencendo hoje para leitura comercial imediata
- leads agora calculam risco comercial, janela de follow-up e dono sugerido automaticamente para priorizar a fila
- dashboard agora expone a fila comercial priorizada com lead mais urgente, owner sugerido, janela de resposta e tamanho da fila critica
- dashboard agora expone agrupamentos da fila comercial por owner e janela, com acao rapida para atribuir owner e puxar follow-up para hoje
- dashboard agora expone alertas por owner e uma fila diaria de execucao comercial para orientar cadencia operacional
- dashboard agora expone produtividade por owner e por janela para ler conversao, fila pendente e atraso no mesmo quadro comercial
- dashboard agora expone primeira agenda do dia e resumo diario por owner para transformar a fila comercial em ritual de execucao
- dashboard agora expone meta de conversao por owner e comparativo de throughput entre a janela atual e a anterior no mesmo quadro comercial
- dashboard agora expone variacao de throughput por owner para comparar quem acelerou ou caiu entre a janela atual e a anterior
- dashboard agora expone saude comercial por owner e fila de recuperacao para atacar atraso, gap de meta e risco de conversao
- IA contextual agora incorpora saude comercial por owner e fila de recuperacao na recomendacao executiva do dashboard
- dashboard agora expone pressao por janela e redistribuicao sugerida para rebalancear a fila comercial entre owners
- dashboard agora expone capacidade por owner e alocacao sugerida para orientar para onde a fila deve ir primeiro
- dashboard agora expone plano diario por owner e plano por janela para fechar a execucao comercial do dia
- dashboard agora expone previsao por estagio e fechamento projetado para antecipar resultado comercial da semana
- dashboard agora expone mix do pipeline por owner e confianca do forecast para explicar o que sustenta a previsao comercial
- dashboard agora expone risco de meta semanal e cenarios de fechamento para antecipar o desvio de resultado comercial
- dashboard agora expone alavancas e bloqueios do forecast para explicar o que acelera ou trava o fechamento da semana
- dashboard agora expone movimentos por cenario para transformar forecast em plano de execucao comercial
- dashboard agora permite aplicar cenarios do forecast diretamente na fila comercial prioritaria, com owner e janela definidos
- dashboard agora permite executar a recomendacao da IA diretamente na fila comercial prioritaria
- exportacao de relatorios no scaffold local agora recompõe a cota padrao do plano para contas ativas ou trial durante validacoes repetidas

### Changed

- billing agora permite alternar ciclo mensal/anual em modo local e usa esses sinais para orientar retencao e expansao
- IA contextual agora incorpora leads pendentes na recomendacao executiva e o browser audit valida a conversao ponta a ponta entre landing, leads e contatos
- browser audit agora valida tambem atualizacao de funil e filtro por estagio na area de leads
- IA contextual agora prioriza SLA comercial rompido quando follow-ups ficam atrasados, e os cards de lead destacam urgencia comercial por estagio e prazo
- a area de leads agora agrupa a fila por janela operacional, destaca escore de risco e permite atribuir a sugestao de owner sem sair do painel
- IA contextual e dashboard agora usam o lead prioritario da fila para orientar dono sugerido e janela de resposta comercial
- browser audit agora valida tambem a acao rapida comercial do dashboard antes de seguir para os fluxos do app
- browser audit agora valida tambem meta por owner e throughput comercial no dashboard executivo
- browser audit agora valida tambem a variacao de throughput por owner no dashboard executivo
- browser audit agora valida tambem saude por owner e fila de recuperacao no dashboard executivo
- browser audit agora valida tambem pressao por janela e redistribuicao sugerida no dashboard executivo
- browser audit agora valida tambem capacidade por owner e alocacao sugerida no dashboard executivo
- browser audit agora valida tambem o plano diario por owner e o plano por janela no dashboard executivo
- browser audit agora valida tambem previsao por estagio e fechamento projetado no dashboard executivo
- browser audit agora valida tambem mix por owner e confianca do forecast no dashboard executivo
- browser audit agora valida tambem risco de meta e cenarios de fechamento no dashboard executivo
- browser audit agora valida tambem alavancas e bloqueios do forecast no dashboard executivo
- IA contextual agora incorpora o playbook do forecast na leitura executiva do dashboard
- browser audit agora valida tambem movimentos por cenario no dashboard executivo
- browser audit agora valida tambem a aplicacao direta de cenarios do forecast no dashboard executivo
- browser audit agora valida tambem a execucao da recomendacao da IA no dashboard executivo
### Fixed

### Docs

### Ops

## [0.1.8] - 2026-03-08

### Added

- billing agora expone estagio de cobranca, proxima acao comercial, periodo de graca, ultima tentativa de pagamento e contagem de falhas para refletir um fluxo de cobranca mais real
- a tela de assinatura ganhou leitura comercial mais profunda com sinais de cobranca, janela de graca e controles locais para tentativa de cobranca e encerramento da conta
- adversarios agora expone leitura temporal entre janelas, spotlight competitivo e delta de momentum por monitorado
- IA contextual agora expone escore de prioridade e gatilho principal, reagindo tambem ao spotlight temporal de adversarios

### Changed

- transicoes de billing passaram a atravessar com mais fidelidade os estados locais de trial, cobranca, graca, retencao, reativacao e churn
- a watchlist comparativa passou a ordenar pressao competitiva com base em eventos criticos, variacao recente e historico da janela anterior
- o dashboard passou a mostrar leitura mais executiva da IA, com prioridade numerica e o sinal concreto que disparou a recomendacao

### Fixed

### Docs

### Ops

## [0.1.7] - 2026-03-08

### Added

- IA agora expone foco sugerido, dono recomendado, janela de resposta, bloqueadores e sinais de contexto por modulo, incluindo billing
- lint automatizado com Biome para frontend, componentes compartilhados e scripts web do monorepo
- lint automatizado do backend com Ruff, integrado ao `verify:quality`, agora com baseline `E` e `F` e excecao temporaria para `E501`
- testes automatizados de frontend com Vitest e Testing Library cobrindo autenticacao e protecao de rota
- testes automatizados de fluxos autenticados cobrindo dashboard, onboarding, equipe, contatos, tarefas, relatorios, adversarios, leads, auditoria e acoes comerciais de billing, incluindo filtros, estados vazios e tratamento de erro
- alias `npm run browser:audit` e flag `--with-browser-audit` no fluxo de `release-local`

### Changed

- `verify:quality` agora inclui lint alem de typecheck e compilacao estrutural
- `verify-all` agora inclui etapa dedicada de testes do frontend antes do build final
- auditoria real de navegador agora valida tambem filtros de contatos, filtro de timeline por severidade e filtro de relatorios por tipo
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

- browser audit real agora valida tambem a alternancia de ciclo anual na tela de billing
- browser audit real agora valida tambem o spotlight temporal da tela de adversarios
- browser audit real agora valida tambem a leitura priorizada da IA no dashboard
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




