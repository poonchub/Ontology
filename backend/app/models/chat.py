from typing import Any, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: Optional[int] = Field(default=None, gt=0)


class ChatMetadata(BaseModel):
    model: str
    execution_time_ms: int


class ChatResponse(BaseModel):
    conversation_id: Optional[int] = None
    question: str
    generated_sparql: str
    results: list[dict[str, Any]]
    answer: str
    metadata: ChatMetadata


class ChatHistoryItem(BaseModel):
    id: int
    question: str
    generated_sparql: str
    results: list[dict[str, Any]]
    answer: str
    model: str
    execution_time_ms: int
    created_at: str


class ConversationSummary(BaseModel):
    id: int
    title: str
    created_at: str
    updated_at: str
    message_count: int


class ConversationMessage(BaseModel):
    id: int
    conversation_id: int
    question: str
    generated_sparql: str
    results: list[dict[str, Any]]
    answer: str
    model: str
    execution_time_ms: int
    created_at: str