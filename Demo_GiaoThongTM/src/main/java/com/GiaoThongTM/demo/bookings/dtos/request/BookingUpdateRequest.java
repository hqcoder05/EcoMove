package com.GiaoThongTM.demo.bookings.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingUpdateRequest {
    private LocalDate pickupTime;
    private LocalDate returnTime;
    private UUID pickupStationId;
    private UUID returnStationId;
    private UUID vehicleTypeId;
}
