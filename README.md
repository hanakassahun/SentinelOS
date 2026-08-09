# 🧠 sentinelOS -> A Personal Decision Intelligence System

> Most productivity tools track what you do.
> sentinelOS understands how you function and helps you make better decisions.

sentinelOS is a behavioral intelligence platform that detects performance patterns, predicts decision risk, and provides personalized recommendations to improve execution and prevent burnout.

Instead of acting as a passive tracker, sentinelOS serves as an active decision partner.

---

## 🚨 The Problem

People rarely fail due to lack of discipline.

They fail because they cannot see their behavioral patterns:

- Overestimating energy
- Scheduling deep work at the wrong time
- Repeating decisions that historically fail
- Ignoring early burnout signals

Existing tools collect data but do not reason about it.

sentinelOS closes that gap.

---

## 💡 What Makes sentinelOS Different

sentinelOS is not a to-do app.

It is a decision intelligence engine that:

✅ Detects behavioral patterns  
✅ Correlates energy, mood, and performance  
✅ Identifies high-risk scheduling decisions  
✅ Surfaces invisible productivity traps  
✅ Provides explainable insights  

The goal is simple:

> Help users make decisions their future self would thank them for.

---

## ⚙️ Core Capabilities

### 🧾 Behavioral Event Logging
Structured data capture including:

- Planned vs actual execution  
- Energy and mood levels  
- Task type  
- Time-of-day context  

High-quality inputs enable meaningful intelligence.

---

### 📊 Pattern Detection Engine
Analyzes behavioral data to uncover performance drivers such as:

- Success rate by time block  
- Energy-performance correlation  
- Task difficulty trends  
- Failure clusters  

Transforms raw data into actionable knowledge.

---

### 🧠 Insight Generator
Converts statistical findings into human-readable guidance:

> “You complete deep work tasks 68% more often before 1PM.”

No dashboards without interpretation.

No data without meaning.

---

### 🎯 Decision Advisor
Before committing to a plan, sentinelOS evaluates historical behavior and flags risky decisions:

⚠️ *“You frequently underperform on cognitively demanding tasks after 8PM. Consider rescheduling.”*

sentinelOS doesn’t just observe behavior — it challenges it.

---

### 🔥 Behavioral Risk Alerts
Detects dangerous trends early, including:

- Rising failure rates  
- Overplanning patterns  
- Sustained low-energy execution  
- Burnout trajectories  

Prevention > recovery.

---

## 🏗️ System Design

sentinelOS is built around a layered intelligence architecture:

- Data Layer  
Stores structured behavioral events optimized for analysis.

- Logic Layer  
Processes correlations and performance metrics.

- Insight Layer  
Transforms analytical output into explainable recommendations.

This separation ensures scalability and future ML integration.

---

## 🧪 Tech Stack

Frontend: Next.js (app directory)  
Backend: Node.js (Express or similar)  
Database: PostgreSQL (Prisma schema consolidated under the root `prisma` folder)  

Tech stack (updated):  
  
Notes:  
- The Prisma schema now lives in `prisma/schema.prisma` and is shared by both the Next.js client and the Express server.  
- The server uses `server/prisma.config.ts` to point at the shared schema, and the seed script remains at `server/seed-prisma.ts`.  
- The client folder was switched to a Next.js scaffold (`client/app`, `client/package.json`).  
Designed for clarity, performance, and analytical flexibility.

---

## 🧠 Intelligence System Deep Dive

The intelligence layer is the heart of sentinelOS. It turns raw behavioral events into explainable guidance through three connected stages:

1. Rule-based correlator
   - Aggregates task outcomes by hour block
   - Measures success rates and flags risky time windows
   - Produces structured insights for time-of-day friction

2. Background insight queue
   - Uses BullMQ with Redis to process analytics asynchronously
   - Keeps the main server responsive while insight generation runs in the background
   - Persists high-risk findings into the shared Prisma insight model

3. Python anomaly service
   - FastAPI endpoint at `python-service/main.py`
   - Uses Isolation Forest over energy, cognitive load, and consecutive-hours inputs
   - Flags anomalous task clusters for restorative planning recommendations

### Runtime workflow

```powershell
cd server
npm install
npm run dev
```

```powershell
cd client
npm install
npm run dev
```

Useful insight endpoints:

```powershell
curl http://localhost:3000/api/insights
curl http://localhost:3000/api/insights?force=true
curl http://localhost:3000/api/insights/history
```

### Persistence model

Insights are persisted through the Prisma `Insight` model and stored in the shared database layer, so the system can both serve live recommendations and retain historical reasoning over time.

### Active project layout

Keep the focus on the active runtime code:

- `client/` → Next.js frontend
- `server/` → Express API, queues, Prisma access, and intelligence workers
- `prisma/` → shared schema and seed assets
- `python-service/` → FastAPI anomaly detection service
- `docs/` → architecture and data model references

---

## 🎯 Why I Built This

Most software helps users stay organized.

I wanted to build software that helps users become self-aware.

sentinelOS explores a question that fascinates me:

> *What if software could detect the decisions we are statistically likely to regret?*

This project reflects my interest in:

- intelligent systems  
- human-centered engineering  
- behavioral data  
- decision support software  

---

## 🚀 Future Directions

- Predictive performance modeling  
- ML-driven behavioral forecasting  
- Personalized workload calibration  
- Cross-user anonymized insights  
- Mental load scoring  
- Adaptive planning engine  

---

## 📌 Project Status

✅ Actively developed  
🔬 Intelligence features expanding  
📈 Architecture designed for scale  

---

## 👨‍💻 Author

Built by a systems-focused computer science student passionate about designing software that augments human decision-making.
