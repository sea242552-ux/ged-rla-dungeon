# GED RLA Dungeon — Game Design Document

> เอกสารฉบับนี้คือแหล่งข้อมูลกลาง (single source of truth) ของเกม GED RLA Dungeon
> Claude Code ต้องอ่านและเข้าใจเอกสารนี้ก่อนเริ่มเขียนโค้ดทุกครั้ง

---

## 1. ภาพรวมเกม (Concept)

**GED RLA Dungeon** คือเกมฝึกคำศัพท์ภาษาอังกฤษแนว **Text-based Dungeon Crawler** สำหรับเตรียมสอบ GED RLA (Reasoning Through Language Arts)

แนวคิดหลัก:
- ผู้เล่นเดินทางผ่าน "ห้องดันเจี่ยน" แต่ละห้องมี "ศัตรู" ที่เป็นคำศัพท์
- เลือกคำแปลที่ถูกต้อง = สังหารศัตรู = เดินหน้าต่อ
- ตอบผิด = โดน damage = HP ลด
- HP หมด = Game Over
- ดีไซน์แบบ text-based, ธีม dark dungeon, monospace font, ASCII art (ไม่มีกราฟฟิก animation มอนสเตอร์ในช่วงแรก)

กลุ่มเป้าหมาย: คนไทยที่เตรียมสอบ GED โดยเฉพาะ

**สำคัญมาก:** เกมนี้เป็นเพียงเกมแรกของ "Dungeon Ecosystem" ที่ใหญ่กว่า ดังนั้นการออกแบบโครงสร้างข้อมูลและโค้ดต้องเผื่อการขยายในอนาคต (ดูหมวด 13)

---

## 2. Tech Stack

| ส่วน | เทคโนโลยี | หมายเหตุ |
|---|---|---|
| Frontend | React + Vite | โครงสร้างที่แปลงเป็น mobile app ได้ภายหลัง |
| Styling | Tailwind CSS | ธีม dark dungeon |
| Storage (Phase 1) | localStorage | ยังไม่มี backend |
| Storage (Phase 2+) | Supabase | cloud, online leaderboard, sync ข้ามเกม |
| Deploy | Vercel | ฟรี ใช้บนมือถือผ่าน browser ได้ทันที |
| Mobile (Phase 3) | Capacitor | แปลง web → iOS/Android |

---

## 3. โครงสร้างข้อมูลคำศัพท์ (Word Schema)

แต่ละคำมีโครงสร้างดังนี้ — **ออกแบบให้รองรับ multi-translation และ ecosystem ตั้งแต่แรก**

```json
{
  "id": "advocate",
  "word": "advocate",
  "tags": ["ged_rla"],
  "difficulty": "medium",
  "translations": [
    {
      "meaning": "สนับสนุน / ผู้สนับสนุน",
      "example": "She advocates for equal rights.",
      "context": "standard",
      "used_in": ["ged_rla", "eng"]
    }
  ]
}
```

หมายเหตุสำคัญ:
- `tags` — บอกว่าคำนี้อยู่ในเกมไหนบ้าง (ตอนนี้มีแค่ "ged_rla")
- `translations` — เป็น array รองรับหลายความหมาย (ตอนนี้ส่วนใหญ่มี 1 อัน)
- `context: "standard"` — ความหมายหลักที่ใช้เป็น default
- ใน Phase 1 แต่ละคำอาจมี translation เดียวก็พอ แต่ schema ต้องเป็น array เสมอ

---

## 4. ข้อมูลที่ต้องเก็บ (Data Layer)

### 4.1 words.json (static — อยู่ใน /public)
รายการคำศัพท์ทั้งหมด ตาม schema หมวด 3

### 4.2 wordStats (localStorage — สถานะการเรียนรู้ของผู้เล่น)
```json
{
  "userId": "local_user",
  "wordId": "advocate",
  "source": "ged_rla",
  "status": "review",
  "interval": 7,
  "nextReview": "2026-06-14",
  "lastSeen": "2026-06-07",
  "learningCount": 3,
  "weight": 1.0,
  "fastTrack": false,
  "activeTranslation": "สนับสนุน / ผู้สนับสนุน"
}
```

