````markdown
# Fruit Ontology & Knowledge Graph

โปรเจกต์ตัวอย่างสำหรับศึกษาและพัฒนาระบบ **Ontology + Knowledge Graph + SPARQL** โดยใช้ Domain เรื่อง **ผลไม้ (Fruit)**

โปรเจกต์นี้ใช้ [Protégé](https://protege.stanford.edu/) สำหรับออกแบบ Ontology และใช้ **Apache Jena Fuseki** สำหรับจัดเก็บและ Query ข้อมูลในรูปแบบ RDF/Knowledge Graph

---

## 1. Project Overview

ระบบนี้มีเป้าหมายเพื่อสร้าง Knowledge Graph ที่สามารถตอบคำถามเกี่ยวกับผลไม้ เช่น

- มะม่วงมีสีอะไร?
- มะม่วงเป็นผลไม้ประเภทอะไร?
- มะม่วงปลูกในประเทศอะไร?
- ผลไม้อะไรมีสีเหลือง?
- ผลไม้อะไรเป็นผลไม้เขตร้อน?
- ประเทศไทยปลูกผลไม้อะไร?
- ผลไม้อะไรมีความหวานระดับสูง?
- ผลไม้อะไรปลูกในประเทศไทยและมีสีเหลือง?

สถาปัตยกรรมโดยรวม:

```text
Competency Questions
        │
        ▼
    Ontology
        │
        │ Protégé
        ▼
  OWL / RDF File
        │
        ▼
Apache Jena Fuseki
        │
        ▼
 Knowledge Graph
        │
        ▼
     SPARQL
````

---

# 2. Technologies

| Technology         | Purpose                                  |
| ------------------ | ---------------------------------------- |
| Protégé            | ออกแบบและสร้าง Ontology                  |
| OWL                | ใช้แทนโครงสร้างและ Semantic ของ Ontology |
| RDF                | Representation ของข้อมูลในรูปแบบ Triple  |
| Apache Jena Fuseki | RDF Triple Store และ SPARQL Server       |
| SPARQL             | Query ข้อมูลจาก Knowledge Graph          |
| Docker             | ใช้สำหรับรัน Apache Jena Fuseki          |

---

# 3. Domain

## Fruit Knowledge

Scope ของ Ontology นี้ประกอบด้วยข้อมูลเกี่ยวกับ:

* ผลไม้
* สีของผลไม้
* ประเภทของผลไม้
* ประเทศที่ปลูกผลไม้
* ระดับความหวานของผลไม้

เพื่อให้โปรเจกต์มีขนาดเล็กและเข้าใจง่าย เราจะไม่ครอบคลุมข้อมูลอื่น เช่น:

* ราคา
* สารอาหาร
* ฤดูกาล
* ตลาด
* ผู้ขาย
* โรคของพืช

---

# 4. Competency Questions

Competency Questions (CQ) คือคำถามที่ระบบ Knowledge Graph ควรสามารถตอบได้

โปรเจกต์นี้กำหนดไว้ 8 ข้อ:

| ID  | Competency Question                    |
| --- | -------------------------------------- |
| CQ1 | มะม่วงมีสีอะไร?                        |
| CQ2 | มะม่วงเป็นผลไม้ประเภทอะไร?             |
| CQ3 | มะม่วงปลูกในประเทศอะไร?                |
| CQ4 | ผลไม้อะไรมีสีเหลือง?                   |
| CQ5 | ผลไม้อะไรอยู่ในประเภท Tropical?        |
| CQ6 | ประเทศไทยปลูกผลไม้อะไรบ้าง?            |
| CQ7 | ผลไม้อะไรมีความหวานระดับ 7 ขึ้นไป?     |
| CQ8 | ผลไม้อะไรปลูกในประเทศไทยและมีสีเหลือง? |

Competency Questions จะถูกนำมาใช้เป็น Requirement สำหรับออกแบบ Ontology และใช้ทดสอบ Knowledge Graph ในภายหลัง

---

# 5. Ontology Design

## 5.1 Classes

Ontology ประกอบด้วย 4 Classes หลัก:

```text
owl:Thing
├── Fruit
├── FruitCategory
├── Color
└── Country
```

### Fruit

แทนผลไม้แต่ละชนิด เช่น:

```text
Mango
Durian
Banana
Apple
```

### FruitCategory

แทนประเภทของผลไม้ เช่น:

```text
Tropical
Temperate
```

### Color

แทนสีของผลไม้ เช่น:

```text
Yellow
Green
Red
```

### Country

แทนประเทศที่ปลูกผลไม้ เช่น:

```text
Thailand
Japan
```

---

# 6. Object Properties

Ontology มี Object Properties ดังนี้:

```text
hasColor
belongsToCategory
grownIn
growsFruit
```

## 6.1 hasColor

ใช้ระบุสีของผลไม้

```text
Fruit → Color
```

Domain:

```text
Fruit
```

Range:

```text
Color
```

ตัวอย่าง:

```text
Mango ── hasColor ──> Yellow
```

---

## 6.2 belongsToCategory

ใช้ระบุประเภทของผลไม้

```text
Fruit → FruitCategory
```

Domain:

```text
Fruit
```

Range:

```text
FruitCategory
```

ตัวอย่าง:

```text
Mango ── belongsToCategory ──> Tropical
```

---

## 6.3 grownIn

ใช้ระบุประเทศที่ปลูกผลไม้

```text
Fruit → Country
```

Domain:

```text
Fruit
```

Range:

```text
Country
```

ตัวอย่าง:

```text
Mango ── grownIn ──> Thailand
```

---

## 6.4 growsFruit

ใช้ระบุว่าประเทศหนึ่งปลูกผลไม้อะไร

```text
Country → Fruit
```

Domain:

```text
Country
```

Range:

```text
Fruit
```

Property นี้เป็น Inverse Property ของ `grownIn`

```text
grownIn inverseOf growsFruit
```

ดังนั้น:

```text
Mango ── grownIn ──> Thailand
```

สามารถมองกลับด้านได้เป็น:

```text
Thailand ── growsFruit ──> Mango
```

---

# 7. Data Properties

Ontology มี Data Properties 2 ตัว:

```text
name
sweetness
```

## 7.1 name

ใช้เก็บชื่อของผลไม้

```text
Domain:
Fruit

Range:
xsd:string
```

ตัวอย่าง:

```text
Mango ── name ──> "Mango"
```

---

## 7.2 sweetness

ใช้เก็บระดับความหวานของผลไม้

```text
Domain:
Fruit

Range:
xsd:integer
```

ตัวอย่าง:

```text
Mango ── sweetness ──> 8
```

---

# 8. OWL Restrictions

กำหนด Restriction ให้กับ `Fruit` เพื่อระบุว่า Fruit ควรมีความสัมพันธ์สำคัญอย่างน้อยหนึ่งรายการ

```text
Fruit
├── hasColor some Color
├── belongsToCategory some FruitCategory
└── grownIn some Country
```

ใน Manchester Syntax:

```text
Fruit
    SubClassOf
        hasColor some Color

Fruit
    SubClassOf
        belongsToCategory some FruitCategory

Fruit
    SubClassOf
        grownIn some Country
```

หมายความว่า Instance ที่เป็น `Fruit` ต้องมี:

* สี
* ประเภท
* ประเทศที่ปลูก

อย่างน้อยหนึ่งค่าในแต่ละความสัมพันธ์

> หมายเหตุ: OWL Restriction ใช้สำหรับอธิบาย Semantic/Logical Structure ส่วน Data Validation ที่ละเอียดขึ้นสามารถทำด้วย SHACL ในภายหลัง

---

# 9. Final Ontology Structure

โครงสร้าง Ontology ที่ได้:

```text
owl:Thing
│
├── Fruit
│   │
│   ├── hasColor some Color
│   ├── belongsToCategory some FruitCategory
│   └── grownIn some Country
│
├── FruitCategory
│
├── Color
│
└── Country
```

Object Properties:

```text
Fruit ── hasColor ────────────────> Color

Fruit ── belongsToCategory ───────> FruitCategory

Fruit ── grownIn ─────────────────> Country

Country ── growsFruit ────────────> Fruit
```

Inverse:

```text
grownIn inverseOf growsFruit
```

Data Properties:

```text
Fruit ── name ────────> xsd:string

Fruit ── sweetness ────> xsd:integer
```

---

# 10. สร้าง Ontology ด้วย Protégé

## 10.1 สร้าง Ontology ใหม่

เปิด Protégé

เลือก:

```text
File → New Ontology
```

ตั้งชื่อ:

```text
Fruit Ontology
```

กำหนด Ontology IRI:

```text
http://example.org/fruit-ontology
```

> หากใช้ IRI อื่น ให้ใช้ IRI ของโปรเจกต์จริงแทน และต้องใช้ Namespace เดียวกันในการเขียน SPARQL

---

# 11. สร้าง Classes

ไปที่:

```text
Classes
```

สร้าง Classes ภายใต้ `owl:Thing`:

```text
Fruit
FruitCategory
Color
Country
```

ผลลัพธ์:

```text
owl:Thing
├── Fruit
├── FruitCategory
├── Color
└── Country
```

---

# 12. สร้าง Object Properties

ไปที่:

```text
Object Properties
```

สร้าง:

```text
hasColor
belongsToCategory
grownIn
growsFruit
```

---

## 12.1 hasColor

กำหนด:

```text
Domain:
Fruit

Range:
Color
```

---

## 12.2 belongsToCategory

กำหนด:

```text
Domain:
Fruit

Range:
FruitCategory
```

---

## 12.3 grownIn

กำหนด:

```text
Domain:
Fruit

Range:
Country
```

---

## 12.4 growsFruit

กำหนด:

```text
Domain:
Country

Range:
Fruit
```

และกำหนด:

```text
grownIn inverseOf growsFruit
```

---

# 13. สร้าง Data Properties

ไปที่:

```text
Data Properties
```

สร้าง:

```text
name
sweetness
```

กำหนด:

### name

```text
Domain:
Fruit

Range:
xsd:string
```

### sweetness

```text
Domain:
Fruit

Range:
xsd:integer
```

---

# 14. สร้าง Individuals

หลังจากออกแบบ Ontology แล้ว ให้สร้างข้อมูลจริงใน:

```text
Individuals
```

## 14.1 Fruit

สร้าง:

```text
Mango
Durian
Banana
Apple
```

---

## 14.2 Color

สร้าง:

```text
Yellow
Green
Red
```

---

## 14.3 FruitCategory

สร้าง:

```text
Tropical
Temperate
```

---

## 14.4 Country

สร้าง:

```text
Thailand
Japan
```

---

# 15. เพิ่มข้อมูลให้ Mango

เลือก Individual:

```text
Mango
```

เพิ่ม Object Property Assertions:

```text
hasColor → Yellow

belongsToCategory → Tropical

grownIn → Thailand
```

เพิ่ม Data Property Assertions:

```text
name → "Mango"

sweetness → 8
```

ดังนั้น:

```text
Mango
├── hasColor → Yellow
├── belongsToCategory → Tropical
├── grownIn → Thailand
├── name → "Mango"
└── sweetness → 8
```

---

# 16. เพิ่มข้อมูลผลไม้อื่น

ใช้ Dataset ตัวอย่าง:

| Fruit  | Color  | Category  | Country  | Sweetness |
| ------ | ------ | --------- | -------- | --------: |
| Mango  | Yellow | Tropical  | Thailand |         8 |
| Durian | Green  | Tropical  | Thailand |         9 |
| Banana | Yellow | Tropical  | Thailand |         7 |
| Apple  | Red    | Temperate | Japan    |         6 |

ดังนั้น:

### Mango

```text
hasColor → Yellow
belongsToCategory → Tropical
grownIn → Thailand
name → "Mango"
sweetness → 8
```

### Durian

```text
hasColor → Green
belongsToCategory → Tropical
grownIn → Thailand
name → "Durian"
sweetness → 9
```

### Banana

```text
hasColor → Yellow
belongsToCategory → Tropical
grownIn → Thailand
name → "Banana"
sweetness → 7
```

### Apple

```text
hasColor → Red
belongsToCategory → Temperate
grownIn → Japan
name → "Apple"
sweetness → 6
```

---

# 17. บันทึก Ontology

เลือก:

```text
File → Save As
```

ตั้งชื่อ:

```text
fruit-ontology.owl
```

แนะนำให้ใช้ RDF/XML เป็น Serialization Format

ไฟล์ที่ได้:

```text
fruit-ontology.owl
```

ไฟล์นี้ประกอบด้วย:

```text
Ontology
+
Classes
+
Object Properties
+
Data Properties
+
Individuals
+
Assertions
+
OWL Restrictions
```

---

# 18. ติดตั้ง Apache Jena Fuseki

สามารถใช้ Docker เพื่อให้ติดตั้งและจัดการง่าย

สร้างโครงสร้าง:

```text
fruit-kg/
├── docker-compose.yml
└── data/
```

สร้างไฟล์:

```text
docker-compose.yml
```

ตัวอย่าง:

```yaml
services:
  fuseki:
    image: stain/jena-fuseki
    container_name: fruit-fuseki
    ports:
      - "3030:3030"
    environment:
      ADMIN_PASSWORD: admin
      JVM_ARGS: "-Xmx2g"
    volumes:
      - ./data:/fuseki
```

รัน:

```bash
docker compose up -d
```

ตรวจสอบ:

```bash
docker ps
```

จากนั้นเปิด:

```text
http://localhost:3030
```

---

# 19. สร้าง Dataset ใน Fuseki

Login:

```text
Username:
admin

Password:
admin
```

ไปที่:

```text
Manage datasets
```

เลือก:

```text
Add new dataset
```

ตั้งชื่อ Dataset:

```text
fruit
```

เลือก Dataset แบบ Persistent ตามตัวเลือกของ Fuseki Version ที่ใช้งาน

จากนั้น Create

Endpoint จะเป็น:

```text
http://localhost:3030/fruit
```

---

# 20. Import OWL File เข้า Fuseki

เข้า Dataset:

```text
fruit
```

จากนั้นเลือก:

```text
Upload data
```

เลือกไฟล์:

```text
fruit-ontology.owl
```

แล้ว Upload

ตอนนี้ข้อมูลจาก Protégé จะถูกโหลดเข้า Fuseki

```text
Protégé
   │
   │ fruit-ontology.owl
   ▼
Fuseki
   │
   ▼
fruit Dataset
```

---

# 21. ตรวจสอบข้อมูลใน Fuseki

ไปที่:

```text
Query
```

ทดลอง Query:

```sparql
SELECT ?s ?p ?o
WHERE {
    ?s ?p ?o
}
LIMIT 20
```

หากมีผลลัพธ์ แสดงว่า Fuseki สามารถอ่าน RDF Graph ได้แล้ว

ข้อมูลจะมีลักษณะ:

```text
Subject     Predicate             Object
------------------------------------------------
Mango       hasColor              Yellow
Mango       grownIn               Thailand
Mango       sweetness             8
...
```

---

# 22. Namespace

ก่อนเขียน SPARQL ต้องตรวจสอบ Ontology IRI ของไฟล์จริง

ตัวอย่าง ถ้า Ontology IRI คือ:

```text
http://example.org/fruit-ontology#
```

สามารถกำหนด Prefix:

```sparql
PREFIX : <http://example.org/fruit-ontology#>
```

> Namespace ต้องตรงกับ URI ที่ Protégé ใช้จริง ห้ามสมมติว่าเหมือนตัวอย่างเสมอไป

---

# 23. SPARQL Queries

## CQ1 — มะม่วงมีสีอะไร?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?color
WHERE {
    :Mango :hasColor ?color .
}
```

Expected result:

```text
Yellow
```

---

# 24. CQ2 — มะม่วงเป็นผลไม้ประเภทอะไร?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?category
WHERE {
    :Mango :belongsToCategory ?category .
}
```

Expected result:

```text
Tropical
```

---

# 25. CQ3 — มะม่วงปลูกในประเทศอะไร?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?country
WHERE {
    :Mango :grownIn ?country .
}
```

Expected result:

```text
Thailand
```

---

# 26. CQ4 — ผลไม้อะไรมีสีเหลือง?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruit
WHERE {
    ?fruit :hasColor :Yellow .
}
```

Expected result:

```text
Mango
Banana
```

---

# 27. CQ5 — ผลไม้อะไรอยู่ในประเภท Tropical?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruit
WHERE {
    ?fruit :belongsToCategory :Tropical .
}
```

Expected result:

```text
Mango
Durian
Banana
```

---

# 28. CQ6 — ประเทศไทยปลูกผลไม้อะไรบ้าง?

วิธีที่ตรงไปตรงมาที่สุดคือ Query ผ่าน `grownIn`

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruit
WHERE {
    ?fruit :grownIn :Thailand .
}
```

Expected result:

```text
Mango
Durian
Banana
```

---

# 29. CQ7 — ผลไม้อะไรมีความหวานระดับ 7 ขึ้นไป?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruit ?sweetness
WHERE {
    ?fruit :sweetness ?sweetness .
    FILTER(?sweetness >= 7)
}
```

Expected result:

```text
Mango     8
Durian    9
Banana    7
```

---

# 30. CQ8 — ผลไม้อะไรปลูกในประเทศไทยและมีสีเหลือง?

```sparql
PREFIX : <http://example.org/fruit-ontology#>

SELECT ?fruit
WHERE {
    ?fruit :grownIn :Thailand .
    ?fruit :hasColor :Yellow .
}
```

Expected result:

```text
Mango
Banana
```

---

# 31. Knowledge Graph ที่ได้

หลังจาก Import เข้า Fuseki เราสามารถมอง Knowledge Graph ได้ประมาณนี้:

```text
                         Yellow
                            ▲
                            │
                         hasColor
                            │
                            │
Thailand ◄──── grownIn ─── Mango
    │                       │
    │                       │
    │                       └── belongsToCategory ──> Tropical
    │
    ├──── grownIn ── Durian ──> Tropical
    │                    │
    │                    └── hasColor → Green
    │
    └──── grownIn ── Banana ──> Tropical
                         │
                         └── hasColor → Yellow


Japan ◄──── grownIn ─── Apple
                         │
                         ├── hasColor → Red
                         └── belongsToCategory → Temperate
```

แนวคิดสำคัญคือ Knowledge Graph ไม่ได้เก็บข้อมูลเป็นตารางอย่างเดียว แต่เก็บเป็น **Graph ของความสัมพันธ์ระหว่าง Resource**

---

# 32. Ontology vs Knowledge Graph

## Ontology

กำหนด:

```text
Fruit
Color
Country
FruitCategory

hasColor
grownIn
belongsToCategory
```

เปรียบเสมือน:

```text
Schema / Semantic Model
```

---

## Knowledge Graph

มีข้อมูลจริง:

```text
Mango
Yellow
Thailand
Tropical
```

และความสัมพันธ์:

```text
Mango ── hasColor ──> Yellow

Mango ── grownIn ──> Thailand

Mango ── belongsToCategory ──> Tropical
```

ดังนั้น:

```text
Ontology
    ↓
กำหนดโครงสร้างความรู้

Knowledge Graph
    ↓
เก็บข้อมูลตามโครงสร้างนั้น
```

---

# 33. Validation Checklist

ก่อนนำไปใช้กับ LLM ให้ตรวจสอบ:

```text
[ ] มี Domain ที่ชัดเจน
[ ] มี Competency Questions อย่างน้อย 7 ข้อ
[ ] Classes ถูกต้อง
[ ] Object Properties ถูกต้อง
[ ] Data Properties ถูกต้อง
[ ] Domain / Range ถูกต้อง
[ ] grownIn inverseOf growsFruit
[ ] OWL Restrictions ถูกต้อง
[ ] Individuals ถูกต้อง
[ ] Object Property Assertions ถูกต้อง
[ ] Data Property Assertions ถูกต้อง
[ ] Export เป็น OWL/RDF สำเร็จ
[ ] Import เข้า Fuseki สำเร็จ
[ ] SPARQL Query ทำงาน
[ ] CQ1 ผ่าน
[ ] CQ2 ผ่าน
[ ] CQ3 ผ่าน
[ ] CQ4 ผ่าน
[ ] CQ5 ผ่าน
[ ] CQ6 ผ่าน
[ ] CQ7 ผ่าน
[ ] CQ8 ผ่าน
```

---

# 34. Current Architecture

หลังจากขั้นตอนนี้ Architecture ของโปรเจกต์จะเป็น:

```text
                         ┌───────────────┐
                         │    Protégé    │
                         │               │
                         │ Fruit         │
                         │ Ontology      │
                         │ + Individuals │
                         └───────┬───────┘
                                 │
                                 │ OWL / RDF
                                 ▼
                         ┌───────────────┐
                         │ Apache Jena   │
                         │    Fuseki     │
                         │               │
                         │ Knowledge     │
                         │ Graph         │
                         └───────┬───────┘
                                 │
                              SPARQL
                                 │
                                 ▼
                            Query Result
```

ในขั้นนี้ **ยังไม่มี LLM**

และควรเป็นแบบนี้ เพราะเราต้องพิสูจน์ให้ได้ก่อนว่า Knowledge Graph สามารถตอบ Competency Questions ได้โดยไม่พึ่ง LLM

---

# 35. Next Phase — LLM Integration

เมื่อส่วนนี้ทำงานได้แล้ว จึงเพิ่ม Local LLM เข้าไป:

```text
User
 │
 │ "ผลไม้อะไรปลูกในประเทศไทยและมีสีเหลือง?"
 ▼
Local LLM
 │
 │ Generate SPARQL
 ▼
SPARQL Validation
 │
 ▼
Apache Jena Fuseki
 │
 │ Mango, Banana
 ▼
Local LLM
 │
 │ Generate natural language answer
 ▼
User
```

ตัวอย่าง:

```text
User:
ผลไม้อะไรปลูกในประเทศไทยและมีสีเหลือง?

        ↓

LLM:
SELECT ?fruit
WHERE {
    ?fruit :grownIn :Thailand .
    ?fruit :hasColor :Yellow .
}

        ↓

Fuseki:
Mango
Banana

        ↓

LLM:

มะม่วงและกล้วยเป็นผลไม้ที่ปลูกในประเทศไทย
และมีสีเหลือง
```

หลักการสำคัญคือ **LLM ไม่ใช่ Knowledge Base**

LLM มีหน้าที่:

```text
Natural Language
       ↕
SPARQL
```

ส่วน Knowledge Graph เป็นแหล่งข้อมูลที่ใช้ Ground คำตอบ:

```text
Knowledge Graph
       ↓
Evidence / Facts
```

ดังนั้นในขั้นต่อไปจึงสามารถนำ:

```text
Ollama
+
Small LLM
+
FastAPI
+
Apache Jena Fuseki
```

มาประกอบเป็นระบบ Chat ได้
