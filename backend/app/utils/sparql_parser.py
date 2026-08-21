import re


def clean_sparql(text: str) -> str:
    cleaned = text.strip()
    fenced = re.search(r"```(?:sparql|SPARQL)?\s*(.*?)```", cleaned, re.DOTALL)
    if fenced:
        cleaned = fenced.group(1).strip()
    else:
        select_matches = list(re.finditer(
            r"(?im)^[ \t]*(?:(?:PREFIX|BASE)\b[^\n]*\n[ \t]*)*SELECT\b",
            cleaned,
        ))
        if select_matches:
            cleaned = cleaned[select_matches[-1].start():].strip()
    query_end = cleaned.find("}")
    if query_end >= 0:
        cleaned = cleaned[: query_end + 1].strip()
    return cleaned