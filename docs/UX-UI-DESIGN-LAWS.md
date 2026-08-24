# 📚 UX/UI Design Laws — Deep Research Report

**Author:** Mavis (Senior UX/UI Designer)
**Date:** June 15, 2026
**Source:** The Law of UX by Jon Yablonski, Gestalt Principles, Nielsen's 10 Heuristics
**Benchmark:** Rocket Money, Revolut, Monzo, Apple HIG

---

## Executive Summary

เอกสารนี้รวบรวมกฎการออกแบบ UX/UI ที่สำคัญที่สุด โดยอิงจาก "The Law of UX" โดย Jon Yablonski, Gestalt Principles และ Nielsen's 10 Usability Heuristics พร้อมทั้งวิเคราะห์การประยุกต์ใช้กับ AuthPage ของ DailyStack

---

# 📖 PART 1: The Law of UX (โดย Jon Yablonski)

## 1. Jakob's Law (กฎของยาคอบ)

> **"Users spend most of their time on other sites, and they prefer your site to work the same way as all the other sites they already know."**

### ความหมาย
ผู้ใช้ต้องการให้แอปทำงานเหมือนกับแอปอื่นๆ ที่พวกเขาคุ้นเคย การเรียนรู้รูปแบบใหม่ต้องใช้พลังงาน ดังนั้นควรออกแบบให้สอดคล้องกับ conventions ที่ผู้ใช้คุ้นเคย

### หลักการสำคัญ
- การจัดวาง navigation ควรอยู่ในตำแหน่งที่ผู้ใช้คาดหวัง (เช่น hamburger menu ซ้ายบน หรือ bottom nav)
- Icon patterns ควรเป็นไปตาม standard (เช่น 🏠 สำหรับ home, ⚙️ สำหรับ settings)
- Form flows ควรเป็นไปตามที่ผู้ใช้คุ้นเคย (เช่น email → password → submit)
- ข้อความ error ควรใช้ภาษาที่เข้าใจง่ายและตรงไปตรงมา

### การประยุกต์ใช้
```
✅ ควรทำ:
- ปุ่ม Sign In สีเข้ม อยู่ด้านล่างของ form
- Icon สำหรับ email เป็น envelope 📧
- ข้อความ "Forgot Password?" อยู่ด้านล่าง password field

❌ ไม่ควรทำ:
- วางปุ่ม Submit ไว้ด้านบน
- ใช้ icon ที่ไม่เป็น standard
- ใช้ภาษาทางการมากเกินไปใน form
```

---

## 2. Fitts's Law (กฎของฟิตซ์)

> **"The time to acquire a target is a function of the distance to and size of the target."**

### ความหมาย
เวลาที่ใช้ในการเคลื่อนที่ไปหาเป้าหมาย (target) ขึ้นอยู่กับระยะทางและขนาดของเป้าหมายนั้น ยิ่งใกล้และใหญ่ ยิ่งคลิกง่าย

### หลักการสำคัญ
- **ขนาด:** Touch targets ควรมีขนาดอย่างน้อย 44×44px (Apple HIG) หรือ 48×48dp (Material Design)
- **ระยะห่าง:** ปุ่มที่เกี่ยวข้องกันควรอยู่ใกล้กัน
- **ตำแหน่ง:** ปุ่มที่ใช้บ่อยควรอยู่ในตำแหน่งที่เข้าถึงง่าย (thumb zone)
- **Edge placement:** ขอบหน้าจอเป็นตำแหน่งที่คลิกได้ง่าย (เพราะ edge หยุด cursor)

### การประยุกต์ใช้ใน Mobile

| Element | Minimum Size | Recommended Size |
|---------|-------------|------------------|
| Touch Target | 44×44px | 48×48px |
| Button (primary) | 44×44px | 52×52px |
| Input Fields | 44px height | 52px height |
| Checkbox/Radio | 44×44px | 48×48px |
| Links | 44px height | 48px height |

### Thumb Zone Optimization
```
┌────────────────────────────────────┐
│                                    │
│  Difficult to reach (one-handed)   │
│                                    │
├────────────────────────────────────┤
│                                    │
│  Easy to reach (thumb zone)        │  ← Primary actions here
│                                    │
├────────────────────────────────────┤
│  Hardest to reach (stretch)        │
└────────────────────────────────────┘
```

---

## 3. Hick's Law (กฎของฮิค)

> **"The time it takes to make a decision increases with the number and complexity of choices."**

