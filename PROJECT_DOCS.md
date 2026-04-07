# 📘 Project Documentation - Lotto Webshop System

> **ระบบจัดการร้านขายหวยออนไลน์แบบ Multi-Tenant Platform**  
> เวอร์ชัน: **1.0.0** | สร้างเมื่อ: กุมภาพันธ์ 2026

---

## 📋 สารบัญ

1. [Project Overview](#-1-project-overview)
2. [System Architecture](#-2-system-architecture)
3. [Key Features](#-3-key-features)
4. [Technology Stack](#-4-technology-stack)
5. [Setup & Installation](#-5-setup--installation)
6. [API Documentation (Brief)](#-6-api-documentation-brief)
7. [Database Schema](#-7-database-schema)
8. [Security & Authentication](#-8-security--authentication)

---

## 🎯 1. Project Overview

### ภาพรวมโปรเจกต์

**Lotto Webshop** คือระบบจัดการร้านขายหวยออนไลน์แบบครบวงจร (Full-Stack Web Application) ที่รองรับการทำงานแบบ **Multi-Tenant** ซึ่งหมายความว่าระบบเดียวสามารถรองรับหลายร้านค้าพร้อมกัน โดยแต่ละร้านจะมี **Subdomain** และข้อมูลที่แยกออกจากกันอย่างสมบูรณ์

### Business Logic หลัก

1. **ระบบร้านค้าแยกอิสระ (Multi-Tenant)**
   - แต่ละร้านค้ามี Subdomain เฉพาะตัว (เช่น `shop1.ntlot.com`)
   - ร้านค้าสามารถปิด/เปิดการให้บริการได้อิสระ
   - การจัดการข้อมูลแยกตาม `shop_id`

2. **ระบบหวยหลากหลายประเภท**
   - รองรับหวยรายวัน (Daily Lottery) และหวยรายเดือน (Monthly Lottery)
   - กำหนดเวลาเปิด-ปิดรับแทงได้อิสระ รองรับหวยข้ามวัน
   - แต่ละประเภทหวยสามารถตั้งค่าอัตราจ่ายแบบต่างกันได้

3. **ระบบการแทงและจัดการโพย (Betting System)**
   - Member แทงผ่าน Web (ตัดเครดิต Real-time)
   - รองรับการแทงหลายรูปแบบ: 3 ตัวบน, 2 ตัวบน/ล่าง, โต๊ด, วิ่งบน/ล่าง
   - ตรวจเลขอั้น (CLOSE) และเลขปิดครึ่ง (HALF) แบบ Real-time

4. **ระบบความเสี่ยง (Risk Management)**
   - Admin สามารถปิดเลข (CLOSE) หรือปิดครึ่ง (HALF) ได้แบบ Real-time
   - รองรับการตั้งค่าขั้นต่ำ/สูงสุดต่อการแทงแต่ละประเภท
   - คำนวณความเสี่ยงและสถิติการแทงประจำวัน

5. **ระบบเครดิต & การเงิน**
   - Admin เติม/ลด Credit ให้ Member
   - ตัดเครดิตอัตโนมัติเมื่อแทง
   - จ่ายรางวัลอัตโนมัติเมื่อออกผลรางวัล


---

## 🏗️ 2. System Architecture

### ภาพรวมสถาปัตยกรรม

ระบบประกอบด้วย 3 ส่วนหลักที่ทำงานประสานกัน:

```
┌─────────────────┐      HTTP/REST API        ┌──────────────────┐
│                 │ ◄────────────────────── ► │                  │
│   Frontend      │      JSON + JWT Token     │   Backend API    │
│  (React + TS)   │                           │   (FastAPI)      │
│                 │ ──────────────────────►   │                  │
└────────┬────────┘   WebSocket (Realtime)    └────────┬─────────┘
         │                                             │
         │                                             │
         │            ┌─────────────────────┐          │
         └────────────┤   Supabase Client   ├──────────┘
                      │  (PostgreSQL DB +   │
                      │   Realtime Engine)  │
                      └─────────────────────┘
```

---

### 🎨 Frontend Architecture

**Tech Stack:** React 19 + TypeScript + Vite

#### โครงสร้าง Folder หลัก

```
frontend/src/
├── api/               # HTTP Client Configuration
│   ├── client.ts      # Axios instance พร้อม Token interceptor
│   └── auth.ts        # Authentication API calls
├── contexts/          # Global State Management (React Context API)
│   ├── AuthContext    # User authentication state
│   └── ShopContext    # Shop configuration & subdomain resolver
├── pages/             # Page Components (แยกตาม Role)
│   ├── superadmin/    # หน้าจอสำหรับ SuperAdmin
│   ├── admin/         # หน้าจอสำหรับ Admin
│   ├── member/        # หน้าจอสำหรับ Member (แทงหวย, ประวัติ)
│   └── dashboard/     # หน้ารายงานและสถิติร่วม
├── layouts/           # Layout Components (Sidebar, Navbar)
│   ├── SuperAdminLayout.tsx
│   ├── AdminLayout.tsx
│   └── MemberLayout.tsx
├── components/        # Reusable Components
│   ├── modals/        # Modal dialogs
│   ├── admin/         # Components เฉพาะ Admin
│   └── RoleGuard.tsx  # Protected Route HOC
├── types/             # TypeScript Type Definitions
├── utils/             # Utility Functions & Helpers
└── App.tsx            # Main Router & App Entry
```

#### State Management Strategy

1. **AuthContext** - จัดการ User Session
   - เก็บข้อมูล User (id, role, credit_balance)
   - Login/Logout functions
   - Auto-refresh user data

2. **ShopContext** - Multi-Tenant Resolver
   - แยก Subdomain อัตโนมัติ (เช่น `shop1.ntlot.com` → load Shop ID)
   - โหลด Shop Config (logo, theme_color, name)
   - แสดงหน้า 404 หากร้านปิดหรือไม่มีอยู่จริง

3. **Component-Level State** - ใช้ `useState` สำหรับ Local UI State

#### Routing Strategy

- **Role-Based Access Control** ผ่าน `<RoleGuard>`
- **Auto-Redirect** ตาม Role:
  - `superadmin` → `/super/dashboard`
  - `admin` → `/admin/dashboard`
  - `member` → `/play`

---

### ⚙️ Backend Architecture

**Tech Stack:** FastAPI + SQLAlchemy + PostgreSQL

#### สถาปัตยกรรมแบบ Layered Architecture

```
backend/app/
├── main.py                 # FastAPI Application Entry Point
├── api/
│   └── v1/
│       ├── router.py       # API Router (รวม Endpoints ทั้งหมด)
│       └── endpoints/      # API Endpoints (แยกตาม Domain)
│           ├── auth.py          # Login, Register
│           ├── users.py         # User Management
│           ├── shops.py         # Shop Management
│           ├── play/            # ⭐ Play Domain (แทงหวย)
│           │   ├── tickets.py       # แทงโพย, ดูประวัติ, ยกเลิก
│           │   ├── config.py        # จัดการหวย (CRUD)
│           │   ├── risk.py          # ปิดเลข/เลขอั้น
│           │   └── stats.py         # สถิติ, รายงาน
│           ├── reward.py        # คำนวณรางวัล, ประกาศผล
│           ├── upload.py        # อัปโหลดรูปภาพ
│           └── system.py        # System utilities
├── core/                   # Core Business Logic & Utilities
│   ├── config.py           # Settings (เวลาตัดรอบ, JWT Config)
│   ├── security.py         # Password hashing, JWT creation
│   ├── game_logic.py       # Logic ตรวจรางวัล (check_is_win_precise)
│   ├── lotto_cache.py      # Cache หวยที่เปิด/ปิด
│   ├── risk_cache.py       # Cache เลขอั้น
│   └── notify.py           # LINE Notification
├── db/                     # Database Configuration
│   ├── session.py          # Database Session Factory
│   └── base_class.py       # SQLAlchemy Base
├── models/                 # SQLAlchemy ORM Models
│   ├── user.py             # User, UserRole
│   ├── shop.py             # Shop
│   └── lotto.py            # LottoType, Ticket, TicketItem, etc.
└── schemas.py              # Pydantic Schemas (Request/Response)
```

#### การออกแบบ API (RESTful Principles)

1. **Authentication Layer** - JWT Bearer Token
2. **Role-Based Permissions** - Dependency Injection ผ่าน `Depends()`
3. **Multi-Tenant Isolation** - กรองข้อมูลด้วย `shop_id` อัตโนมัติ
4. **Transaction Safety** - ใช้ `with_for_update()` ในการตัดเครดิต

#### ตัวอย่าง Core Logic: การแทงโพย (Ticket Submission)

```python
# ขั้นตอนการแทงโพย (tickets.py)
1. ตรวจสอบหวยเปิด/ปิด + เวลาปิดรับ (รองรับข้ามวัน)
2. คำนวณ round_date ตามเวลาตัดรอบ (เช่น 05:20 น.)
3. ดึงเลขอั้น (NumberRisk) จาก Cache
4. คำนวณยอดเงินและอัตราจ่าย (รองรับ CLOSE/HALF)
5. ล็อค User (with_for_update) + ตัดเครดิต
6. บันทึก Ticket + TicketItems
7. Commit Transaction + ส่ง LINE Notification (Background)
```

---

### 🗄️ Database Architecture

**Database:** PostgreSQL 15+ (ผ่าน Supabase)

#### ความสัมพันธ์หลักของข้อมูล (ER Diagram แบบย่อ)

```
┌──────────┐         ┌──────────┐         ┌─────────────┐
│  shops   │◄────────┤  users   │◄────────┤  tickets    │
│  (ร้าน)   │  1:N    │ (ผู้ใช้)    │  1:N    │   (โพย)     │
└──────────┘         └────┬─────┘         └──────┬──────┘
                          │                      │
                          │ N:1                  │ 1:N
                          │                      │
                     ┌────▼──────┐         ┌─────▼──────────┐
                     │lotto_types│         │ ticket_items   │
                     │  (หวย)    │         │ (รายการแทง)    │
                     └────┬──────┘         └────────────────┘
                          │
                          │ 1:N
                     ┌────▼──────────┐
                     │ number_risks  │
                     │  (เลขอั้น)      │
                     └───────────────┘
```

#### ตารางสำคัญ (Key Tables)

| ตาราง | จุดประสงค์ | Key Columns |
|-------|-----------|-------------|
| `shops` | เก็บข้อมูลร้านค้า | `id`, `subdomain`, `name`, `is_active`, `line_channel_token` |
| `users` | ผู้ใช้งานทุก Role | `id`, `username`, `role`, `shop_id`, `credit_balance`, `locked_until` |
| `lotto_types` | ประเภทหวย | `id`, `code`, `name`, `open_time`, `close_time`, `open_days`, `is_active` |
| `rate_profiles` | อัตราจ่ายแบบต่างๆ | `id`, `rates` (JSONB: `{"3top": 900, "2up": 90}`) |
| `tickets` | บิลการแทง | `id`, `user_id`, `lotto_type_id`, `round_date`, `total_amount`, `status` |
| `ticket_items` | รายการในบิล | `id`, `ticket_id`, `number`, `bet_type`, `amount`, `reward_rate`, `winning_amount` |
| `number_risks` | เลขอั้น/ปิดครึ่ง | `id`, `lotto_type_id`, `number`, `risk_type` (`CLOSE`/`HALF`) |
| `lotto_results` | ผลรางวัล | `id`, `lotto_type_id`, `round_date`, `top_3`, `bottom_2`, `reward_data` |

#### Row Level Security (RLS)

ใช้ Supabase RLS เพื่อ:
- อนุญาตให้ Frontend อ่านข้อมูล `users`, `number_risks`, `lotto_types` ผ่าน Realtime
- Backend ใช้ Service Key สำหรับ CRUD ทุกตาราง

---

## ✨ 3. Key Features

### 🔐 ฟีเจอร์ตาม Role

#### 👑 SuperAdmin (ผู้ดูแลระบบ)

- ✅ จัดการร้านค้าทั้งหมด (เปิด/ปิด Shop, สร้าง/ลบ Shop)
- ✅ สร้าง Template หวยกลาง (ให้ร้านค้าคัดลอกไปใช้)
- ✅ สร้าง Rate Profile กลาง (อัตราจ่ายมาตรฐาน)
- ✅ ดูสถิติและรายงานของทุกร้าน
- ✅ สร้างบัญชี Admin ให้ร้านค้าต่างๆ
- ✅ เข้าถึงระบบผ่าน Main Domain (ไม่มี Subdomain)

#### 🛠️ Admin (เจ้าของร้าน/ผู้จัดการร้าน)

- ✅ จัดการข้อมูลร้านตัวเอง (ชื่อ, โลโก้, สี Theme, LINE Token)
- ✅ จัดการประเภทหวย (เพิ่ม/ลบ/แก้ไข, เปิด/ปิดรับแทง)
- ✅ ตั้งค่าอัตราจ่ายแยกตามหวยแต่ละประเภท
- ✅ จัดการสมาชิก (สร้าง Member, เติม/ลด Credit, ระงับบัญชี)
- ✅ ปิดเลข/เลขอั้น Real-time (CLOSE, HALF)
- ✅ ดูสถิติการแทง (ยอดเสี่ยง, เลขที่ถูกแทงมาก, สรุปรายวัน)
- ✅ ประกาศผลรางวัล (ระบบคำนวณและจ่ายเงินอัตโนมัติ)
- ✅ ดูประวัติโพยทั้งหมดในร้าน + ยกเลิกโพย (รองรับคืนเงิน/ดึงรางวัลคืน)
- ✅ ดูรายงานกำไร/ขาดทุนประจำวัน

#### 👤 Member (ลูกค้า/สมาชิก)

- ✅ ดูหวยที่เปิดรับแทง (แสดงเฉพาะที่ `is_active = true`)
- ✅ เลือกหวยและแทงโพย (ระบบตรวจเลขอั้น + ตัดเครดิต Real-time)
- ✅ ดูเครดิตคงเหลือ Real-time (ใช้ Supabase Realtime)
- ✅ ดูประวัติการแทงของตัวเอง (กรองตามวัน, หวย, สถานะ)
- ✅ ดูผลรางวัลย้อนหลัง
- ✅ ยกเลิกโพยที่ยังไม่ออกผล (ภายในเวลาที่กำหนด)
- ✅ ดูลิงก์ผลรางวัลภายนอก (เช่น สลากกินแบ่งรัฐบาล)

---

### 🎲 ฟีเจอร์เด่นพิเศษ

1. **Realtime Updates (ผ่าน Supabase Realtime)**
   - เครดิตอัปเดททันทีเมื่อ Admin เติม/ลด
   - เลขอั้นอัปเดททันทีเมื่อ Admin ปิดเลข
   - สถานะหวยเปิด/ปิด Real-time

2. **Multi-Tenant ผ่าน Subdomain**
   - ร้าน A: `shopA.ntlot.com`
   - ร้าน B: `shopB.ntlot.com`
   - แยกข้อมูลอย่างเป็นอิสระ 100%

3. **รองรับหวยข้ามวัน**
   - หวยที่เปิด 08:00 ปิด 00:10 (วันถัดไป) ทำงานได้ถูกต้อง

4. **ระบบตัดรอบวันใหม่ (Day Cutoff)**
   - ตั้งค่าเวลาตัดรอบได้ (เช่น 05:20 น.)
   - บิลที่สร้างก่อน 05:20 น. จะถือเป็นงวดเมื่อวาน

5. **ระบบความเสี่ยง (Risk Management)**
   - ปิดเลข (CLOSE): ไม่รับแทงเลขนั้นเลย
   - ปิดครึ่ง (HALF): รับแทงได้ แต่อัตราจ่ายลดครึ่ง


6. **Security Features**
   - Brute Force Protection (ล็อคบัญชี 15 นาทีหากใส่รหัสผิด 5 ครั้ง)
   - JWT Token มีอายุ 30 นาที
   - Password Hashing ด้วย bcrypt

---

## 🛠️ 4. Technology Stack

### Frontend Dependencies

| Library | Version | จุดประสงค์ |
|---------|---------|-----------|
| **React** | 19.2.3 | UI Framework |
| **TypeScript** | 5.9.3 | Type-safe Development |
| **Vite** | 7.2.7 | Build Tool & Dev Server |
| **React Router DOM** | 7.11.0 | Client-side Routing |
| **Axios** | 1.13.2 | HTTP Client |
| **@supabase/supabase-js** | 2.93.1 | Realtime Database Client |
| **jwt-decode** | 4.0.0 | JWT Token Decoder |
| **react-hot-toast** | 2.6.0 | Toast Notifications |
| **lucide-react** | 0.562.0 | Icon Library |
| **TailwindCSS** | 4.1.18 | Utility-first CSS Framework |
| **html-to-image** | 1.11.13 | Capture DOM as Image (สำหรับโพย) |
| **uuid** | 13.0.0 | Generate Unique IDs |

### Backend Dependencies

| Package | Version | จุดประสงค์ |
|---------|---------|-----------|
| **FastAPI** | latest | Modern Web Framework |
| **Uvicorn** | latest | ASGI Server |
| **SQLAlchemy** | latest | ORM (Database Models) |
| **psycopg2-binary** | latest | PostgreSQL Driver |
| **Pydantic** | latest | Data Validation & Settings |
| **python-jose** | latest | JWT Token Creation/Validation |
| **passlib** | latest | Password Hashing |
| **bcrypt** | 4.0.1 | Secure Password Hashing Algorithm |
| **supabase** | latest | Supabase Python Client |
| **line-bot-sdk** | latest | LINE Messaging API |
| **pytz** | latest | Timezone Management (Asia/Bangkok) |
| **alembic** | latest | Database Migration Tool |
| **python-dotenv** | latest | Environment Variables Management |

### Infrastructure & Services

- **Database:** PostgreSQL 15+ (Supabase)
- **Realtime Engine:** Supabase Realtime
- **File Storage:** Supabase Storage (สำหรับโลโก้และรูปภาพ)
- **Deployment:**
  - Frontend: Vercel (รองรับ Subdomain Routing)
  - Backend: Google Cloud Run / Docker Container
- **External API:** LINE Messaging API

---

## 🚀 5. Setup & Installation

### 📦 ข้อกำหนดเบื้องต้น (Prerequisites)

- **Node.js** >= 18.x
- **Python** >= 3.10
- **PostgreSQL** >= 15 (หรือ Supabase Account)
- **Git**

---

### 🎨 Frontend Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd Project_lotto_webshop/frontend
```

#### 2. ติดตั้ง Dependencies

```bash
npm install
```

#### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 4. รันโหมด Development

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173` (หรือตาม Terminal แจ้ง)

#### 5. Build Production

```bash
npm run build
```

ไฟล์ที่ Build เสร็จจะอยู่ใน `frontend/dist/`

---

### ⚙️ Backend Setup

#### 1. เข้าโฟลเดอร์ Backend

```bash
cd Project_lotto_webshop/backend
```

#### 2. สร้าง Virtual Environment (แนะนำ)

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

#### 3. ติดตั้ง Dependencies

```bash
pip install -r requirements.txt
```

#### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lotto_db
SECRET_KEY=your-secret-key-min-32-chars-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# เวลาตัดรอบวันใหม่ (เช่น 05:20:00)
DAY_CUTOFF_TIME=05:20:00
```

> **หมายเหตุ:** ใช้ `SUPABASE_KEY` แบบ **Service Role** สำหรับ Backend (ไม่ใช่ Anon Key)

#### 5. รัน Database Migration

```bash
# ถ้าใช้ Alembic (ถ้ามี migration files)
alembic upgrade head

# หรือรัน SQL Script โดยตรง
psql -U user -d lotto_db -f ../db.sql
```

#### 6. รัน Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

เปิดเบราว์เซอร์ที่ `http://localhost:8000` (จะเห็น `{"status": "online"}`)

API Documentation: `http://localhost:8000/docs` (Swagger UI)

#### 7. รัน Production (Docker - Optional)

```bash
docker build -t lotto-backend .
docker run -p 8000:8000 --env-file .env lotto-backend
```

---

### 🗄️ Database Setup (Supabase)

#### 1. สร้าง Project ใน Supabase
- ไปที่ [supabase.com](https://supabase.com)
- สร้าง Project ใหม่

#### 2. รัน SQL Schema
- เข้า SQL Editor ใน Supabase Dashboard
- คัดลอกเนื้อหาจากไฟล์ `db.sql` วางแล้วรัน

#### 3. เปิดใช้งาน Realtime
- ไป Settings → Replication
- เปิด Realtime สำหรับตาราง: `users`, `number_risks`, `lotto_types`

#### 4. คัดลอก API Keys
- ไป Settings → API
- คัดลอก:
  - **URL**: `VITE_SUPABASE_URL` (Frontend) + `SUPABASE_URL` (Backend)
  - **Anon Key**: `VITE_SUPABASE_ANON_KEY` (Frontend)
  - **Service Role Key**: `SUPABASE_KEY` (Backend)

---

## 📡 6. API Documentation (Brief)

### Base URL

```
Production: https://api.ntlot.com/api/v1
Development: http://localhost:8000/api/v1
```

### Authentication

ทุก Endpoint (ยกเว้น `/auth/login` และ `/auth/register`) ต้องแนบ JWT Token:

```
Authorization: Bearer <access_token>
```

---

### 🔐 Authentication Endpoints

#### POST `/auth/login`

**Request:**
```json
{
  "username": "member01",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### POST `/auth/register`

**Request:**
```json
{
  "username": "newmember",
  "password": "password123",
  "full_name": "สมชาย ใจดี",
  "shop_id": "uuid-of-shop"
}
```

**Response:** User Object

---

### 👤 User Endpoints

#### GET `/users/me`

ดึงข้อมูล User ปัจจุบัน (จาก JWT Token)

**Response:**
```json
{
  "id": "uuid",
  "username": "member01",
  "role": "member",
  "shop_id": "uuid",
  "shop_name": "ร้านหวยเจริญ",
  "credit_balance": 5000.00,
  "full_name": "สมชาย ใจดี"
}
```

#### PATCH `/users/{user_id}/credit`

เติม/ลดเครดิต (เฉพาะ Admin/SuperAdmin)

**Request:**
```json
{
  "amount": 1000.00,
  "operation": "ADD",
  "note": "เติมเงิน"
}
```

---

### 🎲 Play Endpoints (การแทงหวย)

#### GET `/play/lottos`

ดึงรายการหวยทั้งหมด (ของร้านตัวเอง)

**Query Params:**
- `is_active` (optional): `true`/`false`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "หวยหุ้นไทย",
    "code": "SET_TH",
    "open_time": "09:30",
    "close_time": "16:30",
    "is_active": true,
    "rate_profile": {
      "rates": {
        "3top": 900,
        "2up": 90,
        "2down": 90
      }
    }
  }
]
```

#### POST `/play/submit_ticket`

แทงโพย

**Request:**
```json
{
  "lotto_type_id": "uuid",
  "note": "โพยงวดวันนี้",
  "items": [
    {
      "number": "123",
      "bet_type": "3top",
      "amount": 100
    },
    {
      "number": "45",
      "bet_type": "2up",
      "amount": 50
    }
  ]
}
```

**Response:** Ticket Object พร้อม `total_amount` และ `round_date`

#### GET `/play/history`

ดูประวัติการแทงของตัวเอง

**Query Params:**
- `date` (optional): `YYYY-MM-DD`
- `start_date`, `end_date` (optional): ช่วงวันที่
- `lotto_type_id` (optional): กรองตามหวย
- `status` (optional): `PENDING`, `WIN`, `LOSE`, `CANCELLED`, `ALL`
- `skip`, `limit`: Pagination

**Response:** Array ของ Ticket Objects

#### PATCH `/play/tickets/{ticket_id}/cancel`

ยกเลิกโพย (รองรับคืนเงิน + ดึงรางวัลคืน)

**Response:**
```json
{
  "status": "success",
  "refunded_cost": 150.00,
  "reclaimed_reward": 0,
  "net_credit_change": 150.00
}
```

---

### 🛡️ Risk Management Endpoints

#### GET `/play/risks`

ดึงเลขอั้น/ปิดครึ่งทั้งหมด

#### POST `/play/risks`

ปิดเลข (เฉพาะ Admin)

**Request:**
```json
{
  "lotto_type_id": "uuid",
  "number": "123",
  "risk_type": "CLOSE",
  "specific_bet_type": "3top"
}
```

#### DELETE `/play/risks/{risk_id}`

ลบเลขอั้น (เฉพาะ Admin)

---

### 🏆 Reward Endpoints

#### POST `/reward/announce`

ประกาศผลรางวัล (เฉพาะ Admin/SuperAdmin)

**Request:**
```json
{
  "lotto_type_id": "uuid",
  "round_date": "2026-02-05",
  "top_3": "123",
  "bottom_2": "45",
  "reward_data": {
    "3front": ["123", "456"],
    "2front": ["12", "34"]
  }
}
```

**Response:** คำนวณและจ่ายรางวัลอัตโนมัติ

---

### 🏪 Shop Endpoints

#### GET `/shops/config/{subdomain}`

ดึง Config ของร้าน (ใช้สำหรับ Frontend load Shop)

**Response:**
```json
{
  "id": "uuid",
  "name": "ร้านหวยเจริญ",
  "subdomain": "charoen",
  "logo_url": "https://...",
  "theme_color": "#2563EB",
  "is_active": true
}
```

#### PATCH `/shops/{shop_id}`

อัปเดทข้อมูลร้าน (เฉพาะ Admin/SuperAdmin)

---

### 📊 Statistics Endpoints

#### GET `/play/daily_stats`

สถิติการแทงประจำวัน (เฉพาะ Admin)

**Response:**
```json
{
  "date": "2026-02-05",
  "total_bets": 50000.00,
  "total_risk": {
    "123": 5000,
    "456": 3000
  },
  "top_numbers": [
    {"number": "123", "total": 5000}
  ]
}
```

---

## 🗄️ 7. Database Schema

### ภาพรวม Schema

```sql
-- ร้านค้า
CREATE TABLE shops (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    line_channel_token TEXT,
    ...
);

-- ผู้ใช้งาน (3 Role: superadmin, admin, member)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    shop_id UUID REFERENCES shops(id),
    credit_balance DECIMAL(15, 2) DEFAULT 0.00,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    ...
);

-- โปรไฟล์อัตราจ่าย
CREATE TABLE rate_profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    rates JSONB DEFAULT '{}',  -- {"3top": 900, "2up": 90}
    shop_id UUID REFERENCES shops(id),
    ...
);

-- ประเภทหวย
CREATE TABLE lotto_types (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(20) NOT NULL,
    shop_id UUID REFERENCES shops(id),
    rate_profile_id UUID REFERENCES rate_profiles(id),
    open_time VARCHAR(20),
    close_time VARCHAR(20),
    open_days JSONB DEFAULT '[]',  -- ["MON", "TUE"]
    is_active BOOLEAN DEFAULT TRUE,
    rules JSONB DEFAULT '{}',
    ...
);

-- เลขอั้น/ปิดครึ่ง
CREATE TABLE number_risks (
    id UUID PRIMARY KEY,
    lotto_type_id UUID REFERENCES lotto_types(id),
    number VARCHAR NOT NULL,
    risk_type VARCHAR NOT NULL,  -- 'CLOSE' or 'HALF'
    specific_bet_type VARCHAR DEFAULT 'ALL',
    ...
);

-- บิลการแทง
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    shop_id UUID REFERENCES shops(id),
    user_id UUID REFERENCES users(id),
    lotto_type_id UUID REFERENCES lotto_types(id),
    round_date DATE,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    ...
);

-- รายการในบิล
CREATE TABLE ticket_items (
    id UUID PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id),
    number TEXT NOT NULL,
    bet_type VARCHAR(20) NOT NULL,  -- 3top, 2up, 2down, etc.
    amount DECIMAL(15, 2) NOT NULL,
    reward_rate DECIMAL(15, 2) NOT NULL,
    winning_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- ผลรางวัล
CREATE TABLE lotto_results (
    id UUID PRIMARY KEY,
    lotto_type_id UUID REFERENCES lotto_types(id),
    round_date DATE NOT NULL,
    top_3 VARCHAR(10),
    bottom_2 VARCHAR(10),
    reward_data JSONB NOT NULL,
    CONSTRAINT unique_result_per_round UNIQUE (lotto_type_id, round_date)
);
```

### ประเภทการแทง (Bet Types)

| Bet Type | คำอธิบาย | ตัวอย่างอัตราจ่าย |
|----------|---------|------------------|
| `3top` | 3 ตัวบน (ตรง) | 900 |
| `3tod` | 3 ตัวโต๊ด | 150 |
| `2up` | 2 ตัวบน | 90 |
| `2down` | 2 ตัวล่าง | 90 |
| `run_up` | วิ่งบน (1 ตัว) | 3.5 |
| `run_down` | วิ่งล่าง (1 ตัว) | 4.0 |

---

## 🔒 8. Security & Authentication

### JWT Token Flow

```
1. User Login → Backend validate → Generate JWT Token
2. Frontend เก็บ Token ใน localStorage
3. ทุก API Request → Axios Interceptor แนบ Token ใน Header
4. Backend Middleware → Validate Token → Extract user_id + role
5. Execute API Logic ตาม Role-Based Permissions
```

### Password Security

- **Hashing Algorithm:** bcrypt (cost factor = 12)
- **No Plain-text Password Storage**
- **Brute Force Protection:** ล็อคบัญชี 15 นาที หลังใส่รหัสผิด 5 ครั้ง

### Role-Based Access Control (RBAC)

```python
# Backend Dependency Injection
def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.role not in [UserRole.admin, UserRole.superadmin]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

### Multi-Tenant Data Isolation

- ทุก Query กรองด้วย `shop_id` อัตโนมัติ
- Superadmin เท่านั้นที่เข้าถึงข้ามร้านได้
- Frontend ตรวจสอบ `shop_id` ของ User ก่อนแสดงข้อมูล

---

## 📝 License & Contact

- **License:** Proprietary (ไม่เปิดให้ใช้งานเชิงพาณิชย์โดยไม่ได้รับอนุญาต)
- **Version:** 1.0.0
- **Last Updated:** กุมภาพันธ์ 2026

---

## 📚 Additional Resources

- **Swagger API Docs:** `{BACKEND_URL}/docs`
- **ReDoc API Docs:** `{BACKEND_URL}/redoc`
- **CHANGELOG:** ดูไฟล์ `CHANGELOG_FIXES.md` สำหรับประวัติการแก้ไข 

---

> **หมายเหตุ:**เวอร์ชันล่าสุด (4 กุมภาพันธ์ 2026)  
> หากมีการอัปเดตระบบ ควรปรับปรุงเอกสารตามไปด้วย

---

**💡 Tips สำหรับ Developer ใหม่:**

1. เริ่มต้นที่ `db.sql` เพื่อเข้าใจโครงสร้างข้อมูล
2. ดู `App.tsx` (Frontend) และ `main.py` (Backend) เพื่อเข้าใจ Entry Point
3. ศึกษา `tickets.py` เพื่อเข้าใจ Business Logic หลัก
4. ทดสอบ API ผ่าน Swagger UI ก่อนเขียน Frontend
5. ใช้ Supabase Dashboard ตรวจสอบข้อมูลใน Database แบบ Real-time

---

**Happy Coding! 🚀**
