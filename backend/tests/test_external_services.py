import asyncio

import pytest

from app.services.fuseki_service import FusekiService
from app.services.llm_service import ExternalServiceError, LLMService


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class FakeClient:
    response = None

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def post(self, *args, **kwargs):
        return self.response


def test_llm_rejects_non_object_response(monkeypatch):
    FakeClient.response = FakeResponse(["not", "an", "object"])
    monkeypatch.setattr("app.services.llm_service.httpx.AsyncClient", FakeClient)

    with pytest.raises(ExternalServiceError, match="Ollama request failed"):
        asyncio.run(LLMService("http://ollama", "test-model", 1).generate("prompt"))


def test_fuseki_rejects_invalid_bindings(monkeypatch):
    FakeClient.response = FakeResponse({"results": {"bindings": {}}})
    monkeypatch.setattr("app.services.fuseki_service.httpx.AsyncClient", FakeClient)

    with pytest.raises(ExternalServiceError, match="Fuseki request failed"):
        asyncio.run(FusekiService("http://fuseki/query", 1).query("SELECT * WHERE {}"))
