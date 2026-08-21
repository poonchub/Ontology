from app.models.chat import ChatMetadata, ChatResponse
from app.services.chat_history_service import ChatHistoryService


def make_response(question: str) -> ChatResponse:
    return ChatResponse(
        question=question,
        generated_sparql="SELECT ?fruit WHERE { ?fruit ?p ?o }",
        results=[{"fruit": "Mango"}],
        answer="Mango.",
        metadata=ChatMetadata(model="test-model", execution_time_ms=12),
    )


def test_chat_history_saves_and_reads_recent_items(tmp_path):
    history = ChatHistoryService(str(tmp_path / "chat.db"))

    history.save(make_response("Which fruit is yellow?"))
    history.save(make_response("Which fruit is sweet?"))

    items = history.list_recent(limit=1)

    assert len(items) == 1
    assert items[0]["question"] == "Which fruit is sweet?"
    assert items[0]["results"] == [{"fruit": "Mango"}]
    assert items[0]["model"] == "test-model"


def test_chat_history_groups_messages_by_conversation(tmp_path):
    history = ChatHistoryService(str(tmp_path / "chat.db"))

    first_conversation_id = history.save(make_response("First question"))
    history.save(make_response("Follow-up question"), first_conversation_id)
    history.save(make_response("Separate question"))

    conversations = history.list_conversations()
    messages = history.get_messages(first_conversation_id)

    assert len(conversations) == 2
    assert first_conversation_id == messages[0]["conversation_id"]
    assert [item["question"] for item in messages] == ["First question", "Follow-up question"]
