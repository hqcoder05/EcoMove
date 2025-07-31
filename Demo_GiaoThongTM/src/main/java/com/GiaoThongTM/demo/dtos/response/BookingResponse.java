package com.GiaoThongTM.demo.dtos.response;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private LocalDate pickupTime;
    private LocalDate returnTime;
    private String pickupStation;
    private String returnStation;
    private VehicleResponse vehicle;
}
