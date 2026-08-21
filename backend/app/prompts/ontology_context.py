ONTOLOGY_CONTEXT = """Classes:
- Fruit
- FruitCategory
- Color
- Country

Object properties:
- hasColor: Fruit -> Color
- belongsToCategory: Fruit -> FruitCategory
- grownIn: Fruit -> Country
- growsFruit: Country -> Fruit (inverse of grownIn)

Data properties:
- name: Fruit -> xsd:string
- sweetness: Fruit -> xsd:integer

Individuals:
- Mango, Durian, Banana, Apple
- Yellow, Green, Red
- Tropical, Temperate
- Thailand, Japan
"""