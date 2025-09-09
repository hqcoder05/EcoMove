from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from model.suggest_station import suggest_nearby_station

router = APIRouter()

class StationData(BaseModel):
    station_id: str
    available_slots: int
    total_slots: int
    distance_km: float
    charging_vehicles: List[Dict] = []

class SuggestRequest(BaseModel):
    current_station: str
    stations_data: List[StationData]
    speed_kmph: float = 30.0  # default average speed in km/h
    max_acceptable_time: float = 45.0  # in minutes
    slot_occupancy_threshold: float = 0.8  # percentage, e.g., 0.8 = 80%

@router.post("/suggest")
async def suggest_station(request: SuggestRequest):
    """
    Suggest an optimal charging station based on current station and stations data.
    The selection avoids stations that are too full or too far.
    """
    try:
        result = suggest_nearby_station(
            current_station=request.current_station,
            stations_data=[s.dict() for s in request.stations_data],
            speed_kmph=request.speed_kmph,
            max_acceptable_time=request.max_acceptable_time,
            slot_occupancy_threshold=request.slot_occupancy_threshold
        )
        return result
    except ValueError as ve:
        return {"detail": f"Invalid input: {str(ve)}"}
    except Exception as e:
        return {"detail": f"Unexpected error: {str(e)}"}