### ความหมาย
ยิ่งมีตัวเลือกมากเท่าไหร่ ผู้ใช้ใช้เวลาในการตัดสินใจนานขึ้นเท่านั้น KISS = Keep It Simple and Short

### หลักการสำคัญ
- **ลดทางเลือก:** แสดงเฉพาะตัวเลือกที่จำเป็น
- **จัดกลุ่ม:** รวมตัวเลือกที่คล้ายกันเข้าด้วยกัน
- **Progressive Disclosure:** แสดงตัวเลือกเพิ่มเติมเมื่อจำเป็น
- **Defaults:** มีค่าเริ่มต้นที่ดี

### การประยุกต์ใช้ใน AuthPage

```
❌ ก่อน (มีตัวเลือกมากเกินไป):
┌──────────────────────────────┐
│  [Sign In with Email    ]  │
│  [Sign In with Google   ]  │
│  [Sign In with Apple    ]  │
│  [Sign In with Facebook ]  │
│  [Sign In with Twitter  ]  │
│  [Continue as Guest     ]  │
└──────────────────────────────┘

✅ หลัง (ลดทางเลือก):
┌──────────────────────────────┐
│  [        Sign In        ]  │
│                              │
│  ──────── Or ────────      │
│                              │
│  [Google]    [Apple]        │
└──────────────────────────────┘
```

---

## 4. Miller's Law (กฎของมิลเลอร์)

> **"The average person can only keep 7 (plus or minus 2) items in their working memory."**

### ความหมาย
มนุษย์สามารถจดจำข้อมูลได้ประมาณ 7 ชิ้น (±2) ใน working memory พร้อมกัน

### หลักการสำคัญ
- **Chunking:** จัดกลุ่มข้อมูลที่เกี่ยวข้องเข้าด้วยกัน (เช่น เบอร์โทร 081-234-5678)
- **ไม่ควรมีรายการเกิน 7 ชิ้น** ในแต่ละหน้าจอ
- **Visual grouping:** ใช้ space, color, หรือ border เพื่อจัดกลุ่ม
- **Progress indicators:** แบ่งขั้นตอนที่ซับซ้อนออกเป็น steps

### การประยุกต์ใช้
```
✅ ดี:
Login Form = Email + Password + Submit = 3 inputs = Easy to process

❌ ไม่ดี:
Registration Form = Name + Email + Phone + Password + Confirm + DOB + Address + ... = 8+ inputs = Cognitive overload
```

---

## 5. Postel's Law (กฎของโพสเทล)

> **"Be liberal in what you accept, and conservative in what you send."**

### ความหมาย
ยอมรับ input ที่หลากหลายจากผู้ใช้ แต่ส่งออกเฉพาะสิ่งที่ถูกต้องตาม format

### หลักการสำคัญ
- **Accept variations:** รับ email formats ที่หลากหลาย (เช่น user@gmail.com, user+tag@gmail.com)
- **Validation:** ตรวจสอบและแก้ไข input อย่างนุ่มนวล
- **Don't break on bad input:** แสดง error แต่ไม่ crash
- **Auto-format:** จัด format ให้ถูกต้องหลังจาก submit

### การประยุกต์ใช้
```
✅ ควรทำ:
- รับ email ที่มี/ไม่มี +tag
- Auto-capitalize เฉพาะตัวแรกของ name
- แสดง error ที่เฉพาะเจาะจง ("Email ไม่ถูกต้อง" แทน "Invalid")

❌ ไม่ควรทำ:
- Reject email ที่มี space หรือ +tag
- แสดง error ที่ไม่ชัดเจน
- หยุดทำงานเมื่อ input ไม่ถูก format
```

---

## 6. Peak-End Rule (กฎจุดสูงสุด-จุดสิ้นสุด)

> **"People judge an experience largely based on how they felt at its most intense point and at its end."**

### ความหมาย
ผู้ใช้จำประสบการณ์จากจุดที่ intense ที่สุดและจุดสิ้นสุดเป็นหลัก

### หลักการสำคัญ
- **Memorable moments:** สร้างจุดที่น่าจดจำใน experience
- **End strong:** จบ experience ด้วยความรู้สึกที่ดี
- **Minimize pain points:** ลดความเจ็บปวดในจุดที่ต้องรอ
- **Success confirmation:** แสดง feedback ที่ชัดเจนเมื่อสำเร็จ