### 4.3 playerStats (localStorage)
```json
{
  "userId": "local_user",
  "highScore": 0,
  "streak": 0,
  "lastPlayed": null,
  "totalSeen": 0,
  "totalLearned": 0
}
```

### 4.4 localLeaderboard (localStorage)
```json
[
  { "rank": 1, "score": 2840, "floor": 8, "date": "2026-06-07", "wordsLearned": 45 }
]
```

> **เตรียมไว้สำหรับอนาคต:** เก็บ `userId` และ `source` ตั้งแต่แรก แม้ Phase 1 จะยังไม่มี login จริง ใช้ค่า default `"local_user"` ไปก่อน

---

## 5. หน้าจอทั้งหมด (Screens)

### 5.1 Home Screen
- ชื่อเกม + ASCII art
- ปุ่ม Start
- แสดง streak ปัจจุบัน
- **Bar เล็กๆ แสดงจำนวนคำแต่ละ interval** (ไม่ต้องใหญ่) — กดแล้วเข้า Word Vault
- แสดง "วันนี้ต้องทบทวน X คำ"

### 5.2 Game Screen
- HP bar (หัวใจ 5 ดวง)
- Score ปัจจุบัน
- Room number / Floor number
- คำศัพท์ที่เป็นศัตรู (แสดงสี + icon ตาม rank)
- ตัวเลือก 4 ข้อ
- Effect animation เมื่อตอบถูก/ผิด

### 5.3 Word Vault (Progress Screen)
- Bar แสดงจำนวนคำในแต่ละ interval (New, 1, 3, 7, 14, 30 วัน, Mastered)
- กดที่แต่ละ bar เพื่อดูรายชื่อคำในระดับนั้น
- ปุ่ม Fast Track ⚡ (แสดงเฉพาะแรคที่ปลดล็อคแล้ว)
- แรคที่ยังไม่ปลดล็อคแสดง 🔒 + จำนวนคำที่ต้องการ

### 5.4 Game Over Screen
- คะแนนสุดท้าย
- รายการคำที่ตอบผิดในรอบนี้
- High Score (เทียบกับ local leaderboard)
- ปุ่ม Play Again
- (Phase 2+) ปุ่ม submit score ขึ้น online leaderboard

---

## 6. Game Mechanics

### 6.1 ด่านปกติ (Normal Room)
- แสดงคำศัพท์ 1 คำ + ตัวเลือกคำแปล 4 ข้อ
- ตอบถูก → +score (ตาม rank + combo) → เดินหน้าห้องถัดไป
- ตอบผิด → HP -1 → แสดงคำแปลที่ถูกต้อง → interval ของคำนั้น reset

### 6.2 HP System
- เริ่มต้น HP = 5
- ตอบผิด -1 HP
- ไม่มี HP restore
- HP = 0 → Game Over

### 6.3 Floor System
- ครบ 10 room = จบ 1 floor
- ห้องที่ 10 ของทุก floor = Boss Room
- จบ floor → แสดงสรุป → เริ่ม floor ใหม่

### 6.4 Boss Room
- เกิดทุกห้องที่ 10
- ใช้คำระดับสูงสุดที่มี (ดูหมวด 8.3)
- Boss มี HP 3 ชั้น (ต้องตอบถูก 3 ครั้ง)
- **คำใน Boss Room ตอบถูกไม่อัพ interval** (เป็นการทดสอบ ไม่ใช่เรียนใหม่)
- ตอบถูกครบ = ผ่าน Boss (คำคงระดับเดิม)
- ตอบผิด = คำนั้น interval reset กลับไป 1 วัน + HP -1

### 6.5 จบ session เมื่อคำหมด
- เมื่อคำ due + คำใหม่ของวันหมด → แสดง "ยินดีด้วย คุณได้เรียนรู้คำไปจนหมดของวันนี้แล้ว! 🎉"
- มีปุ่ม "เล่นต่อ (Boss Only Mode)"

