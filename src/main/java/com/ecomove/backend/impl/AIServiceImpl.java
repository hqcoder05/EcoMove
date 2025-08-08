package com.ecomove.backend.impl;

import com.ecomove.backend.model.Station;
import com.ecomove.backend.service.AIService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * Triển khai dịch vụ AI để gợi ý trạm sạc thay thế gần nhất còn khả dụng.
 */
@Service
public class AIServiceImpl implements AIService {

    @Override
    public Station suggestAlternativeStation(List<Station> stationList) {
        if (stationList == null || stationList.isEmpty()) {
            return null;
        }

        return stationList.stream()
                // Lọc ra những trạm chưa đầy (còn chỗ chứa xe)
                .filter(station -> station.getAvailableVehicles() < station.getCapacity())
                // Chọn trạm có nhiều chỗ trống nhất (ưu tiên cách nhỏ nhất cũng được)
                .min(Comparator.comparingInt(
                        station -> station.getCapacity() - station.getAvailableVehicles()
                ))
                .orElse(null);
    }
}
