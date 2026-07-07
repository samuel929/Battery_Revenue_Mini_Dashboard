# Battery Pricing Workbench

Full-stack take-home implementation for serving a pre-computed battery pricing grid and visualising the selected P&L risk profile.

## Stack

- Backend: FastAPI, Pydantic validation, CORS, security headers, SlowAPI rate limiting.
- Frontend: Vite, React, TypeScript, Tailwind CSS, shadcn-style components, Radix Select, Recharts, Framer Motion, Biome.
- Data source: `backend/data/take-home-data.json`.

## Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Frontend notes

- shadcn-style primitives live in `src/components/ui`.
- Feature code lives in `src/features/pricing`.
- Dropdowns use Radix Select so the opened dropdown menu is fully styled, animated, keyboard accessible, and not limited by native `<select>` styling.
- The strike matrix table supports horizontal drag-to-scroll.
- The chart uses the API P&L curve data and draws the strike as a reference line.

## Backend notes

- `GET /strike-matrix` returns validated strike matrix rows.
- `GET /pnl-curve?term=..&merchantPct=..&cycling=..&profile=..` returns the matching curve.
- Invalid rows are skipped instead of being served as bad prices.
- Security headers and local-development CORS are configured in middleware.
- Rate limiting defaults to `80/minute` and can be changed with `RATE_LIMIT`.

## Data-quality note

The supplied JSON contains one malformed strike matrix price, so the backend intentionally skips that row while keeping the app usable:

```json
"pricePerMwYr": "138too"
```
