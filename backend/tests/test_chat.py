import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.chat import ChatMetadata, ChatResponse
from app.services.chat_service import ChatService, InvalidGeneratedQuery


class FakeChatService:
    async def answer(self, question: str) -> ChatResponse:
        return ChatResponse(
            question=question,
            generated_sparql="SELECT ?fruit WHERE { ?fruit ?property ?value }",
            results=[{"fruit": "Mango"}],
            answer="Mango.",
            metadata=ChatMetadata(model="test-model", execution_time_ms=1),
        )


@pytest.fixture
def client():
    original = app.state.chat_service
    app.state.chat_service = FakeChatService()
    yield TestClient(app)
    app.state.chat_service = original


def test_chat_success(client):
    response = client.post("/api/chat", json={"message": "Which fruit is yellow?"})
    assert response.status_code == 200
    assert response.json()["answer"] == "Mango."


def test_empty_message_is_rejected(client):
    response = client.post("/api/chat", json={"message": "   "})
    assert response.status_code == 422


def test_malformed_body_is_rejected(client):
    response = client.post("/api/chat", json={"message": 42})
    assert response.status_code == 422


def test_invalid_generated_query_is_mapped_to_502(client):
    class InvalidService:
        async def answer(self, question):
            raise InvalidGeneratedQuery("bad query")

    app.state.chat_service = InvalidService()
    response = client.post("/api/chat", json={"message": "Delete everything"})
    assert response.status_code == 502