import logging
from datetime import datetime, timezone
from functools import lru_cache
from uuid import uuid4

from fastapi import Depends, FastAPI, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.config import Settings, get_settings
from app.models import ErrorResponse, PnlCurve, Profile, RunResponse, StrikeMatrixItem
from app.repository import PricingGridRepository
from app.security import add_security_headers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Battery Pricing API",
        version="1.0.0",
        description="Serves a pre-computed battery pricing grid and P&L curves.",
        responses={
            status.HTTP_429_TOO_MANY_REQUESTS: {"model": ErrorResponse},
            status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
        },
    )
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    app.middleware("http")(add_security_headers)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please try again shortly."},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled API error")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    return app


@lru_cache
def get_repository() -> PricingGridRepository:
    settings: Settings = get_settings()
    return PricingGridRepository(settings.data_file)


app = create_app()


@app.get("/health", tags=["System"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/strike-matrix", response_model=list[StrikeMatrixItem], tags=["Pricing"])
@limiter.limit(get_settings().rate_limit)
def get_strike_matrix(
    request: Request,
    repo: PricingGridRepository = Depends(get_repository),
) -> list[StrikeMatrixItem]:
    return repo.get_strike_matrix()


@app.get("/pnl-curve", response_model=PnlCurve, tags=["Pricing"])
@limiter.limit(get_settings().rate_limit)
def get_pnl_curve(
    request: Request,
    term: int = Query(..., ge=1),
    merchantPct: int = Query(..., ge=0, le=100),
    cycling: float = Query(..., gt=0),
    profile: Profile = Query(...),
    repo: PricingGridRepository = Depends(get_repository),
) -> PnlCurve:
    return repo.get_pnl_curve(term, merchantPct, cycling, profile)


RUNS: dict[str, datetime] = {}


@app.post("/runs", response_model=RunResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Runs"])
@limiter.limit(get_settings().rate_limit)
def create_run(request: Request) -> RunResponse:
    run_id = str(uuid4())
    RUNS[run_id] = datetime.now(timezone.utc)
    return RunResponse(id=run_id, status="queued")


@app.get("/runs/{run_id}", response_model=RunResponse, tags=["Runs"])
@limiter.limit(get_settings().rate_limit)
def get_run(request: Request, run_id: str) -> RunResponse:
    started_at = RUNS.get(run_id)
    if started_at is None:
        return RunResponse(id=run_id, status="complete")
    elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
    if elapsed < 1.25:
        return RunResponse(id=run_id, status="queued")
    if elapsed < 2.5:
        return RunResponse(id=run_id, status="running")
    return RunResponse(id=run_id, status="complete")
