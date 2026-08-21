import re
from dataclasses import dataclass
from typing import Optional

from rdflib.plugins.sparql.parser import parseQuery


FORBIDDEN_OPERATIONS = ("INSERT", "DELETE", "DROP", "CLEAR", "LOAD", "CREATE", "MOVE", "COPY", "ADD")
ALLOWED_TERMS = {
    "Fruit", "FruitCategory", "Color", "Country", "hasColor", "belongsToCategory",
    "grownIn", "growsFruit", "name", "sweetness", "Mango", "Durian", "Banana", "Apple",
    "Yellow", "Green", "Red", "Tropical", "Temperate", "Thailand", "Japan",
}


@dataclass(frozen=True)
class ValidationResult:
    valid: bool
    reason: Optional[str] = None


class SparqlValidator:
    def __init__(self, namespace: str):
        self.namespace = namespace if namespace.endswith(("#", "/")) else f"{namespace}#"

    def validate(self, query: str) -> ValidationResult:
        if not query or not query.strip():
            return ValidationResult(False, "SPARQL query is empty")
        upper_query = query.upper()
        if not re.match(r"(?is)^\s*(?:PREFIX\s+[^\n]+\s*)*(?:BASE\s+[^\n]+\s*)*SELECT\b", query):
            return ValidationResult(False, "Only SPARQL SELECT queries are allowed")
        if re.search(r"\b(?:%s)\b" % "|".join(FORBIDDEN_OPERATIONS), upper_query):
            return ValidationResult(False, "SPARQL UPDATE operations are not allowed")
        for uri in re.findall(r"<([^>]+)>", query):
            if uri.startswith(self.namespace) and uri != self.namespace and uri[len(self.namespace):] not in ALLOWED_TERMS:
                return ValidationResult(False, "Query references an unknown ontology term")
            if not (uri.startswith(self.namespace) or uri in {
                "http://www.w3.org/2001/XMLSchema#", "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                "http://www.w3.org/2000/01/rdf-schema#",
                "http://www.w3.org/2001/XMLSchema#integer", "http://www.w3.org/2001/XMLSchema#string",
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            }):
                return ValidationResult(False, "Query references a URI outside the configured ontology")
        for prefix, local in re.findall(r"(?<![\w:])([A-Za-z_][\w-]*):([A-Za-z_][\w-]*)", query):
            if prefix not in {"xsd", "rdf", "rdfs"} and local not in ALLOWED_TERMS:
                return ValidationResult(False, f"Unknown ontology term: {local}")
        for local in re.findall(r"(?<![\w:]):([A-Za-z_][\w-]*)", query):
            if local not in ALLOWED_TERMS:
                return ValidationResult(False, f"Unknown ontology term: {local}")
        try:
            parseQuery(query)
        except Exception:
            return ValidationResult(False, "SPARQL query syntax is invalid")
        return ValidationResult(True)