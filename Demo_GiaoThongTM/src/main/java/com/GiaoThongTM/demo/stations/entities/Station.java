package com.GiaoThongTM.demo.stations.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Station {

    @Id
    @UuidGenerator
    @Column(name = "station_id", nullable = false, updatable = false)
    private UUID stationId;

    @Column(name = "station_name", nullable = false)
    private String stationName;

    @Column(name = "address", nullable = false, length = 500)
    private String address;       // ⬅️ Bổ sung lại

    @Column(name = "district")
    private String district;

    @Column(name = "lat", nullable = false)
    private Double lat;

    @Column(name = "lon", nullable = false)
    private Double lon;

    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots;

    @Column(name = "available_slots", nullable = false)
    private Integer availableSlots;

    @Column(name = "status", nullable = false, length = 32)
    private String status;        // ⬅️ Bổ sung lại
}
