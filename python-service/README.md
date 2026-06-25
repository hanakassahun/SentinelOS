# SentinelOS Python Risk Service Prototype

This folder contains a minimal FastAPI prototype for a Python-based behavioral risk scoring service.

## What it provides

- `app.py`: FastAPI application exposing `/predict-risk` and `/health`
- `schemas.py`: Pydantic models for behavioral events and risk requests
- `ml_model.py`: Prototype ML model using `pandas` and `scikit-learn`
- `requirements.txt`: Python dependency list
- `Dockerfile`: Container image definition for the service

## Run locally

```powershell
cd python-service
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Example request

```powershell
curl -X POST "http://127.0.0.1:8000/predict-risk" -H "Content-Type: application/json" -d "{
  \"user_id\": \"user-123\",
  \"session_id\": \"session-abc\",
  \"events\": [
    {
      \"event_type\": \"login_failure\",
      \"timestamp\": \"2026-06-24T14:00:00Z\",
      \"metadata\": { \"duration\": 30, \"high_risk_action\": true, \"confidence\": 0.8 }
    },
    {
      \"event_type\": \"privilege_change\",
      \"timestamp\": \"2026-06-24T14:05:00Z\",
      \"metadata\": { \"duration\": 120, \"high_risk_action\": true, \"confidence\": 0.95 }
    }
  ]
}"
```

## Notes

This is a prototype to demonstrate how a Python FastAPI service can handle event payloads, validate them with Pydantic, and apply a simple ML-style risk model.

For production, you can expand the service by:

- loading a serialized model (`joblib` / `pickle` / `onnx`)
- adding authentication and request validation middleware
- using a real training dataset and feature engineering pipeline
- versioning the API and ML model separately
