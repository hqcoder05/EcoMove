package com.ecomove.backend.impl;

import com.ecomove.backend.model.Station;
import com.ecomove.backend.repository.StationRepository;
import com.ecomove.backend.service.StationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;

    public StationServiceImpl(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @Override
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    @Override
    public Station save(Station station) {
        return stationRepository.save(station);
    }

    @Override
    public List<Station> getNearbyStations(double lat, double lng) {
        return stationRepository.findAll().stream()
                .filter(s -> distance(lat, lng, s.getLatitude(), s.getLongitude()) <= 5.0)
                .toList();
    }

    private double distance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
