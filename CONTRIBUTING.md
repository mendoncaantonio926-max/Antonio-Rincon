# Contribuindo

## Fluxo esperado

1. Trabalhe em branch propria.
2. Mantenha a mudanca pequena e coesa.
3. Rode a verificacao completa antes de abrir PR.
4. Descreva impacto funcional, risco e validacao executada.

## Verificacao obrigatoria

No Windows:

```bat
scripts\verify-all.cmd
```

Para validar a branch antes de abrir PR:

```bat
scripts\prepare-pr.cmd
```

Ou via `npm`:

```bash
npm run verify
```

## Criterios de aceite

- backend sem regressao nos testes
- smoke da API passando
- frontend compilando
- smoke do frontend passando
- README e docs atualizados quando o fluxo do produto ou de operacao mudar

## Quando atualizar documentacao

Atualize a documentacao se houver mudanca em qualquer um destes pontos:

- comandos de setup, build, teste ou smoke
- comportamento de onboarding, billing, CRM ou relatorios
- novos scripts operacionais
- mudancas de ambiente no Windows

Atualize `CHANGELOG.md` quando a mudanca alterar comportamento, operacao, setup, CI ou experiencia de uso.

## Checklist do autor

- a mudanca ficou limitada ao problema real
- nao introduzi dependencia local oculta
- validei os scripts reais do repo, nao apenas comandos ad hoc
- revisei impacto em backend, frontend e docs quando aplicavel
- atualizei `CHANGELOG.md` quando houve impacto em codigo, scripts ou workflow
- validei referencias de caminhos em docs quando alterei README ou documentacao estrutural
- rodei `scripts\prepare-pr.cmd` antes de abrir PR quando a mudanca afetou entrega real
