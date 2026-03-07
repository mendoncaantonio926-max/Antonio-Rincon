from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_healthcheck() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_and_login_flow() -> None:
    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Antonio Teste",
            "email": "antonio.teste@example.com",
            "password": "SenhaForte123",
            "tenant_name": "Workspace Teste",
        },
    )
    assert register_response.status_code == 201
    payload = register_response.json()
    assert payload["tokens"]["access_token"]
    assert payload["user"]["email"] == "antonio.teste@example.com"

    login_response = client.post(
        "/auth/login",
        json={"email": "antonio.teste@example.com", "password": "SenhaForte123"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["tokens"]["refresh_token"]
