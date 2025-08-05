package com.GiaoThongTM.demo.dtos.request;

import com.GiaoThongTM.demo.entities.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    private String pickupStation;
    private String returnStation;
    private LocalDate pickupTime;
    private LocalDate returnTime;
//    private List<User> user;
}
