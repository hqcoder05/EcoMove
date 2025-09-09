from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from model.predict_demand import predict_demand

router = APIRouter()

class DemandRequest(BaseModel):
    location: str
    hour: int
    day_of_week: str
    weather: str

@router.post("/predict")
def predict_demand_api(request: DemandRequest):
    """
    Dự đoán số lượng xe sẽ cần sạc tại một trạm, dựa trên các yếu tố thời gian, thời tiết, vị trí.
    """
    try:
        # Validate input range for hour
        if not (0 <= request.hour <= 23):
            raise ValueError("Hour must be between 0 and 23")

        input_data = request.dict()
        prediction = predict_demand(input_data)

        # If prediction returns an error dictionary, raise a ValueError
        if isinstance(prediction, dict) and "error" in prediction:
            raise ValueError(prediction["error"])

        return {"predicted_demand": prediction}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(ve)}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
