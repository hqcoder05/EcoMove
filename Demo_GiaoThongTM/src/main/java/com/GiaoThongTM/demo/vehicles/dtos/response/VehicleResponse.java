package com.GiaoThongTM.demo.vehicles.dtos.response;

import lombok.*;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {
    // Trả đúng shape UI mong đợi
    private UUID id;
    private String name;
    private String image;
    private String price;   // "1.200.000"
    private String type;
    private String range;   // "450km"
    private String seats;   // "5 chỗ"
    private String trunk;   // "450L"
    private String status;  // "available" | "rented" | "maintenance"
}
