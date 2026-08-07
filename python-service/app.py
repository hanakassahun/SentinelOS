from fastapi.responses import JSONResponse

from main import app
from ml_model import RiskModel
from schemas import RiskRequest, RiskResponse

model = RiskModel()

@app.post("/predict-risk", response_model=RiskResponse)
async def predict_risk(request: RiskRequest):
    df = request.to_dataframe()
    prediction = model.predict(df)
    return RiskResponse(**prediction)

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "model_version": model.version})