### 6.6 Boss Only Mode
- เข้าได้หลังเคลียร์คำของวันหมดแล้ว
- เล่นแต่ Boss Room อย่างเดียวไปเรื่อยๆ
- **Score รีเซ็ตเป็น 0** เริ่มนับใหม่
- ได้คะแนนปกติ (คำระดับสูง = คะแนนสูง)
- นับรวมเข้า leaderboard ได้เลย (ถ้า score สูงกว่ารอบปกติก็แซงได้)
- จบเมื่อ HP หมด หรือผู้เล่นออกเอง

---

## 7. Rank System (สี + Icon)

| Rank | สี | Icon | หมายเหตุ |
|---|---|---|---|
| New | ขาว | (ไม่มี) | ยังไม่เคยเจอ |
| 1 วัน | ขาว | (ไม่มี) | เหมือน New แยกด้วยการเคยเจอ |
| 3 วัน | เขียว | 🛡️🛡️ | โล่คู่ |
| 7 วัน | ส้มทอง | ⚜️ | ตราประทับ |
| 14 วัน | ส้มแดง | 💎 | เพชร |
| 30 วัน | แดง | 🔥 | เปลวไฟ |
| Mastered | ทอง | ⚔️ | ดาบ |

### 7.1 Effect Animation
- **ตอบถูก:** จอมืดลง (overlay ~0.82) แสดงเฉพาะคำนั้น → แสดง icon ระดับใหม่ + ข้อความ "อัพระดับ!" → ใช้เวลารวม ~1.2 วินาที (ไม่เกิน 1.5 วิ)
- **ตอบผิด:** จอมืดโทนแดง → แสดง icon แตก + ข้อความว่ากลับไประดับไหน → ~1.2 วินาที
- สีของคำเปลี่ยนตาม rank ทุกที่ รวมถึงใน Boss Room

---

## 8. Spaced Repetition System (SRS) — หัวใจของเกม

### 8.1 Learning Steps (คำใหม่ต้องถูก 3 ครั้ง)
- **คำใหม่ (New):** ต้องตอบถูก **3 ครั้ง** ก่อนจึงเข้าสู่ระบบ interval (status เปลี่ยนเป็น review, interval = 1 วัน)
- ระหว่าง learning ถ้าตอบผิด → learningCount reset เป็น 0
- จุดประสงค์: ให้ผู้เล่นคุ้นเคยกับคำก่อนจะเริ่มนับ interval

### 8.2 Fixed Interval (ไม่ใช่ SM-2)
```
ตอบถูกครั้งที่ 1 (หลังผ่าน learning) → interval 1 วัน
ตอบถูกครั้งถัดไป → 3 วัน
ตอบถูกครั้งถัดไป → 7 วัน
ตอบถูกครั้งถัดไป → 14 วัน
ตอบถูกครั้งถัดไป → 30 วัน
ตอบถูกอีกครั้ง → Mastered
ตอบผิดเมื่อไหร่ → reset (ดู 8.5)
```
> ใช้ Fixed Interval ไม่ใช่ SM-2 เพราะเกมมีแค่ "ถูก/ผิด" ไม่มีข้อมูลความมั่นใจระดับ (Again/Hard/Good/Easy) พอจะรัน SM-2

### 8.3 Relearning (คำที่ reset กลับมา)
- คำที่เคยอยู่ใน interval แล้วตอบผิด → status = "relearning"
- ตอบถูก **แค่ 1 ครั้ง** ก็กลับเข้า interval ได้เลย (ไม่ต้องผ่าน 3 ครั้งเหมือนคำใหม่)
- เหตุผล: เคยรู้จักคำนี้แล้ว ไม่ใช่คำใหม่จริงๆ

### 8.4 Weight System (ความถี่ที่คำจะถูกสุ่มออกมาในเกม)

| สถานะ | Weight | หมายเหตุ |
|---|---|---|
| New | 1.0 | เริ่มต้น |
| Learning 1/3 | 3.0 | โผล่บ่อยให้คุ้นเคย |
| Learning 2/3 | 2.0 | ลดลงเมื่อใกล้อัพ |
| Review (due วันนี้) | 1.0 | ถึงเวลาทบทวนปกติ |
| Review (overdue) | 1.0 + (0.5 × overdue_days) | ค้างนานยิ่งสำคัญ |
| Relearning | 2.5 | reset มา ต้องทบทวนด่วน |
| Mastered | 0.1 | maintain ความจำเท่านั้น |
| Fast Track | 10.0 | ออกก่อนทุกคำ |

