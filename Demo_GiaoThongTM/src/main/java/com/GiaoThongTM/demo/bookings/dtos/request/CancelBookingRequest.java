package com.GiaoThongTM.demo.bookings.dtos.request;

import com.GiaoThongTM.demo.bookings.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingRequest {
    private BookingStatus status;
    private String reason;
}
