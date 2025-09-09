package com.GiaoThongTM.demo.stations.services;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;

    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    public Station save(Station station) {
        if (station.getAvailableSlots() == null) {
            station.setAvailableSlots(Math.max(0, station.getTotalSlots()));
        }
        return stationRepository.save(station);
    }

    public Station updateStation(UUID id, Station newData) {
        Station s = stationRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Station not found: " + id));
        if (newData.getStationName() != null) s.setStationName(newData.getStationName());
        if (newData.getDistrict() != null)    s.setDistrict(newData.getDistrict());
        if (newData.getLat() != null)         s.setLat(newData.getLat());
        if (newData.getLon() != null)         s.setLon(newData.getLon());
        if (newData.getTotalSlots() != null)  s.setTotalSlots(newData.getTotalSlots());
        if (newData.getAvailableSlots() != null) s.setAvailableSlots(newData.getAvailableSlots());
        return stationRepository.save(s);
    }

    public List<Station> getNearbyStations(double lat, double lng, int limit, double radiusKm, boolean onlyAvailable) {
        // Demo thuật toán đơn giản: load all rồi lọc theo distance (Haversine)
        List<Station> all = stationRepository.findAll();
        return all.stream()
                .filter(s -> !onlyAvailable || (s.getAvailableSlots() != null && s.getAvailableSlots() > 0))
                .map(s -> new AbstractMap.SimpleEntry<>(s, distanceKm(lat, lng, s.getLat(), s.getLon())))
                .filter(e -> e.getValue() <= radiusKm)
                .sorted(Comparator.comparingDouble(Map.Entry::getValue))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public List<Station> findStationsByStatus(String status) {
        String s = status == null ? "" : status.trim().toLowerCase();
        List<Station> all = stationRepository.findAll();
        return all.stream().filter(st -> {
            int avail = Optional.ofNullable(st.getAvailableSlots()).orElse(0);
            if (s.equals("hoạt động") || s.equals("available") || s.equals("active")) return avail > 0;
            if (s.equals("hết chỗ") || s.equals("full")) return avail == 0;
            return true;
        }).toList();
    }

    public List<Station> findStationsByName(String keyword) {
        if (keyword == null || keyword.isBlank()) return stationRepository.findAll();
        Set<Station> set = new LinkedHashSet<>();
        set.addAll(stationRepository.findByStationNameContainingIgnoreCase(keyword));
        set.addAll(stationRepository.findByDistrictContainingIgnoreCase(keyword));
        return new ArrayList<>(set);
    }

    public long countStations() {
        return stationRepository.count();
    }

    public long countStationsByStatus(String status) {
        String s = status == null ? "" : status.trim().toLowerCase();
        if (s.equals("hoạt động") || s.equals("available") || s.equals("active")) {
            return stationRepository.countByAvailableSlotsGreaterThan(0);
        } else if (s.equals("hết chỗ") || s.equals("full")) {
            return stationRepository.countByAvailableSlotsEquals(0);
        }
        return stationRepository.count();
    }

    public void deleteStation(UUID id) {
        if (!stationRepository.existsById(id)) throw new NoSuchElementException("Station not found: " + id);
        stationRepository.deleteById(id);
    }

    public Station updateStatus(UUID id, String status) {
        Station s = stationRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Station not found: " + id));
        String st = status == null ? "" : status.trim().toLowerCase();
        if (st.equals("hoạt động") || st.equals("available") || st.equals("active")) {
            // giả sử đặt trạng thái hoạt động → còn trống: set availableSlots = max(1, hiện tại)
            int avail = Optional.ofNullable(s.getAvailableSlots()).orElse(0);
            s.setAvailableSlots(Math.max(1, Math.min(avail, s.getTotalSlots())));
        } else if (st.equals("hết chỗ") || st.equals("full") || st.equals("inactive")) {
            s.setAvailableSlots(0);
        }
        return stationRepository.save(s);
    }

    public List<Station> getStationsWithAvailableVehicles() {
        return stationRepository.findAll().stream()
                .filter(s -> Optional.ofNullable(s.getAvailableSlots()).orElse(0) > 0)
                .toList();
    }

    public List<Station> getFullStations() {
        return stationRepository.findAll().stream()
                .filter(s -> Optional.ofNullable(s.getAvailableSlots()).orElse(0) == 0)
                .toList();
    }

    public List<Station> predictStationsRunningOut(int minutesAhead) {
        // Heuristic demo: còn <=10% chỗ → sắp hết
        return stationRepository.findAll().stream()
                .filter(s -> {
                    int total = Optional.ofNullable(s.getTotalSlots()).orElse(0);
                    int avail = Optional.ofNullable(s.getAvailableSlots()).orElse(0);
                    return total > 0 && avail <= Math.max(1, (int) Math.ceil(total * 0.1));
                })
                .toList();
    }

    public List<Station> predictStationsGettingFull(int minutesAhead) {
        // Heuristic demo: còn <=20% chỗ → sắp đầy
        return stationRepository.findAll().stream()
                .filter(s -> {
                    int total = Optional.ofNullable(s.getTotalSlots()).orElse(0);
                    int avail = Optional.ofNullable(s.getAvailableSlots()).orElse(0);
                    return total > 0 && avail <= Math.max(1, (int) Math.ceil(total * 0.2));
                })
                .toList();
    }

    public Station findStationWithMaxCapacity() {
        return stationRepository.findTopByCapacity(PageRequest.of(0, 1)).stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public Station findStationWithMostVehicles() {
        // Số xe đang chiếm chỗ = total - available
        return stationRepository.findTopByOccupied(PageRequest.of(0, 1)).stream().findFirst()
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public Station findStationWithMostSpace() {
        // chỗ trống nhiều nhất → availableSlots lớn nhất
        return stationRepository.findAll().stream()
                .max(Comparator.comparingInt(s -> Optional.ofNullable(s.getAvailableSlots()).orElse(0)))
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public Station findStationWithMinVehicles() {
        // ít xe đang chiếm chỗ nhất → (total - available) nhỏ nhất
        return stationRepository.findAll().stream()
                .min(Comparator.comparingInt(s -> {
                    int total = Optional.ofNullable(s.getTotalSlots()).orElse(0);
                    int avail = Optional.ofNullable(s.getAvailableSlots()).orElse(0);
                    return total - avail;
                }))
                .orElseThrow(() -> new NoSuchElementException("No station"));
    }

    public double getAverageVehicles() {
        // trung bình số xe đang chiếm chỗ
        List<Station> list = stationRepository.findAll();
        if (list.isEmpty()) return 0.0;
        int sum = list.stream().mapToInt(s -> {
            int total = Optional.ofNullable(s.getTotalSlots()).orElse(0);
            int avail = Optional.ofNullable(s.getAvailableSlots()).orElse(0);
            return total - avail;
        }).sum();
        return (double) sum / list.size();
    }

    public List<Station> findTopNStations(int n) {
        return stationRepository.findTopByCapacity(PageRequest.of(0, Math.max(1, n)));
    }
}