### 8.5 ตอบผิดเกิดอะไรขึ้น
- คำที่ตอบผิด → interval reset ไป 1 วัน, status = relearning
- ถ้าเป็นคำ Mastered ที่แพ้ใน Boss → reset ไป 1 วันเช่นกัน (Vault จะแสดงตัวเลขลดลง)

---

## 9. Priority System — ลำดับการดึงคำออกมา

### 9.1 ด่านปกติ
```
priority = (interval_weight × 2) + overdue_days

interval_weight:
  1 วัน = 1, 3 วัน = 2, 7 วัน = 3, 14 วัน = 4, 30 วัน = 5, Mastered = 6

overdue_days = วันนี้ - nextReview
```
- คำระดับสูงออกก่อนเป็น default แต่คำที่ค้างนานพอก็แซงได้
- priority เท่ากัน → เรียงตาม overdue_days มากกว่าก่อน
- ยังเท่ากัน → สุ่ม (shuffle)

### 9.2 Boss Room
- ใช้ `daysSinceLastSeen` แทน overdue_days (เพราะ Mastered ไม่มี nextReview)
- เลือกคำจากระดับสูงสุดก่อน: Mastered → 30 → 14 → 7 วัน (ต่ำกว่า 7 ไม่ใช้เป็น Boss)
- ในระดับเดียวกัน เรียงตาม daysSinceLastSeen มากกว่าก่อน
- เท่ากัน → สุ่ม
- ถ้าคำระดับสูงไม่พอ → เติมจากระดับรองลงมา
- ถ้าไม่มีคำระดับสูงพอเลย (เล่นวันแรก) → ข้าม Boss แสดง "ยังไม่มีศัตรูแกร่งพอ..."

---

## 10. Dynamic New Card Gate — ควบคุมจำนวนคำใหม่

แทนการกำหนด ratio ตายตัว ให้ระบบดู pressure ก่อนปล่อยคำใหม่
```
pressure = due_cards + learning_cards

pressure ≤ 5   → ปล่อยคำใหม่ได้ 5 คำ
pressure ≤ 10  → ปล่อยคำใหม่ได้ 3 คำ
pressure ≤ 20  → ปล่อยคำใหม่ได้ 1 คำ
pressure > 20  → ไม่ปล่อยคำใหม่เลย (จัดการ due ก่อน)
```
> ค่าเหล่านี้ต้องเก็บใน config/constants แยก ปรับได้ง่าย ไม่ hard-code กระจาย

---

## 11. ตัวเลือก 4 ข้อ — การสร้างและกฎ

1. คำตอบที่ถูก = active_translation ของคำที่ทดสอบ
2. ตัวหลอก 3 คำ = สุ่มจาก words.json (random ธรรมดา ไม่ใช้ weight)
3. นำคำแปลทั้ง 4 มาสลับตำแหน่งสุ่มใหม่ทุกครั้ง
4. ตำแหน่งคำตอบที่ถูกสุ่มใหม่ทุกรอบ (ห้ามจำตำแหน่งได้)
5. ตัวหลอกต้องไม่ซ้ำกันในรอบเดียว
6. **กฎสำคัญ:** ตัวหลอกต้องไม่ตรงกับ translation ใดๆ ของคำที่ทดสอบ — ต้องเช็คทุก translation ใน array ไม่ใช่แค่ active_translation (ป้องกันกรณีคำที่มีหลายความหมาย)
7. ถ้าเจอคำเดิมซ้ำ ตัวหลอกจะเป็นคนละชุด (สุ่มใหม่ทุกครั้ง)

---

## 12. Score System

### 12.1 คะแนนพื้นฐานตาม Rank
```
New / 1 วัน  =  10
3 วัน        =  20
7 วัน        =  35
14 วัน       =  55
30 วัน       =  80
Mastered     = 120  (Boss Room)
```

### 12.2 Combo Multiplier (ตอบถูกติดต่อกัน)
```
combo × 2  → ×1.2
combo × 5  → ×1.5
combo × 10 → ×2.0
combo × 20 → ×3.0
```
- ตอบผิด → combo reset เป็น 0

