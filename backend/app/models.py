from typing import Literal

from pydantic import BaseModel, Field, field_validator

Profile = Literal["flat", "solar"]


class StrikeMatrixItem(BaseModel):
    term: int = Field(..., ge=1)
    merchantPct: int = Field(..., ge=0, le=100)
    cycling: float = Field(..., gt=0)
    profile: Profile
    pricePerMwYr: int = Field(..., ge=0)


class PnlPoint(BaseModel):
    p: int = Field(..., ge=0, le=100)
    pnlPerMwYr: int


class PnlCurve(BaseModel):
    asOf: str
    strikePerMwYr: int = Field(..., ge=0)
    points: list[PnlPoint]

    @field_validator("points")
    @classmethod
    def require_points(cls, value: list[PnlPoint]) -> list[PnlPoint]:
        if not value:
            raise ValueError("P&L curve must include at least one point")
        return value


class ErrorResponse(BaseModel):
    detail: str


RunStatus = Literal["queued", "running", "complete"]


class RunResponse(BaseModel):
    id: str
    status: RunStatus
