package com.GiaoThongTM.demo.vehicles.dtos.response;

import com.GiaoThongTM.demo.stations.dtos.response.StationResponse;
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
    private List<StationResponse> stations;
}
