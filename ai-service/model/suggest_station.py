import pandas as pd

def estimate_min_waiting_time(charging_vehicles: list) -> float:
    if not charging_vehicles:
        return 0
    min_time = float('inf')
    for v in charging_vehicles:
        if not all(key in v for key in ["battery_percent", "battery_capacity_kwh", "charge_rate_kw"]):
            continue
        battery_left = (100 - v["battery_percent"]) / 100 * v["battery_capacity_kwh"]
        time_minutes = (battery_left / v["charge_rate_kw"]) * 60
        if time_minutes < min_time:
            min_time = time_minutes
    return min_time if min_time != float('inf') else 0

def estimate_avg_waiting_time(charging_vehicles: list) -> float:
    if not charging_vehicles:
        return 0
    data = pd.DataFrame(charging_vehicles)
    if not all(col in data.columns for col in ["battery_percent", "battery_capacity_kwh", "charge_rate_kw"]):
        return 0
    data['battery_left_kwh'] = (100 - data['battery_percent']) / 100 * data['battery_capacity_kwh']
    data['time_minutes'] = data['battery_left_kwh'] / data['charge_rate_kw'] * 60
    return data['time_minutes'].mean()

def suggest_nearby_station(
    current_station: str,
    stations_data: list,
    speed_kmph: float = 30,
    max_acceptable_time: float = 45,
    max_distance_km: float = 15,
    slot_occupancy_threshold: float = 0.8
) -> dict:
    if not stations_data:
        return {"error": "No stations provided"}
    
    current_data = next((s for s in stations_data if s.get("station_id") == current_station), None)
    if not current_data:
        return {"error": f"Current station {current_station} not found"}

    for s in stations_data:
        required_keys = {"station_id", "available_slots", "total_slots", "distance_km"}
        if missing := [k for k in required_keys if k not in s]:
            return {"error": f"Station {s.get('station_id')} missing fields: {missing}"}

    valid_stations = []
    for s in stations_data:
        if s["distance_km"] > max_distance_km:
            continue

        s["travel_time_min"] = (s["distance_km"] / speed_kmph) * 60
        s["avg_wait_time"] = estimate_avg_waiting_time(s.get("charging_vehicles", []))
        s["min_wait_time"] = estimate_min_waiting_time(s.get("charging_vehicles", []))
        s["total_time_min"] = s["travel_time_min"] + s["min_wait_time"]

        # Tính toán tỷ lệ sử dụng slot
        total = s.get("total_slots", 1) or 1  # tránh chia cho 0
        used = total - s.get("available_slots", 0)
        s["occupancy_rate"] = used / total

        valid_stations.append(s)

    current_data = next((s for s in valid_stations if s["station_id"] == current_station), None)
    if not current_data:
        closest = min(valid_stations, key=lambda x: x["distance_km"], default=None)
        return {
            "error": "Current station beyond max distance",
            "closest_station": closest["station_id"] if closest else "None",
            "distance_km": closest["distance_km"] if closest else 0
        }

    if current_data["available_slots"] > 0:
        return {
            "suggested_station": current_station,
            "reason": "Immediate charging available",
            "metrics": {
                "wait_time": 0,
                "available_slots": current_data["available_slots"]
            }
        }

    current_min_wait = current_data["min_wait_time"] if current_data["min_wait_time"] > 0 else current_data["avg_wait_time"]

    better_stations = []
    for s in valid_stations:
        if s["station_id"] == current_station:
            continue

        if s["occupancy_rate"] >= slot_occupancy_threshold:
            continue

        if s["available_slots"] == 0 and s["min_wait_time"] > current_min_wait:
            continue

        if s["total_time_min"] < current_min_wait:
            better_stations.append(s)

    if better_stations:
        better_stations.sort(key=lambda x: (x["total_time_min"], x["distance_km"]))
        best = better_stations[0]
        if best["available_slots"] > 0:
            reason = f"Immediate availability ({best['travel_time_min']:.1f}min travel)"
        else:
            reason = (f"Faster than waiting ({best['total_time_min']:.1f}min total vs " 
                      f"{current_min_wait:.1f}min wait at current)")
        return {
            "suggested_station": best["station_id"],
            "reason": reason,
            "metrics": {
                "total_time": round(best["total_time_min"], 1),
                "travel_time": round(best["travel_time_min"], 1),
                "wait_time": round(best["min_wait_time"], 1),
                "distance_km": best["distance_km"],
                "available_slots": best["available_slots"]
            }
        }

    return {
        "suggested_station": current_station,
        "reason": f"No better options within {max_distance_km}km",
        "metrics": {
            "estimated_wait": round(current_min_wait, 1),
            "available_slots": current_data["available_slots"]
        }
    }