### 12.3 Fast Track Bonus
- ตอบถูก Fast Track = base score ของ rank ปลายทาง × 1.5

> ค่าคะแนนทั้งหมดเก็บใน config/constants แยก ปรับได้ง่าย

---

## 13. Fast Track System

### 13.1 เงื่อนไขปลดล็อค (ต่อแรค)
```
แรค 1 วัน   → ต้องมี ≥ 30 คำ  → Fast Track ไป 3 วัน
แรค 3 วัน   → ต้องมี ≥ 25 คำ  → Fast Track ไป 7 วัน
แรค 7 วัน   → ต้องมี ≥ 20 คำ  → Fast Track ไป 14 วัน
แรค 14 วัน  → ต้องมี ≥ 15 คำ  → Fast Track ไป 30 วัน
แรค 30 วัน  → ต้องมี ≥ 10 คำ  → Fast Track ไป Mastered
```
- ถ้าคำในแรคลดต่ำกว่าค่ากำหนด → ปิดอัตโนมัติ

### 13.2 ขั้นตอน
1. เปิด Word Vault → เลือกแรคที่ปลดล็อค (มี ⚡)
2. เลือกคำที่ต้องการ Fast Track (เลือกได้กี่คำก็ได้ แต่คำที่เหลือในแรคต้องไม่ต่ำกว่าค่ากำหนด)
3. กดยืนยัน → คำเข้าสู่สถานะ fastTrack = true, weight = 10.0 (ออกก่อนคำอื่น)
4. **ตอบถูก** → อัพแรคทันที, fastTrack = false, status = review ปกติ
5. **ตอบผิด** → interval reset ไป 1 วัน เหมือนคำปกติ, fastTrack = false (ไม่มีสิทธิพิเศษ)

> Fast Track เป็นแค่การ "เร่งให้คำออกมาทดสอบเร็วขึ้น" ไม่ใช่ทางลัดฟรี — ถูกได้รางวัล ผิดรับโทษเหมือนปกติ

---

## 14. Leaderboard

### 14.1 Local Leaderboard (Phase 1)
- เก็บ top 10 ใน localStorage
- แสดงใน Game Over screen
- ไม่ต้อง backend

### 14.2 Online Leaderboard (Phase 2)
- ใช้ Supabase (ฟรี: 500MB, 50,000 requests/เดือน)
- Game Over → บันทึก local → ถามผู้เล่นใส่ชื่อ → ส่งขึ้น Supabase → ดึง top 10 มาแสดง
- แสดงอันดับของผู้เล่นเองด้วย

---

## 15. ระบบเสียง (เตรียมไว้ ปิด default)

```javascript
// utils/speech.js
const SPEECH_ENABLED = false  // เปลี่ยนเป็น true ใน Phase 2

export function speak(word) {
  if (!SPEECH_ENABLED) return
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}
```
- โค้ดพร้อม แต่ปิดไว้ ไม่มี toggle UI ใน Phase 1

---

## 16. การเตรียมโครงสร้างสำหรับ Ecosystem (สำคัญมาก)

เกมนี้เป็นเกมแรกของหลายเกม (TOEIC, IELTS, Eng Dungeon) สิ่งที่ต้องเตรียมตั้งแต่ Phase 1:

1. **userId field** — เก็บใน localStorage ทุก record แม้ยังไม่มี login (ใช้ "local_user")
2. **source / tags** — ทุกคำมี tags array, ทุก wordStats มี source
3. **wordStats schema** — มี userId + source ตั้งแต่แรก ไม่ต้อง refactor ทีหลัง
4. **translations เป็น array** — รองรับ multi-translation ตั้งแต่แรก
5. **Export function** — เตรียม function ที่ export wordStats เป็น JSON ได้ (สำหรับ migrate ขึ้น Supabase และให้เกมอื่นดึงไปใช้)
6. **Score/Gate/Interval constants แยกไฟล์** — config ทั้งหมดอยู่ที่เดียว ปรับง่าย

