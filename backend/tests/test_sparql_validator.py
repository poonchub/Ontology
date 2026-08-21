from app.services.sparql_validator import SparqlValidator


validator = SparqlValidator("http://example.org/fruit-ontology#")


def test_select_is_accepted():
    result = validator.validate("PREFIX : <http://example.org/fruit-ontology#> SELECT ?fruit WHERE { ?fruit :hasColor :Yellow }")
    assert result.valid


def test_update_operations_are_rejected():
    for operation in ("INSERT", "DELETE", "DROP", "CLEAR", "LOAD"):
        result = validator.validate(f"{operation} DATA {{ <http://example.org/fruit-ontology#Mango> <http://example.org/fruit-ontology#hasColor> <http://example.org/fruit-ontology#Yellow> }}")
        assert not result.valid


def test_unknown_ontology_term_is_rejected():
    result = validator.validate("PREFIX : <http://example.org/fruit-ontology#> SELECT ?fruit WHERE { ?fruit :inventedProperty :Mango }")
    assert not result.valid