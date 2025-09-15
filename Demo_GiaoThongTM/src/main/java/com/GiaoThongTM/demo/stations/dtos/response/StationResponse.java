package com.GiaoThongTM.demo.stations.dtos.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationResponse {
    private UUID id;         // map từ stationId
    private String name;     // map từ stationName
    private String address;  // tạm map từ district (hoặc cột address nếu có)
    private Integer capacity;// map từ totalSlots
    private String status;   // suy ra từ availableSlots (Hoạt động/Đầy chỗ)
    private Double latitude; // map từ lat
    private Double longitude;// map từ lon
}
