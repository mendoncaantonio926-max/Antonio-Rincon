# Pulso Politico API

API inicial em FastAPI para o MVP do Pulso Politico.

## Rodar localmente

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```

No Windows, o atalho mais confiavel e:

```bat
..\..\scripts\run-api.cmd
```

Para desenvolvimento com hot reload explicito:

```bat
..\..\scripts\run-api.cmd --reload
```

Se o `python` local estiver preso no alias da Microsoft Store, defina:

```bat
set PULSO_BOOTSTRAP_PYTHON=C:\caminho\para\python.exe
```

## Rodar testes

```bash
pip install -e .[dev]
pytest
```

Ou:

```bat
..\..\scripts\test-api.cmd
```

## Smoke test

```bat
..\..\scripts\smoke-api.cmd
```

## Persistencia local

Por padrao o backend usa SQLite em `apps/api/.localdata/pulso-politico.db`.
Os testes resetam esse arquivo automaticamente para manter execucoes repetiveis.
