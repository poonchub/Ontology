import logging
import re
from time import perf_counter
from typing import List, Optional, Tuple

from app.models.chat import ChatMetadata, ChatResponse
from app.prompts.answer_prompt import build_answer_prompt
from app.prompts.sparql_prompt import build_sparql_prompt
from app.services.fuseki_service import FusekiService
from app.services.llm_service import LLMService
from app.services.sparql_validator import SparqlValidator, ValidationResult
from app.utils.sparql_parser import clean_sparql

logger = logging.getLogger(__name__)


class InvalidGeneratedQuery(Exception):
    pass


class ChatService:
    def __init__(self, llm: LLMService, fuseki: FusekiService, validator: SparqlValidator, namespace: str):
        self.llm = llm
        self.fuseki = fuseki
        self.validator = validator
        self.namespace = namespace

    async def answer(self, question: str) -> ChatResponse:
        started = perf_counter()
        logger.info("Chat request received")
        logger.info("LLM SPARQL generation started")
        generated, validation = await self._generate_valid_query(question)
        logger.info("SPARQL validation result: valid=%s", validation.valid)
        if not validation.valid:
            raise InvalidGeneratedQuery(validation.reason or "Generated SPARQL is invalid")
        logger.info("Fuseki query started")
        results = await self.fuseki.query(generated)
        logger.info("Fuseki query completed: results=%d", len(results))
        logger.info("Answer generation started")
        answer = _compact_answer(
            await self.llm.generate(build_answer_prompt(question, generated, results)),
            question,
            results,
        )
        elapsed = int((perf_counter() - started) * 1000)
        logger.info("Chat request completed: execution_time_ms=%d", elapsed)
        return ChatResponse(
            question=question,
            generated_sparql=generated,
            results=results,
            answer=answer,
            metadata=ChatMetadata(model=self.llm.model, execution_time_ms=elapsed),
        )

    async def _generate_valid_query(self, question: str) -> Tuple[str, ValidationResult]:
        prompt = build_sparql_prompt(question, self.namespace)
        generated, validation = await self._validate_generated_query(prompt)
        if validation.valid:
            return generated, validation

        correction_prompt = f"""The previous SPARQL query was invalid: {validation.reason}.
Return one corrected, read-only SELECT query only. Use the ontology schema and namespace from
the original instructions. Do not include reasoning, Markdown, or any text outside the query.

Original instructions:
{prompt}
"""
        try:
            return await self._validate_generated_query(correction_prompt)
        except RuntimeError:
            return generated, validation

    async def _validate_generated_query(self, prompt: str) -> Tuple[str, ValidationResult]:
        generated = self._normalize_query(await self.llm.generate(prompt))
        return generated, self.validator.validate(generated)

    def _normalize_query(self, response: str) -> str:
        query = clean_sparql(response)
        if ":" in query and not query.lstrip().upper().startswith(("PREFIX", "BASE")):
            query = f"PREFIX : <{self.namespace}>\n{query}"
        return query


def _compact_answer(answer: str, question: str = "", results: Optional[list[dict]] = None) -> str:
    answer = answer.strip()
    if "</think>" in answer:
        answer = answer.rsplit("</think>", 1)[1].strip()
    answer = answer.replace("<think>", "").strip()
    for marker in ("Answer:", "Final answer:", "The answer is:"):
        if marker.lower() in answer.lower():
            answer = answer[answer.lower().rfind(marker.lower()) + len(marker):].strip()
            break
    answer = re.sub(r"^(?:Option\s*\d+\s*:\s*)", "", answer, flags=re.IGNORECASE)
    lines = [line.strip() for line in answer.splitlines() if line.strip()]
    candidates = [line for line in lines if not _is_reasoning(line)]
    answer = candidates[-1] if candidates else ""
    if answer:
        return " ".join(answer.split()[:20]).strip()
    return _answer_from_result(question, results or [])


def _is_reasoning(line: str) -> bool:
    return bool(re.match(
        r"(?i)^(?:okay|however|but wait|we are|the user|i need|let's|based on|the answer|so we|we follow|knowledge graph result|for a single value|the problem says)",
        line,
    )) or "follow the example" in line.lower()


def _answer_from_result(question: str, results: List[dict]) -> str:
    if not results:
        return "No matching information was found in the Knowledge Graph."
    first = results[0]
    if len(first) == 1:
        key, value = next(iter(first.items()))
        subject = re.search(r"(?:of|for)\s+([A-Za-z][A-Za-z -]*)", question, re.IGNORECASE)
        if subject:
            return f"The {key} of {subject.group(1).strip().rstrip('?')} is {value}."
        return f"The {key} is {value}."
    values = ", ".join(str(value) for result in results for value in result.values())
    return f"The Knowledge Graph found: {values}."