package com.GiaoThongTM.demo.dtos.response;

import lombok.*;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {
    private String vehicleName;
    private String vehicleType;
    private List<Object> stations;
}