### การประยุกต์ใช้
```
✅ ดี:
Login Success → 🎉 Success Animation → "Welcome back, [Name]!" → Redirect to Dashboard

❌ ไม่ดี:
Login Success → Silent redirect → User ไม่รู้ว่าสำเร็จหรือไม่
```

---

## 7. Aesthetic-Usability Effect (เอฟเฟกต์ความสวยงาม)

> **"An aesthetically pleasing design creates a positive response in users' brains and leads them to believe the design actually works better."**

### ความหมาย
ผู้ใช้มักมองว่าแอปที่สวยงามใช้งานง่ายกว่า แม้ในความเป็นจริง usability อาจเท่ากัน

### หลักการสำคัญ
- **Beauty buys goodwill:** ผู้ใช้ให้อภัยข้อผิดพลาดเล็กน้อยกับแอปที่สวย
- **First impression matters:** Design ที่ดีสร้างความไว้วางใจ
- **Don't sacrifice aesthetics for function:** ควรมีทั้งสองอย่าง
- **Attention to detail:** Micro-details แสดงถึงความใส่ใจ

### การประยุกต์ใช้
```
✅ ดี:
- Smooth animations และ transitions
- Consistent color palette และ typography
- Thoughtful micro-interactions
- รายละเอียดเล็กน้อยที่แสดงความใส่ใจ (เช่น loading spinner ที่ match brand)

❌ ไม่ดี:
- แม้ฟังก์ชันดี แต่ design รก
- Inconsistent styling
- No personality in design
```

---

## 8. Von Restorff Effect (เอฟเฟกต์โวน เรสตอร์ฟฟ์)

> **"When multiple similar objects are present, the one that differs from the rest is most likely to be remembered."**

### ความหมาย
สิ่งที่แตกต่างจากกลุ่มจะถูกจดจำมากที่สุด

### หลักการสำคัญ
- **Highlight important items:** ใช้สี, size, หรือ animation เพื่อเน้น
- **Call to action:** CTA buttons ควรแตกต่างจากปุ่มอื่น
- **Error states:** Error messages ควรโดดเด่น
- **Don't overuse:** ถ้าทุกอย่างโดดเด่น ก็ไม่มีอะไรโดดเด่น

### การประยุกต์ใช้
```
✅ ดี:
Primary CTA: สีเข้ม + ขนาดใหญ่ + Shadow
Secondary: สีอ่อน + ขนาดเล็ก

❌ ไม่ดี:
ทุกปุ่มมีสีและขนาดเหมือนกัน
```

---

## 9. Tesler's Law (กฎของเทสเลอร์)

> **"For any system there is a certain amount of complexity that cannot be reduced."**

### ความหมาย
ทุกระบบมีความซับซ้อนที่หลีกเลี่ยงไม่ได้ สิ่งที่เราทำได้คือตัดสินใจว่าจะให้ใครรับภาระความซับซ้อนนั้น

### หลักการสำคัญ
- **Don't hide complexity, redistribute it:** ให้ระบบจัดการความซับซ้อนแทนผู้ใช้
- **Smart defaults:** ค่าเริ่มต้นที่ฉลาดลด cognitive load
- **Auto-fill:** ช่วยเติมข้อมูลที่รู้ได้
- **Don't oversimplify:** บางอย่างซับซ้อนโดยธรรมชาติ

### การประยุกต์ใช้
```
✅ ดี:
- Auto-detect country code จาก IP
- Suggest email format (@gmail.com, @outlook.com)
- Remember user preferences
- Smart password suggestions

❌ ไม่ดี:
- บังคับให้ผู้ใช้กรอกข้อมูลที่ระบบรู้ได้
- ซ่อนความซับซ้อนแต่ทำให้ใช้งานยากขึ้น
```

---

## 10. Doherty Threshold (เกณฑ์โดเฮอร์ตี้)

> **"Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other."**

### ความหมาย
ผู้ใช้จะ productive มากขึ้นเมื่อระบบตอบสนองภายใน 400ms

### หลักการสำคัญ
- **Instant feedback:** ตอบสนองทันทีหลัง interaction
- **Loading states:** แสดง progress แทน waiting
- **Optimistic UI:** แสดงผลลัพธ์ก่อน server response
- **Skeleton screens:** แสดง layout ระหว่างโหลด

### Response Time Guidelines

