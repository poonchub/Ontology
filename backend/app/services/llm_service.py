import logging

import httpx


logger = logging.getLogger(__name__)


class ExternalServiceError(Exception):
    pass


class LLMService:
    def __init__(self, url: str, model: str, timeout: float):
        self.url = url.rstrip("/")
        self.model = model
        self.timeout = timeout

    async def generate(self, prompt: str) -> str:
        if not self.model:
            raise ExternalServiceError("OLLAMA_MODEL is not configured")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "think": False,
                        "options": {"num_predict": 512, "temperature": 0},
                    },
                )
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, dict):
                    raise ValueError("Ollama response must be a JSON object")
                text = payload.get("response", "")
                if not isinstance(text, str):
                    raise ValueError("Ollama response field must be a string")
                text = _strip_thinking(text)
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.error("Ollama request failed: %s", exc)
            raise ExternalServiceError("Ollama request failed") from exc
        if not text:
            raise ExternalServiceError("Ollama returned an empty response")
        return text


def _strip_thinking(text: str) -> str:
    if "</think>" in text:
        text = text.rsplit("</think>", 1)[1]
    return text.replace("<think>", "").strip()