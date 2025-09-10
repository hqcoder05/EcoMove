from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from model.suggest_station import suggest_nearby_station

router = APIRouter()

class Vehicle(BaseModel):
    battery_percent: float
    battery_capacity_kwh: float
    charge_rate_kw: float

class StationData(BaseModel):
    station_id: str
    lat: float
    lon: float
    total_slots: int
    available_slots: int
    charging_vehicles: Optional[List[Vehicle]] = []

class SuggestRequest(BaseModel):
    user_location: Dict[str, float]   # {"lat": float, "lon": float}
    stations_data: List[StationData]
    speed_kmph: float = 30.0
    max_distance_km: float = 15.0
    slot_occupancy_threshold: float = 0.8

@router.post("/suggest")
async def suggest_station(request: SuggestRequest):
    try:
        result = suggest_nearby_station(
            user_location=request.user_location,
            stations_data=[s.dict() for s in request.stations_data],
            speed_kmph=request.speed_kmph,
            max_distance_km=request.max_distance_km,
            slot_occupancy_threshold=request.slot_occupancy_threshold
        )
        return result
    except ValueError as ve:
        return {"detail": f"Invalid input: {str(ve)}"}
    except Exception as e:
        return {"detail": f"Unexpected error: {str(e)}"}
