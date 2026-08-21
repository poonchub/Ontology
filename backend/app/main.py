import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings
from app.services.chat_service import ChatService
from app.services.chat_history_service import ChatHistoryService
from app.services.fuseki_service import FusekiService
from app.services.llm_service import LLMService
from app.services.sparql_validator import SparqlValidator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
settings = get_settings()
app = FastAPI(title="Ontology Knowledge Graph Chat API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.state.chat_service = ChatService(
    llm=LLMService(settings.ollama_url, settings.ollama_model, settings.llm_timeout),
    fuseki=FusekiService(settings.fuseki_query_url, settings.fuseki_timeout),
    validator=SparqlValidator(settings.normalized_namespace),
    namespace=settings.normalized_namespace,
)
app.state.chat_history = ChatHistoryService(settings.chat_database_path)
app.include_router(chat_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}