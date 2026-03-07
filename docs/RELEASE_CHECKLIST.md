# Release Checklist

## Antes da release

- confirmar escopo e mudancas de produto
- revisar riscos conhecidos e workarounds temporarios
- validar scripts alterados no Windows
- revisar docs e README

## Validacao tecnica

- executar `scripts\verify-all.cmd`
- confirmar que a CI do GitHub Actions esta verde
- revisar artefato do frontend em `apps/web/dist`
- confirmar smoke da API em `/health`
- opcionalmente simular artefatos e colisoes com `scripts\release-local.cmd --dry-run`
- opcionalmente gerar zip local com `scripts\release-local.cmd vX.Y.Z`
- opcionalmente gerar zip local com `npm run release:local -- vX.Y.Z`
- os scripts locais de release e verificacao tambem aceitam `X.Y.Z` sem o prefixo `v`
- registrar checksum, manifesto e notas de release gerados em `release/`
- validar zip e manifesto com `scripts\verify-release.cmd vX.Y.Z`

## Entrega

- usar versao no formato `vX.Y.Z`
- evitar reutilizar versao cujo zip local ou tag ja existam
- manter `VERSION`, os `package.json` do monorepo, o `package-lock.json` e `apps/api/pyproject.toml` sincronizados com a versao da release
- opcionalmente atualizar tudo com `scripts\bump-version.cmd X.Y.Z` ou `npm run version:bump -- X.Y.Z`
- se fizer sentido, usar incremento semantico direto com `patch`, `minor` ou `major`
- garantir que `CHANGELOG.md` tenha uma secao para a versao alvo
- se necessario, cortar `Unreleased` para a versao com `scripts\cut-release-changelog.cmd vX.Y.Z`
- opcionalmente preparar tudo em sequencia com `scripts\prepare-release.cmd X.Y.Z`
- registrar resumo da release
- listar mudancas que exigem acao manual do operador
- listar limitacoes remanescentes
- apontar rollback ou mitigacao, quando houver

Se `VERSION` ja estiver correta, `scripts\release-local.cmd` ou `npm run release:local` podem ser executados sem argumento.
O workflow manual do GitHub tambem pode usar `VERSION` se o campo `version` for deixado em branco, mas a publicacao so executa quando o branch ja estiver preparado para a versao alvo.
Use `npm run verify:version` para confirmar esse alinhamento antes da tag.
