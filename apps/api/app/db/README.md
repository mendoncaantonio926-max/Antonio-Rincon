# Persistencia SQL

Esta pasta prepara a migracao do scaffold em memoria para banco real com SQLAlchemy.

## Conteudo

- `base.py`: classe base declarativa
- `session.py`: engine e session factory
- `models.py`: modelos relacionais principais
- `bootstrap.py`: criacao rapida de tabelas para ambiente local

## Observacao

O fluxo atual da aplicacao ainda usa store em memoria/arquivo JSON.
Esta camada existe para a proxima etapa de migracao gradual para PostgreSQL real.
