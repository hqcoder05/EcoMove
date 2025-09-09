# File: ai_service/app.py

from fastapi import FastAPI
from routers import suggest, predict

app = FastAPI(title="AI Service for EV Charging")

# Đăng ký các router
app.include_router(suggest.router, prefix="/api")
app.include_router(predict.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Service is running."}
