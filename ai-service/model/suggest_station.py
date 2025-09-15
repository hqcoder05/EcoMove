import math
import pandas as pd
import requests

# ==========================
# Hàm tính khoảng cách Haversine
# ==========================
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

# ==========================
# Hàm gọi OSRM để tính travel time
# ==========================
def osrm_travel_time(lat1, lon1, lat2, lon2, speed_kmph=30):
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        r = requests.get(url, timeout=5)
        data = r.json()
        if "routes" in data and len(data["routes"]) > 0:
            duration_sec = data["routes"][0]["duration"]  # giây
            return duration_sec / 60.0   # phút
    except Exception as e:
        print("OSRM error:", e)
    # fallback Haversine nếu OSRM fail
    dist_km = haversine(lat1, lon1, lat2, lon2)
    return (dist_km / speed_kmph) * 60

# ==========================
# Hàm tính thời gian chờ
# ==========================
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

# ==========================
# Gợi ý trạm
# ==========================
def suggest_nearby_station(
    user_location: dict,
    stations_data: list,
    speed_kmph: float = 30,
    max_distance_km: float = 15,
    slot_occupancy_threshold: float = 0.8
) -> dict:
    if not stations_data:
        return {"lỗi": "Không có dữ liệu trạm sạc nào"}
    
    # Tính travel_time bằng OSRM + các metric cho mỗi trạm
    for s in stations_data:
        if not all(k in s for k in ["station_id", "lat", "lon", "total_slots", "available_slots"]):
            return {"lỗi": f"Thiếu thông tin trạm: {s}"}
        
        s["distance_km"] = haversine(user_location["lat"], user_location["lon"], s["lat"], s["lon"])
        s["travel_time_min"] = osrm_travel_time(user_location["lat"], user_location["lon"], s["lat"], s["lon"], speed_kmph)
        s["avg_wait_time"] = estimate_avg_waiting_time(s.get("charging_vehicles", []))
        s["min_wait_time"] = estimate_min_waiting_time(s.get("charging_vehicles", []))
        s["total_time_min"] = s["travel_time_min"] + s["min_wait_time"]

        total = s.get("total_slots", 1) or 1
        used = total - s.get("available_slots", 0)
        s["occupancy_rate"] = used / total

    # Chọn trạm gần nhất làm current
    current_data = min(stations_data, key=lambda x: x["distance_km"])
    current_station = current_data["station_id"]

    # Nếu trạm gần nhất còn slot
    if current_data["available_slots"] > 0:
        return {
            "tram_de_xuat": current_station,
            "ly_do": "Có thể sạc ngay lập tức",
            "thong_so": {
                "thoi_gian_cho": 0,
                "so_slot_trong": current_data["available_slots"],
                "khoang_cach_km": round(current_data["distance_km"], 2),
                "thoi_gian_di_chuyen_phut": round(current_data["travel_time_min"], 1)
            }
        }

    # Nếu hết slot → tìm trạm khác
    current_min_wait = current_data["min_wait_time"] or current_data["avg_wait_time"]
    better_stations = []
    for s in stations_data:
        if s["station_id"] == current_station:
            continue
        if s["distance_km"] > max_distance_km:
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
            reason = f"Có slot trống ngay (mất {best['travel_time_min']:.1f} phút di chuyển)"
        else:
            reason = (f"Nhanh hơn so với chờ ({best['total_time_min']:.1f} phút tổng so với "
                      f"{current_min_wait:.1f} phút chờ tại trạm gần nhất)")
        return {
            "tram_de_xuat": best["station_id"],
            "ly_do": reason,
            "thong_so": {
                "tong_thoi_gian": round(best["total_time_min"], 1),
                "thoi_gian_di_chuyen": round(best["travel_time_min"], 1),
                "thoi_gian_cho": round(best["min_wait_time"], 1),
                "khoang_cach_km": round(best["distance_km"], 2),
                "so_slot_trong": best["available_slots"]
            }
        }

    # Nếu không có trạm tốt hơn
    return {
        "tram_de_xuat": current_station,
        "ly_do": f"Không có trạm tốt hơn trong phạm vi {max_distance_km}km",
        "thong_so": {
            "thoi_gian_cho_uoc_tinh": round(current_min_wait, 1),
            "so_slot_trong": current_data["available_slots"],
            "khoang_cach_km": round(current_data["distance_km"], 2),
            "thoi_gian_di_chuyen_phut": round(current_data["travel_time_min"], 1)
        }
    }
