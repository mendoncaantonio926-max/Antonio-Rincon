# Security Policy

## Reportando vulnerabilidades

Nao abra vulnerabilidades sensiveis em issue publica.

Use um canal privado do mantenedor do projeto e inclua:

- resumo objetivo do problema
- superficie afetada
- passos de reproducao
- impacto estimado
- mitigacao temporaria, se houver

## Escopo

Esta politica cobre:

- backend em `apps/api`
- frontend em `apps/web`
- scripts operacionais em `scripts`
- workflows em `.github/workflows`

## Boas praticas deste repositorio

- use `scripts\verify-all.cmd` antes de merge
- revise mudancas em autenticacao, roles, billing, onboarding e scripts
- trate segredos apenas por variaveis de ambiente
- nao mantenha credenciais reais no repo

## Estado atual

Este repositorio e um scaffold funcional de MVP. Antes de uso produtivo real, revise pelo menos:

- segredo JWT e gestao de chaves
- postura de banco e backup
- politicas de acesso por tenant
- observabilidade e trilha de auditoria
- adequacao juridica e LGPD

