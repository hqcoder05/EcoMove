package com.GiaoThongTM.demo.vehicles.entities;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.vehicles.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Table(name = "vehicles")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // dùng Hibernate 6+
    @Column(name = "vehicle_id", updatable = false, nullable = false)
    private UUID vehicleId;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Column(name = "type", length = 50, nullable = false)
    private String type;

    // ====== các field phục vụ UI ======
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // Giá theo VND/ngày, lưu dạng số (Long). Mapper sẽ format "1.200.000" cho UI
    @Column(name = "price_per_day_vnd")
    private Long pricePerDay;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "seats")
    private Integer seats;

    @Column(name = "trunk_liters")
    private Integer trunkLiters;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    // Quan hệ với trạm (nếu cần dùng)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "vehicle_stations",
        joinColumns = @JoinColumn(name = "vehicle_id", referencedColumnName = "vehicle_id"),
        inverseJoinColumns = @JoinColumn(name = "station_id", referencedColumnName = "station_id")
    )
    @Builder.Default
    private Set<Station> stations = new HashSet<>();
}
