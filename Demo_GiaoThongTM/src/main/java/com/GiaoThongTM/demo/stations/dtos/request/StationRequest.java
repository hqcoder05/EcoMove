package com.GiaoThongTM.demo.stations.dtos.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationRequest {
    @NotBlank
    private String name;          // map -> stationName

    @NotBlank
    private String address;       // map -> district (tạm xem như địa chỉ)

    @NotNull @Min(1)
    private Integer capacity;     // map -> totalSlots

    // optional: nếu không gửi thì mặc định = capacity
    @Min(0)
    private Integer availableSlots;

    @NotNull @DecimalMin(value="-90.0") @DecimalMax(value="90.0")
    private Double latitude;      // map -> lat

    @NotNull @DecimalMin(value="-180.0") @DecimalMax(value="180.0")
    private Double longitude;     // map -> lon
}
