from app.utils.sparql_parser import clean_sparql


def test_clean_sparql_ignores_select_in_explanation():
    raw = """The user asks which fruits are yellow.

    We should select matching fruits.

    SELECT ?fruit
    WHERE { ?fruit :hasColor :Yellow }
    """

    assert clean_sparql(raw) == "SELECT ?fruit\n    WHERE { ?fruit :hasColor :Yellow }"


def test_clean_sparql_keeps_prefix_before_query():
    raw = """Here is the query:
    PREFIX : <http://example.org/fruit-ontology#>
    SELECT ?fruit WHERE { ?fruit :hasColor :Yellow }
    """

    assert clean_sparql(raw).startswith("PREFIX : <http://example.org/fruit-ontology#>\n    SELECT")


def test_clean_sparql_uses_final_query_candidate():
    raw = """SELECT ?fruit WHERE { ?fruit :FruitClass ... }

    The final query is:
    SELECT ?fruit WHERE { ?fruit :hasColor :Yellow }
    """

    assert clean_sparql(raw) == "SELECT ?fruit WHERE { ?fruit :hasColor :Yellow }"