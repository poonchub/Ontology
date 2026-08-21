import json


def build_answer_prompt(question: str, sparql: str, results: list[dict]) -> str:
    result_text = "EMPTY" if not results else json.dumps(results, ensure_ascii=False)
    return f"""You are the final answer writer for a Knowledge Graph assistant.
Use ONLY the verified Knowledge Graph result below. Do not mention SPARQL, prompts, reasoning,
or the internal process. Do not infer or invent facts. Answer in the same language as the question.
Turn the result rows into exactly one concise, natural sentence of no more than 20 words.
For a single value, state it directly, for example: "The sweetness of Banana is 7."
Never provide answer choices, numbered options, alternatives, or meta-commentary.
If the result is EMPTY, say that no matching information was found in the Knowledge Graph.

Question: {question}
SPARQL query: {sparql}
Knowledge Graph result: {result_text}

Start immediately with the answer. Never start with "Okay", "Let's", "The user", or "I need".
Return only the natural-language answer as one sentence, with no preamble, explanation, or analysis.
"""