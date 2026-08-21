# Competency Questions

เอกสารนี้กำหนดคำถามที่ Fruit Knowledge Graph ต้องสามารถตอบได้ ใช้เป็น requirement สำหรับออกแบบ ontology, ตรวจข้อมูลใน Fuseki และทดสอบระบบถามตอบ

## ขอบเขตข้อมูล

Knowledge Graph รองรับข้อมูลหลัก 4 กลุ่ม:

- ผลไม้ (`Fruit`)
- สี (`Color`)
- ประเภทผลไม้ (`FruitCategory`)
- ประเทศที่ปลูก (`Country`)

Properties ที่ใช้ตอบคำถาม:

- `hasColor`: Fruit -> Color
- `belongsToCategory`: Fruit -> FruitCategory
- `grownIn`: Fruit -> Country
- `name`: Fruit -> string
- `sweetness`: Fruit -> integer

Namespace ที่ใช้ใน SPARQL:

```sparql
PREFIX : <http://example.org/fruit-ontology#>
```

## Dataset ปัจจุบัน

| Fruit | Color | Category | Country | Sweetness |
| --- | --- | --- | --- | ---: |
| Mango | Yellow | Tropical | Thailand | 8 |
| Durian | Green | Tropical | Thailand | 9 |
| Banana | Yellow | Tropical | Thailand | 7 |
| Apple | Red | Temperate | Japan | 6 |

## Competency Questions

### CQ1: มะม่วงมีสีอะไร?

**English:** What color is Mango?

**Expected answer:** `Yellow`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?color
WHERE {
  :Mango :hasColor ?color .
}
```

### CQ2: มะม่วงเป็นผลไม้ประเภทอะไร?

**English:** What category does Mango belong to?

**Expected answer:** `Tropical`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?category
WHERE {
  :Mango :belongsToCategory ?category .
}
```

### CQ3: มะม่วงปลูกในประเทศอะไร?

**English:** Where is Mango grown?

**Expected answer:** `Thailand`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?country
WHERE {
  :Mango :grownIn ?country .
}
```

### CQ4: ผลไม้อะไรมีสีเหลือง?

**English:** Which fruits are yellow?

**Expected answer:** `Mango`, `Banana`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruitName
WHERE {
  ?fruit :hasColor :Yellow .
  ?fruit :name ?fruitName .
}
```

### CQ5: ผลไม้อะไรอยู่ในประเภท Tropical?

**English:** Which fruits are Tropical?

**Expected answer:** `Mango`, `Durian`, `Banana`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruitName
WHERE {
  ?fruit :belongsToCategory :Tropical .
  ?fruit :name ?fruitName .
}
```

### CQ6: ประเทศไทยปลูกผลไม้อะไรบ้าง?

**English:** Which fruits are grown in Thailand?

**Expected answer:** `Mango`, `Durian`, `Banana`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruitName
WHERE {
  ?fruit :grownIn :Thailand .
  ?fruit :name ?fruitName .
}
```

### CQ7: ผลไม้อะไรมีความหวานระดับ 7 ขึ้นไป?

**English:** Which fruits have a sweetness of 7 or higher?

**Expected answer:** `Mango (8)`, `Durian (9)`, `Banana (7)`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruitName ?sweetness
WHERE {
  ?fruit :name ?fruitName .
  ?fruit :sweetness ?sweetness .
  FILTER(?sweetness >= 7)
}
```

### CQ8: ผลไม้อะไรปลูกในประเทศไทยและมีสีเหลือง?

**English:** Which fruits are grown in Thailand and are yellow?

**Expected answer:** `Mango`, `Banana`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruitName
WHERE {
  ?fruit :grownIn :Thailand .
  ?fruit :hasColor :Yellow .
  ?fruit :name ?fruitName .
}
```

## การตรวจสอบด้วย Fuseki

รัน Fuseki จากโฟลเดอร์ `fruit-kg` ก่อน:

```bash
cd fruit-kg
docker compose up -d
```

จากนั้นเรียก query ตัวอย่าง:

```bash
curl http://localhost:3030/fruit/query \
  -H 'Accept: application/sparql-results+json' \
  --data-urlencode 'query=PREFIX : <http://example.org/fruit-ontology#> SELECT ?fruitName WHERE { ?fruit :hasColor :Yellow . ?fruit :name ?fruitName }'
```

## การทดสอบผ่าน Chat API

เริ่ม backend:

```bash
cd backend
python3 run.py
```

ส่งคำถาม:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Which fruits are yellow?"}'
```

ตรวจสอบ field สำคัญใน response:

- `generated_sparql` ต้องเป็น query แบบ `SELECT`
- `results` ต้องมาจาก Fuseki
- `answer` ต้องสรุปจาก `results`
- `metadata.model` ต้องตรงกับ `OLLAMA_MODEL`

## Acceptance Checklist

- [ ] CQ1 ตอบสีของ Mango ได้
- [ ] CQ2 ตอบประเภทของ Mango ได้
- [ ] CQ3 ตอบประเทศที่ปลูก Mango ได้
- [ ] CQ4 คืน Mango และ Banana
- [ ] CQ5 คืน Mango, Durian และ Banana
- [ ] CQ6 คืน Mango, Durian และ Banana
- [ ] CQ7 คืนผลไม้ที่ sweetness ตั้งแต่ 7 ขึ้นไป
- [ ] CQ8 คืน Mango และ Banana
- [ ] ทุก query เป็น read-only `SELECT`
- [ ] ผลลัพธ์มาจาก Fuseki ไม่ใช่ข้อมูล hardcode ใน frontend
