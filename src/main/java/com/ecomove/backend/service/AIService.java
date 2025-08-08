package com.ecomove.backend.service;

import com.ecomove.backend.model.Station;

import java.util.List;

/**
 * Dịch vụ AI hỗ trợ gợi ý trạm sạc thay thế trong trường hợp trạm hiện tại đã đầy.
 */
public interface AIService {

    /**
     * Gợi ý trạm thay thế gần nhất còn khả dụng (số xe đang có < sức chứa tối đa).
     *
     * @param nearbyStations Danh sách các trạm đã được lọc theo vị trí gần người dùng
     * @return Trạm phù hợp nhất còn chỗ trống, hoặc null nếu không có
     */
    Station suggestAlternativeStation(List<Station> nearbyStations);
}
