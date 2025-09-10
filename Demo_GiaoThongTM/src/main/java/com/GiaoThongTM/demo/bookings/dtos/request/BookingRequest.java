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
public class BookingRequest {
    private String fullName;
    private String phoneNumber;
    private String email;
    private LocalDate pickupTime;
    private LocalDate returnTime;
    private String pickupArea;
    private String returnArea;
    private UUID vehicleTypeId;
}
