package com.GiaoThongTM.demo.vehicles.entities;

import com.GiaoThongTM.demo.stations.entities.Station;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;

import java.util.Set;
import java.util.UUID;

@Entity
public class Vehicle {
    @Id
    private UUID vehicleId;

    @Column(unique=false, nullable=true, length=200)
//    @NotBlank(message = "Tên xe không được để trống")
    private String name;

    @Column(unique=false, nullable=true, length=200)
//    @NotBlank(message = "Tên xe không được để trống")
    private String type; // Loại xe (xe máy, xe ô tô)

    @ManyToMany
    private Set<Station> stations;
}
