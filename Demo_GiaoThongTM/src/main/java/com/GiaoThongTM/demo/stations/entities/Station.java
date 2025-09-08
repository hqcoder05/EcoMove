package com.GiaoThongTM.demo.stations.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;           // <— thêm import

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Station {

    @Id
    @UuidGenerator                                     // <— để Hibernate tự sinh UUID
    @Column(name = "station_id", nullable = false, updatable = false)
    private UUID stationId;

    @Column(name = "station_name", nullable = false)
    private String stationName;

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
}
