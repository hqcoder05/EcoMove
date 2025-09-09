import pandas as pd
import xgboost as xgb
import os
from utils.preprocess import preprocess_input, load_label_encoders

# Đường dẫn đến model XGBoost đã được train
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/demand_model.json")

# Biến toàn cục giữ model đã load
_model = None

def load_model_once():
    global _model
    if _model is None:
        try:
            print("🔄 Loading model from disk...")
            _model = xgb.XGBRegressor()
            _model.load_model(MODEL_PATH)
            print("✅ Model loaded.")
        except FileNotFoundError:
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {str(e)}")
    return _model

def predict_demand(input_data: dict):
    """
    Dự đoán nhu cầu cho 1 điểm cụ thể (1 trạm, 1 thời điểm)
    """
    try:
        required_keys = {"location", "hour", "day_of_week", "weather"}
        if not all(key in input_data for key in required_keys):
            raise ValueError(f"Missing required keys: {required_keys - set(input_data.keys())}")
        
        df = pd.DataFrame([input_data])
        X = preprocess_input(df, is_training=False)
        model = load_model_once()
        prediction = model.predict(X)

        if len(prediction) == 0:
            raise ValueError("Prediction failed: empty result")
        
        return {
            "station_id": input_data["location"],  # Trả về station_id trong kết quả
            "predicted_demand": float(prediction[0])
        }
    
    except ValueError as ve:
        return {"error": f"Invalid input: {str(ve)}"}
    except FileNotFoundError as fnf:
        return {"error": f"Model loading error: {str(fnf)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def predict_all_stations_every_30min(start_hour: float, intervals: int, day_of_week: str, weather: str, location=None):
    """
    Dự đoán nhu cầu cho tất cả các trạm mỗi 30 phút trong khoảng thời gian cho trước.
    
    Parameters:
        start_hour (float): Giờ bắt đầu (VD: 14.0 cho 14:00)
        intervals (int): Số mốc 30 phút cần dự đoán (VD: 6 = từ 14:00 → 16:30)
        day_of_week (str): Thứ trong tuần ("Monday", ...)
        weather (str): Thời tiết hiện tại ("sunny", ...)
        location (str, optional): Nếu có, chỉ dự đoán cho các trạm trong địa điểm này
    
    Returns:
        List of dicts: [{location, hour, predicted_demand}, ...] hoặc [{station_id, predicted_demand}]
    """
    try:
        encoders = load_label_encoders()
        station_list = list(encoders["location"].classes_)

        # Nếu có location, chỉ lấy các trạm trong địa điểm đó
        if location:
            if location not in station_list:
                return {"error": f"Location {location} not found"}
            station_list = [location]

        input_rows = []
        for i in range(intervals):
            current_hour = start_hour + i * 0.5
            rounded_hour = round(current_hour, 1)
            for station in station_list:
                input_rows.append({
                    "location": station,
                    "hour": rounded_hour,
                    "day_of_week": day_of_week,
                    "weather": weather
                })

        df = pd.DataFrame(input_rows)
        X = preprocess_input(df, is_training=False)
        model = load_model_once()
        preds = model.predict(X)

        # Kết quả cho từng trạm nếu là theo trạm cụ thể hoặc theo địa điểm
        results = []
        for i, row in enumerate(input_rows):
            if location:
                results.append({
                    "station_id": row["location"],  # Trả về station_id thay vì location nếu có location
                    "predicted_demand": round(float(preds[i]), 2)
                })
            else:
                results.append({
                    "location": row["location"],
                    "hour": row["hour"],
                    "predicted_demand": round(float(preds[i]), 2)
                })

        return results

    except Exception as e:
        return {"error": str(e)}
