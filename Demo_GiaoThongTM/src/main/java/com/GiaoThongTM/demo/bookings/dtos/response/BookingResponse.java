package com.GiaoThongTM.demo.bookings.dtos.response;

import com.GiaoThongTM.demo.users.dtos.response.UserResponse;
import com.GiaoThongTM.demo.vehicles.dtos.response.VehicleResponse;
import com.GiaoThongTM.demo.bookings.enums.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private UUID bookingId;
    private LocalDate pickupTime;
    private LocalDate returnTime;
    private String pickupArea;
    private String returnArea;
    private BookingStatus status;
    private VehicleResponse vehicle;
    private long durationDays;
    private long totalPrice;
    private UserResponse user;
}
