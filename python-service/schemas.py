from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional

import pandas as pd
from pydantic import BaseModel, Field


class BehavioralEvent(BaseModel):
    event_type: str = Field(..., description="Type of behavioral event")
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RiskRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    events: List[BehavioralEvent]
    context: Dict[str, Any] = Field(default_factory=dict)

    def to_dataframe(self) -> pd.DataFrame:
        rows = []
        for event in self.events:
            rows.append(
                {
                    "event_type": event.event_type,
                    "timestamp": event.timestamp.timestamp(),
                    "metadata": event.metadata,
                }
            )

        df = pd.DataFrame(rows)
        df.attrs["user_id"] = self.user_id
        df.attrs["session_id"] = self.session_id
        return df


class RiskResponse(BaseModel):
    user_id: str
    session_id: Optional[str]
    risk_score: float
    risk_level: str
    model_version: str
    explanation: Dict[str, Any]
