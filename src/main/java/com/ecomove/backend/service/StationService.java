package com.ecomove.backend.service;

import com.ecomove.backend.model.Station;

import java.util.List;

public interface StationService {
    List<Station> getAllStations();
    Station save(Station station);
    List<Station> getNearbyStations(double lat, double lng);
}
