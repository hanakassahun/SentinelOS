from typing import List

import pandas as pd
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sklearn.ensemble import IsolationForest

app = FastAPI(title="SentinelOS Intelligence Engine")


class TaskData(BaseModel):
    energy_level: int = Field(..., ge=1, le=5)
    cognitive_load: int = Field(..., ge=1, le=5)
    consecutive_hours: float = Field(..., gt=0)

    @field_validator("consecutive_hours")
    @classmethod
    def validate_consecutive_hours(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("consecutive_hours must be greater than zero")
        return value


class OutlierResponse(BaseModel):
    has_outliers: bool
    outlier_indices: List[int]
    recommendation: str


@app.post("/analytics/detect-outliers", response_model=OutlierResponse)
def detect_outliers(tasks: List[TaskData]) -> OutlierResponse:
    if not tasks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one task is required")

    if len(tasks) < 5:
        return OutlierResponse(
            has_outliers=False,
            outlier_indices=[],
            recommendation="Insufficient task history for anomaly detection. Keep the current workload steady and add a short recovery buffer if needed.",
        )

    try:
        feature_columns = ["energy_level", "cognitive_load", "consecutive_hours"]
        df = pd.DataFrame([task.model_dump() for task in tasks])[feature_columns]

        clf = IsolationForest(contamination=0.15, random_state=42)
        predictions = clf.fit_predict(df)

        outlier_indices = [int(idx) for idx, pred in enumerate(predictions) if pred == -1]
        if outlier_indices:
            recommendation = (
                "Warning: High-friction cognitive stacking detected. Insert a restorative buffer and reduce "
                "the next back-to-back high-load task block."
            )
        else:
            recommendation = (
                "No anomalous clusters detected. Maintain the current pacing and preserve recovery time between demanding tasks."
            )

        return OutlierResponse(
            has_outliers=len(outlier_indices) > 0,
            outlier_indices=outlier_indices,
            recommendation=recommendation,
        )
    except Exception as exc:  # pragma: no cover - defensive guard for runtime failures
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Outlier detection failed: {exc}",
        ) from exc
