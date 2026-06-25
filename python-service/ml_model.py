from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "event_count",
    "unique_event_types",
    "total_duration",
    "avg_confidence",
    "high_risk_actions",
]


class RiskModel:
    version = "0.1.0"

    def __init__(self) -> None:
        self.pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("clf", LogisticRegression(random_state=42, max_iter=500)),
            ]
        )
        X_train, y_train = self._generate_training_data()
        self.pipeline.fit(X_train, y_train)

    def predict(self, df: pd.DataFrame) -> Dict[str, Any]:
        vector = self._extract_feature_vector(df)
        score = float(self.pipeline.predict_proba([vector])[0, 1])
        return {
            "user_id": df.attrs.get("user_id", "unknown"),
            "session_id": df.attrs.get("session_id"),
            "risk_score": score,
            "risk_level": self._to_risk_level(score),
            "model_version": self.version,
            "explanation": self._explain(vector, score),
        }

    def _generate_training_data(self) -> tuple[np.ndarray, np.ndarray]:
        rng = np.random.default_rng(42)
        rows: List[List[float]] = []
        labels: List[int] = []

        for _ in range(500):
            event_count = float(rng.integers(1, 24))
            unique_event_types = float(rng.integers(1, min(5, int(event_count))))
            total_duration = float(rng.integers(0, 1200))
            avg_confidence = float(rng.uniform(0.2, 0.98))
            high_risk_actions = float(rng.integers(0, 5))

            risk = 1 if (event_count > 10 and high_risk_actions >= 2) or total_duration > 600 else 0
            rows.append([event_count, unique_event_types, total_duration, avg_confidence, high_risk_actions])
            labels.append(risk)

        return np.array(rows), np.array(labels)

    def _extract_feature_vector(self, df: pd.DataFrame) -> List[float]:
        event_count = float(len(df))
        unique_event_types = float(df["event_type"].nunique()) if not df.empty else 0.0

        total_duration = 0.0
        confidences: List[float] = []
        high_risk_actions = 0.0

        for metadata in df["metadata"]:
            if isinstance(metadata, dict):
                total_duration += float(metadata.get("duration", 0.0) or 0.0)
                confidence = metadata.get("confidence")
                if isinstance(confidence, (int, float)):
                    confidences.append(float(confidence))
                if metadata.get("high_risk_action"):
                    high_risk_actions += 1.0

        avg_confidence = float(np.mean(confidences)) if confidences else 0.0
        return [event_count, unique_event_types, total_duration, avg_confidence, high_risk_actions]

    def _to_risk_level(self, score: float) -> str:
        if score >= 0.65:
            return "high"
        if score >= 0.35:
            return "medium"
        return "low"

    def _explain(self, vector: List[float], score: float) -> Dict[str, Any]:
        return {
            "features": dict(zip(FEATURE_COLUMNS, vector)),
            "thresholds": {"low": 0.35, "high": 0.65},
            "prediction_probability": score,
        }
