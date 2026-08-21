import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, List, Optional

from app.models.chat import ChatResponse


class ChatHistoryService:
    def __init__(self, database_path: str):
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize_database()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def _initialize_database(self) -> None:
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id INTEGER NOT NULL,
                    question TEXT NOT NULL,
                    generated_sparql TEXT NOT NULL,
                    results_json TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    model TEXT NOT NULL,
                    execution_time_ms INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
                    ON messages(conversation_id, id);
                CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
                    ON conversations(updated_at DESC);
                """
            )

    def create_conversation(self, title: str) -> int:
        now = _utc_now()
        with self._connect() as connection:
            cursor = connection.execute(
                "INSERT INTO conversations (title, created_at, updated_at) VALUES (?, ?, ?)",
                (title[:120], now, now),
            )
            return int(cursor.lastrowid)

    def exists(self, conversation_id: int) -> bool:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT 1 FROM conversations WHERE id = ?", (conversation_id,)
            ).fetchone()
        return row is not None

    def save(self, response: ChatResponse, conversation_id: Optional[int] = None) -> int:
        conversation_id = conversation_id or self.create_conversation(response.question)
        if not self.exists(conversation_id):
            raise ValueError("Conversation not found")

        now = _utc_now()
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO messages (
                    conversation_id, question, generated_sparql, results_json,
                    answer, model, execution_time_ms, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    conversation_id,
                    response.question,
                    response.generated_sparql,
                    json.dumps(response.results, ensure_ascii=False),
                    response.answer,
                    response.metadata.model,
                    response.metadata.execution_time_ms,
                    now,
                ),
            )
            connection.execute(
                "UPDATE conversations SET updated_at = ? WHERE id = ?",
                (now, conversation_id),
            )
        return int(cursor.lastrowid)

    def list_conversations(self, limit: int = 50) -> List[dict[str, Any]]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT c.id, c.title, c.created_at, c.updated_at,
                       COUNT(m.id) AS message_count
                FROM conversations AS c
                LEFT JOIN messages AS m ON m.conversation_id = c.id
                GROUP BY c.id
                ORDER BY c.updated_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def list_recent(self, limit: int = 20) -> List[dict[str, Any]]:
        """Return recent messages for callers using the original history API."""
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT id, conversation_id, question, generated_sparql,
                       results_json, answer, model, execution_time_ms, created_at
                FROM messages
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [_message_to_dict(row) for row in rows]

    def get_messages(self, conversation_id: int) -> List[dict[str, Any]]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT id, conversation_id, question, generated_sparql,
                       results_json, answer, model, execution_time_ms, created_at
                FROM messages
                WHERE conversation_id = ?
                ORDER BY id ASC
                """,
                (conversation_id,),
            ).fetchall()
        return [_message_to_dict(row) for row in rows]


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _message_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "conversation_id": row["conversation_id"],
        "question": row["question"],
        "generated_sparql": row["generated_sparql"],
        "results": json.loads(row["results_json"]),
        "answer": row["answer"],
        "model": row["model"],
        "execution_time_ms": row["execution_time_ms"],
        "created_at": row["created_at"],
    }
