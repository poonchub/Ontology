from app.services.llm_service import _strip_thinking


def test_strip_thinking_keeps_final_answer():
    text = "Reasoning that should not be shown.\n</think>\n\nBanana, Mango"

    assert _strip_thinking(text) == "Banana, Mango"