| Action | Maximum Response Time |
|--------|---------------------|
| Instant feedback | < 100ms |
| Quick response | < 300ms |
| Normal response | < 400ms |
| Loading indicator | < 1 second |
| Progress bar | < 10 seconds |

---

# 📖 PART 2: Gestalt Principles (หลักการเจสตัลท์)

## ที่มา
Gestalt Principles มาจากจิตวิทยาเยอรมันในช่วงต้นศตวรรษที่ 20 กล่าวว่า "whole is greater than the sum of its parts" — สมองมนุษย์มองเห็นรูปแบบและความสัมพันธ์โดยอัตโนมัติ

---

## 1. Law of Proximity (กฎความใกล้ชิด)

> **"Objects that are near each other tend to be grouped together."**

### ความหมาย
สิ่งที่อยู่ใกล้กันจะถูกมองว่าเป็นกลุ่มเดียวกัน

### การประยุกต์ใช้
```
✅ ดี:
┌──────────────────────────┐
│  Email: [____________]  │  ← Email ใกล้กับ input
│                          │
│  Password: [____________]│  ← Password ใกล้กับ input
│         [Forgot?]        │  ← ใกล้ password มากกว่า email
└──────────────────────────┘

❌ ไม่ดี:
┌──────────────────────────┐
│  Email:                 │
│  [____________]         │  ← ห่างเกินไป
│  Password:              │
│  [____________]        │
└──────────────────────────┘
```

### Design Tokens
```css
/* Related elements */
.form-group { gap: 16px; }

/* Unrelated sections */
.section { gap: 32px; }
```

---

## 2. Law of Similarity (กฎความเหมือน)

> **"Objects that share visual characteristics are perceived as related."**

### ความหมาย
สิ่งที่มีลักษณะเหมือนกัน (สี, ขนาด, shape) จะถูกมองว่าเป็นกลุ่มเดียวกัน

### การประยุกต์ใช้
```
✅ ดี:
- Primary buttons ทั้งหมดใช้สีเดียวกัน
- Secondary buttons ใช้สีเดียวกัน
- Navigation items มี style เดียวกัน

❌ ไม่ดี:
- ปุ่มที่ทำหน้าที่เดียวกันมีสีต่างกัน
- Navigation items มี style ไม่สม่ำเสมอ
```

---

## 3. Law of Closure (กฎการปิด)

> **"People tend to complete incomplete shapes to perceive a complete, whole object."**

### ความหมาย
สมองมนุษย์เติมเต็มช่องว่างให้สมบูรณ์โดยอัตโนมัติ

### การประยุกต์ใช้
```
✅ ดี:
- ใช้ background หรือ border เพื่อสร้างความรู้สึกของ "container"
- Progress indicators ที่แสดงสถานะโดยไม่ต้องมีขอบเต็ม
- Icons ที่ simplified แต่ recognizable

❌ ไม่ดี:
- Rounded cards ที่ไม่มี visual boundary ชัดเจน
- Empty states ที่ไม่มี visual cue
```

---

## 4. Law of Continuity (กฎความต่อเนื่อง)

> **"Elements arranged on a line or curve are perceived as more related than elements not on the line or curve."**

### ความหมาย
สายตามนุษย์เลื่อนไปตามเส้นหรือทิศทางต่อเนื่องโดยธรรมชาติ

### การประยุกต์ใช้
```
✅ ดี:
- Form fields ที่เรียงตัวในแนวตั้ง
- Navigation items ที่เรียงในแนวนอน
- Content ที่มี visual flow ชัดเจน

❌ ไม่ดี:
- Elements ที่กระจัดกระจายโดยไม่มี alignment
- Misaligned form fields
```

---

## 5. Law of Figure/Ground (กฎรูปทรง/พื้นหลัง)

> **"People instinctively perceive objects as either in the foreground or the background."**

### ความหมาย
สมองแบ่งสิ่งที่เห็นเป็น figure (foreground) และ ground (background)

### การประยุกต์ใช้
```
✅ ดี:
- Card design ที่มี shadow หรือ border ชัดเจน
- Modal ที่มี backdrop overlay
- Input fields ที่มี background ต่างจาก page

❌ ไม่ดี:
- Content ที่ blend กับ background
- Modal ที่ไม่มี visual separation
```

---

## 6. Common Region (กฎพื้นที่ร่วม)

> **"Elements are perceived as grouped if they share a common area."**

### ความหมาย
สิ่งที่อยู่ในพื้นที่เดียวกันจะถูกมองว่าเป็นกลุ่มเดียวกัน

