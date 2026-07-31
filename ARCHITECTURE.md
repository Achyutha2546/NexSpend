# NexSpend System Architecture & Production Documentation

## Overview
NexSpend is an enterprise-grade personal financial management platform built using React (TypeScript), Vite, Node.js (Express), MongoDB, Firebase Authentication, Progressive Web App (PWA) offline-first architecture, and a modular AI advisory engine.

---

## 1. System Architecture Diagram

```
[ Frontend (React + Vite + PWA + IDB) ]
        │
        ▼ (HTTPS REST / Bearer JWT)
[ Express API Server (Node.js + TS) ]
   ├── Middleware: Cors, Helmet, AuthGuard, ErrorHandler
   ├── Business Controllers & Services
   ├── AI Infrastructure Layer
   │     ├── AIProviderFactory (OpenAI / Gemini / Claude)
   │     └── Financial Calculation Engines (Health, Forecast, Scenario)
   └── MongoDB Atlas / Local Instance (Mongoose Models)
```

---

## 2. Authentication Flow
1. User logs in on Frontend via Firebase Auth (Google Sign-In or Email/Password).
2. Firebase issues an ID Token.
3. Requests to `/api/` include `Authorization: Bearer <ID_TOKEN>`.
4. `verifyAuth` Express middleware verifies token against Firebase Admin SDK, extracts `uid`, and attaches `req.user`.

---

## 3. AI Architecture Layer (`backend/src/ai`)
- **Deterministic Math Engine**: All scores, cashflow projections, budget risk percentages, and what-if scenarios are calculated deterministically in TypeScript code (`FinancialHealthEngine`, `ForecastEngine`, `ScenarioEngine`).
- **LLM Synthesis**: LLMs generate natural language explanations without performing raw arithmetic.
- **Provider Factory (`AIProviderFactory.ts`)**: Single environment variable `AI_PROVIDER=openai|gemini|claude` switches backends without code modifications.

---

## 4. Offline-First PWA & Sync Architecture
- **Web App Manifest**: Enables desktop and mobile installation (`standalone` mode).
- **Service Worker (`public/sw.js`)**:
  - `NetworkFirst` strategy for `/api/` REST endpoints.
  - `CacheFirst` strategy for static CSS, JS, and image assets.
- **IndexedDB Action Queue (`idbStorage.ts`)**: Offline actions are saved to IndexedDB.
- **Background Sync Engine (`syncEngine.ts`)**: Auto-flushes pending offline actions upon network reconnection.

---

## 5. Security & Production Hardening
- **Helmet**: Secure HTTP response headers.
- **Input Sanitization & CORS**: Strict request body validation and origin controls.
- **Data Protection**: Passwords, API keys, and sensitive financial credentials are never logged.
