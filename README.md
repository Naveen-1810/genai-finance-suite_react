# GenAI Finance Suite — React + FastAPI

Migrated from the original Streamlit app. Same features, same data (`finance_pro.db`
is reused as-is), new stack: **React + Vite + Tailwind** frontend, **FastAPI +
SQLAlchemy** backend.

## ⚠️ Before you do anything: rotate your secrets

Your original `credentials.json.json` (Google service account key) and the
Gemini API key hardcoded in `app.py` were shared in plain text. Treat both as
already leaked:

1. Go to Google Cloud Console → IAM & Admin → Service Accounts → find
   `streamlit-sheet-bot@...` → delete the old key → generate a new one.
2. Go to [Google AI Studio](https://aistudio.google.com/) → revoke the old
   Gemini key → create a new one.
3. Put the **new** values only in `backend/.env` (never in source code, never
   committed to Git — see `.gitignore`).

## Features migrated

- Dashboard — totals, expense pie chart, stock P/L bar chart, recent activity
- Income Tracker — add / edit / delete
- Expense Tracker — add / edit / delete, with notes
- Stock Portfolio — add / edit / delete trades, automatic P/L calculation
  (manual buy/sell prices, same as the original — **no live market feed**)
- AI Advisor — Gemini-powered Q&A over your financial data, key stays
  server-side only
- Google Sheets sync — optional, requires a service account JSON

## Project structure

```
backend/
  app/
    main.py            FastAPI app + CORS
    database.py         SQLAlchemy engine (reuses finance_pro.db)
    models.py            Income / Expense / Stock tables
    schemas.py            Pydantic request/response models
    routers/
      income.py, expenses.py, stocks.py, dashboard.py, advisor.py, gsheet.py
    finance_pro.db          your existing data, copied over
  requirements.txt
  .env.example              copy to .env and fill in

frontend/
  src/
    pages/            Dashboard, Income, Expenses, Stocks, Advisor
    components/        Sidebar, MetricCard
    services/api.js       all backend calls
  package.json
```

## Running locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
copy .env.example .env       # Windows: copy, macOS/Linux: cp
# then edit .env and paste your NEW rotated keys
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. Interactive API docs at
`http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` calls to the
backend automatically (see `vite.config.js`).

### One-click Windows launcher

`run_all.bat` in the project root starts both servers for you (see file).

## What was intentionally left out (for now)

The original migration brief also asked for PostgreSQL, WebSocket live NSE/BSE
market data via a broker API, JWT auth, and cloud deployment. Those were
scoped out because:

- Live broker market data (e.g. Upstox) needs a trading account + KYC
  approval — not realistic for a college project timeline.
- PostgreSQL/WebSocket/auth/deployment is a multi-week, multi-person scope,
  not a single conversion task.

If you want any of these later, they can be added incrementally on top of
this codebase — the REST API structure here (`/api/...`) is already set up to
extend cleanly.
