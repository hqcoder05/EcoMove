package com.GiaoThongTM.demo.stations.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationRequest {
    private String stationName;
    private String stationLocation;
}
