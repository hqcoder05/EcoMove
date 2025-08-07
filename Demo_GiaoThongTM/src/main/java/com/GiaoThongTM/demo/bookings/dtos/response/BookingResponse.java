package com.GiaoThongTM.demo.bookings.dtos.response;
import com.GiaoThongTM.demo.stations.dtos.response.StationResponse;
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
    private StationResponse pickupStation;
    private StationResponse returnStation;
    private BookingStatus status;
    private VehicleResponse vehicle;
}