### 16.1 Multi-translation (Phase 4+ แต่เตรียม schema ไว้)
- แต่ละคำเก็บได้หลาย translation ใน array
- มี 1 อันเป็น context "standard" สำหรับ Eng Dungeon
- activeTranslation บอกว่าตอนนี้ใช้ความหมายไหน
- เมื่อเข้าเกมใหม่ที่ใช้ความหมายต่างกัน → ขอ permission ผู้เล่นก่อนเปลี่ยน
- ผู้เล่นเปลี่ยน activeTranslation เองได้ใน Advanced Settings

---

## 17. แผนการทำงาน (Phases)

### Phase 1 — GED RLA Dungeon MVP (เป้าหมายหลักตอนนี้)
ลำดับการทำ:
1. Setup โปรเจกต์ (React + Vite + Tailwind)
2. สร้าง config/constants (interval, weight, score, gate, fast track thresholds)
3. เตรียม words.json (เริ่มจากตัวอย่าง 20 คำ แล้วค่อยเพิ่มเป็น 300–500)
4. สร้าง data layer (wordStats, playerStats ใน localStorage + helper functions)
5. สร้าง SRS engine (learning steps, interval, weight, priority, dynamic gate)
6. สร้าง word selector (เลือกคำ + สร้างตัวเลือก 4 ข้อ ตามกฎหมวด 11)
7. สร้าง Game Screen + game state (HP, score, combo, room, floor)
8. สร้าง Rank system (สี + icon + effect animation)
9. สร้าง Boss Room logic
10. สร้าง Home Screen + interval bar
11. สร้าง Word Vault
12. สร้าง Fast Track
13. สร้าง Score system + Local Leaderboard
14. สร้าง Game Over + Boss Only Mode
15. ทดสอบ + deploy บน Vercel

### Phase 2 — Online & Polish
- Supabase, Online Leaderboard, Login, เปิดเสียง, Daily Streak

### Phase 3 — Mobile App
- Capacitor, Push Notification, submit stores

### Phase 4 — Dungeon Ecosystem
- Central Word Store, TOEIC/IELTS Dungeon, Multi-translation system, Advanced Settings

### Phase 5 — Eng Dungeon (Hub กลาง)
- Unified Dungeon, PvP, Rank System, Global Leaderboard

---

## 18. สิ่งที่ยังไม่ทำใน Phase 1 (Deferred)

- กราฟฟิก / animation มอนสเตอร์เดิน
- UI กรองตาม category / difficulty (มี field ในข้อมูลแล้ว)
- Multiple difficulty levels
- Toggle UI เปิด/ปิดเสียง (โค้ดพร้อม แต่ซ่อนไว้)
- Daily Quest
- PvP / Rank ไต่แรค (รายละเอียดคุยทีหลัง)

> หลักการ: เตรียม field/schema ในข้อมูลไว้ แต่ยังไม่ทำ UI — เพื่อให้เพิ่มทีหลังได้โดยไม่ต้อง refactor

---

## 19. โครงสร้างโฟลเดอร์ที่แนะนำ

```
ged-rla-dungeon/
├── public/
│   └── words.json
├── src/
│   ├── config/
│   │   └── constants.js      # interval, weight, score, gate, thresholds ทั้งหมด
│   ├── components/
│   │   ├── HomeScreen.jsx
│   │   ├── GameScreen.jsx
│   │   ├── WordVault.jsx
│   │   ├── GameOver.jsx
│   │   └── effects/          # effect animation components
│   ├── hooks/
│   │   ├── useGameState.js   # HP, score, combo, room, floor
│   │   └── useProgress.js    # wordStats + playerStats
│   ├── engine/
│   │   ├── srs.js            # learning steps, interval, weight
│   │   ├── priority.js       # priority score (ปกติ + boss)
│   │   ├── wordSelector.js   # เลือกคำ + สร้างตัวเลือก
│   │   ├── newCardGate.js    # dynamic new card gate
│   │   └── fastTrack.js      # fast track logic
│   ├── data/
│   │   ├── storage.js        # localStorage wrapper
│   │   └── exportStats.js    # export function สำหรับ ecosystem
│   ├── utils/
│   │   └── speech.js         # disabled by default
│   └── App.jsx
├── package.json
└── vite.config.js
```