### การประยุกต์ใช้
```
✅ ดี:
- Card containers ที่ wrap related content
- Section dividers ที่ใช้ background ต่างกัน
- Grouped settings options

┌─────────────────────────┐
│  Card Title             │
│  Card content here      │  ← Common region
└─────────────────────────┘
```

---

# 📖 PART 3: Nielsen's 10 Usability Heuristics

## โดย Jakob Nielsen (Nielsen Norman Group)

---

## 1. Visibility of System Status

> **"The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- Loading spinner ระหว่าง submit
- Progress bar สำหรับ multi-step forms
- Success/error messages ที่ชัดเจน
- "Sending..." "Processing..." states

❌ ไม่ควรทำ:
- Silent redirects
- No feedback หลัง action
- ปล่อยให้ user คาดเดา
```

---

## 2. Match Between System and Real World

> **"The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- "อีเมล" แทน "Email Address"
- "รหัสผ่าน" แทน "User Credential"
- "ลืมรหัสผ่าน?" แทน "Credential Recovery"
- Icon + text สำหรับ unclear actions

❌ ไม่ควรทำ:
- Technical jargon
- Internal terminology
- Abbreviations ที่ไม่คุ้นเคย
```

---

## 3. User Control and Freedom

> **"Users often choose system functions by mistake. Give them an easy way to undo and redo actions."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- "ย้อนกลับ" หลัง submit ผิด
- Clear error messages ที่บอกว่าทำอะไรผิด
- Easy exit จาก unwanted states
- Confirm dialog ก่อน destructive actions

❌ ไม่ควรทำ:
- No way to go back
- Permanent actions without confirmation
- บังคับให้ผ่านขั้นตอนที่ไม่ต้องการ
```

---

## 4. Consistency and Standards

> **"Users should not have to wonder whether different words, situations, or actions mean the same thing."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- คำว่า "Sign In" ใช้ทั้ง app
- สีปุ่ม primary/secondary คงที่
- Error style คงที่ทั้ง app
- Icon meanings คงที่

❌ ไม่ควรทำ:
- "Sign In" ในหน้าหนึ่ง, "Log In" ในอีกหน้า
- สีต่างกันสำหรับ error messages
- ตำแหน่งปุ่มไม่ตรงกันในหน้าที่คล้ายกัน
```

---

## 5. Error Prevention

> **"Even better than good error messages is a careful design that prevents problems from occurring."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- Real-time validation
- Disable submit จนกว่า form จะ valid
- Confirmation dialog ก่อน submit
- Auto-save drafts

❌ ไม่ควรทำ:
- แสดง error หลัง submit เท่านั้น
- Allow invalid data
- No guidance on what went wrong
```

---

## 6. Recognition Rather Than Recall

> **"Minimize the user's memory load by making elements, actions, and options visible."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- Label above input fields
- Visible icons สำหรับ actions
- Password requirements visible
- Remembered user preferences

❌ ไม่ควรทำ:
- Placeholder-only labels
- Require user จำข้อมูลจากหน้าก่อน
- Hidden actions/menus
```

---

## 7. Flexibility and Efficiency of Use

> **"Shortcuts hidden from novice users may speed up the interaction for the expert user."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- Default values ที่เหมาะกับ majority
- Optional advanced options
- Keyboard shortcuts สำหรับ power users
- Recent/frequent items

❌ ไม่ควรทำ:
- Show everything to everyone
- No way to customize
- Slow workflows for everyone
```

---

## 8. Aesthetic and Minimalist Design

> **"Interfaces should not contain information that is irrelevant or rarely needed."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- Only essential fields ใน form
- Progressive disclosure สำหรับ advanced options
- Clear visual hierarchy
- Generous whitespace

❌ ไม่ควรทำ:
- แสดงทุกอย่างพร้อมกัน
- Visual clutter
- Decorative elements ที่ไม่จำเป็น
```

---

## 9. Help Users Recognize and Recover from Errors

> **"Error messages should be expressed in plain language, precisely indicate the problem, and suggest a solution."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- "อีเมลไม่ถูกต้อง" แทน "Error 400"
- "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
- แนะนำวิธีแก้ไข
- แยก error messages ชัดเจน

