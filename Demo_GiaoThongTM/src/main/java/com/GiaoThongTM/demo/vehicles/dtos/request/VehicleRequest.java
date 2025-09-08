package com.GiaoThongTM.demo.vehicles.dtos.request;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VehicleRequest {
    // Giữ nguyên tên field theo UI để FE gửi thẳng không phải đổi
    private String name;     // entity.name
    private String image;    // entity.imageUrl
    private String price;    // "1.200.000" -> entity.pricePerDay (Long)
    private String type;     // entity.type
    private String range;    // "450km" -> entity.rangeKm (Integer)
    private String seats;    // "5 chỗ" -> entity.seats (Integer)
    private String trunk;    // "450L" -> entity.trunkLiters (Integer)
    private String status;   // "available"|"rented"|"maintenance" -> enum
}
