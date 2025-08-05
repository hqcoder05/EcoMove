package com.GiaoThongTM.demo.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

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

    private Set<Station> stations;
}
