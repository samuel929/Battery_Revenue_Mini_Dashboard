import json
import logging
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status
from pydantic import ValidationError

from app.models import PnlCurve, StrikeMatrixItem

logger = logging.getLogger(__name__)


class PricingGridRepository:
    def __init__(self, data_file: Path) -> None:
        self.data_file = data_file
        self._strike_matrix: list[StrikeMatrixItem] = []
        self._pnl_curves: dict[str, PnlCurve] = {}
        self.load()

    def load(self) -> None:
        raw = self._read_json()
        strike_rows = raw.get("strikeMatrix")
        pnl_curves = raw.get("pnlCurves")

        if not isinstance(strike_rows, list) or not isinstance(pnl_curves, dict):
            raise RuntimeError("Data file must contain strikeMatrix[] and pnlCurves{}")

        self._strike_matrix = self._validate_strike_rows(strike_rows)
        self._pnl_curves = self._validate_curves(pnl_curves)

    def _read_json(self) -> dict[str, Any]:
        try:
            return json.loads(self.data_file.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise RuntimeError(f"Data file not found: {self.data_file}") from exc
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSON data file: {exc}") from exc

    @staticmethod
    def _validate_strike_rows(rows: list[Any]) -> list[StrikeMatrixItem]:
        valid_rows: list[StrikeMatrixItem] = []
        for index, row in enumerate(rows):
            try:
                valid_rows.append(StrikeMatrixItem.model_validate(row))
            except ValidationError as exc:
                logger.warning("Skipping invalid strikeMatrix row %s: %s", index, exc.errors())
        return valid_rows

    @staticmethod
    def _validate_curves(rows: dict[str, Any]) -> dict[str, PnlCurve]:
        valid_curves: dict[str, PnlCurve] = {}
        for key, row in rows.items():
            try:
                valid_curves[key] = PnlCurve.model_validate(row)
            except ValidationError as exc:
                logger.warning("Skipping invalid pnlCurves entry %s: %s", key, exc.errors())
        return valid_curves

    @staticmethod
    def build_key(term: int, merchant_pct: int, cycling: float, profile: str) -> str:
        return f"{term}|{merchant_pct}|{cycling:.1f}|{profile}"

    def get_strike_matrix(self) -> list[StrikeMatrixItem]:
        return self._strike_matrix

    def get_pnl_curve(self, term: int, merchant_pct: int, cycling: float, profile: str) -> PnlCurve:
        key = self.build_key(term, merchant_pct, cycling, profile)
        curve = self._pnl_curves.get(key)
        if curve is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No P&L curve found for selected terms: {key}",
            )
        return curve
