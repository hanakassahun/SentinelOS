from typing import List

import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest

app = FastAPI(title="SentinelOS Intelligence Engine")


class TaskData(BaseModel):
    energy_level: int
    cognitive_load: int
    consecutive_hours: float


@app.post("/analytics/detect-outliers")
def detect_outliers(tasks: List[TaskData]):
    if len(tasks) < 5:
        return {"has_outliers": False, "outlier_indices": []}

    df = pd.DataFrame([task.model_dump() for task in tasks])

    clf = IsolationForest(contamination=0.15, random_state=42)
    predictions = clf.fit_predict(df)

    outlier_indices = [int(idx) for idx, pred in enumerate(predictions) if pred == -1]

    return {
        "has_outliers": len(outlier_indices) > 0,
        "outlier_indices": outlier_indices,
        "recommendation": "Warning: High-density cognitive stacking detected. Insert a restorative buffer.",
    }
