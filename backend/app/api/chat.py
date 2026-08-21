import logging

from fastapi import APIRouter, HTTPException, Request, status

from app.models.chat import ChatRequest, ChatResponse, ConversationMessage, ConversationSummary
from app.services.chat_service import InvalidGeneratedQuery
from app.services.llm_service import ExternalServiceError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    question = payload.message.strip()
    if not question:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="message must not be empty")
    try:
        response = await request.app.state.chat_service.answer(question)
        conversation_id = request.app.state.chat_history.save(response, payload.conversation_id)
        response = response.model_copy(update={"conversation_id": conversation_id})
        return response
    except InvalidGeneratedQuery as exc:
        logger.warning("Generated SPARQL rejected: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The LLM generated an invalid SPARQL query") from exc
    except ExternalServiceError as exc:
        logger.error("External service failure: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected chat failure")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected internal server error") from exc


@router.get("/chats", response_model=list[ConversationSummary])
async def recent_chats(request: Request, limit: int = 50) -> list[ConversationSummary]:
    if not 1 <= limit <= 100:
        raise HTTPException(status_code=422, detail="limit must be between 1 and 100")
    return request.app.state.chat_history.list_conversations(limit)


@router.get("/chats/{conversation_id}", response_model=list[ConversationMessage])
async def conversation_messages(request: Request, conversation_id: int) -> list[ConversationMessage]:
    history = request.app.state.chat_history
    if not history.exists(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return history.get_messages(conversation_id)