❌ ไม่ควรทำ:
- "Invalid input"
- "Error occurred"
- Technical error codes
```

---

## 10. Help and Documentation

> **"It's best if the system doesn't need documentation. However, it may be necessary to provide help that is easy to search and focused on the user's tasks."**

### การประยุกต์ใช้
```
✅ ควรทำ:
- Tooltip สำหรับ confusing elements
- Help button ที่เข้าถึงง่าย
- FAQ สำหรับ common questions
- Contextual help

❌ ไม่ควรทำ:
- ไม่มี help อะไรเลย
- Documentation ที่ซ่อนลึก
- Help ที่ไม่เกี่ยวกับ task
```

---

# 📖 PART 4: Mobile-Specific UX Laws

## 1. Touch Target Size (Apple HIG)

| Element Type | Minimum Size |
|-------------|-------------|
| All controls | 44×44pt |
| Recommended | 48×48pt |
| Primary actions | 52×52pt |

## 2. Thumb Zone Design

```
┌────────────────────────────────────┐
│                                    │
│  Zone 1: Difficult (stretch)      │
│  หลีกเลี่ยงวาง actions สำคัญที่นี่ │
│                                    │
├────────────────────────────────────┤
│                                    │
│  Zone 2: Comfortable              │
│  วาง secondary actions ที่นี่       │
│                                    │
├────────────────────────────────────┤
│                                    │
│  Zone 3: Natural (thumb rest)     │
│  วาง primary actions และ nav ที่นี่ │
│                                    │
└────────────────────────────────────┘
```

## 3. Safe Area Handling

```css
/* For notched devices */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

## 4. One-Handed Use

- วาง interactive elements ใน thumb zone
- ใช้ gesture ที่เป็นธรรมชาติ
- หลีกเลี่ยง require reach ถึงขอบบน

---

# 📖 PART 5: Application to DailyStack AuthPage

## Current Implementation Analysis

### ✅ Strengths (ปรับตาม Laws แล้ว)

| Law | Implementation | Status |
|-----|---------------|--------|
| Fitts's Law | Touch targets 52px+ | ✅ Pass |
| Hick's Law | Minimal form fields | ✅ Pass |
| Miller's Law | 3 inputs only | ✅ Pass |
| Proximity | Clear spacing between groups | ✅ Pass |
| Aesthetic-Usability | Lime green branding | ✅ Pass |

### ⚠️ Areas for Improvement

| Issue | Law Reference | Recommendation |
|-------|--------------|----------------|
| No success animation after login | Peak-End Rule | เพิ่ม success celebration |
| Error messages could be clearer | Nielsen #9 | เพิ่ม specific guidance |
| No biometric option | Jakob's Law | ผู้ใช้คุ้นเคยกับ Face ID |
| Trust badges small (10px) | Fitts's Law | เพิ่มขนาด touch target |
| No keyboard handling | Mobile UX | scroll to focused input |

### Quick Wins

1. **เพิ่ม success animation** — Peak-End Rule
2. **ขยาย trust badges** — Fitts's Law
3. **เพิ่ม biometric option** — Jakob's Law
4. **ปรับปรุง error messages** — Nielsen #9

---

# 📖 PART 6: Design Checklist

## Pre-Implementation Checklist

```
□ Touch targets ≥ 44px
□ Thumb zone optimized
□ Safe areas handled
□ Visual hierarchy clear
□ Spacing consistent
□ Error states visible
□ Loading states present
□ Success feedback clear
□ Labels visible (not placeholder-only)
□ Autocomplete attributes
□ Focus states visible
□ Color contrast passes WCAG
□ Consistent with brand
□ Consistent across pages
```

## Post-Implementation Checklist

```
□ Tested on real device
□ Tested with keyboard
□ Tested with screen reader
□ Touch targets feel good
□ Visual hierarchy scannable
□ Error recovery easy
□ Task completion smooth
□ User feedback positive
```

---

# 📚 References

1. Yablonski, J. (2024). *Laws of UX: Using Psychology to Design Better Products & Services* (2nd ed.). O'Reilly Media.
2. Nielsen, J. (1994). *10 Usability Heuristics for User Interface Design*. Nielsen Norman Group.
3. Wertheimer, M. (1923). *Gestalt Theory*. Knox.
4. Apple Inc. *Human Interface Guidelines*.
5. Material Design. *Material Design Guidelines*.
6. Nielsen Norman Group. *Fitts's Law and Its Applications*.

---

**Document Version:** 1.0
**Last Updated:** June 15, 2026
**Author:** Mavis (Senior UX/UI Designer)
