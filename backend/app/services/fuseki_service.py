from typing import Any

import httpx

from .llm_service import ExternalServiceError


class FusekiService:
    def __init__(self, endpoint: str, timeout: float):
        self.endpoint = endpoint
        self.timeout = timeout

    async def query(self, sparql: str) -> list[dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.endpoint,
                    data={"query": sparql},
                    headers={"Accept": "application/sparql-results+json"},
                )
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict):
                    raise ValueError("Fuseki response must be a JSON object")
                results = payload.get("results")
                if not isinstance(results, dict):
                    raise ValueError("Fuseki response has no results object")
                bindings = results.get("bindings")
                if not isinstance(bindings, list) or not all(isinstance(item, dict) for item in bindings):
                    raise ValueError("Fuseki response has invalid bindings")
        except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
            raise ExternalServiceError("Fuseki request failed") from exc
        return [{key: _read_binding(value) for key, value in binding.items()} for binding in bindings]


def _read_binding(binding: dict[str, str]) -> str:
    value = binding.get("value", "")
    if binding.get("type") == "uri":
        return value.rsplit("#", 1)[-1].rsplit("/", 1)[-1]
    return value