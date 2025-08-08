package com.ecomove.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "station") // Đặt đúng tên bảng bạn dùng trong SQL
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double latitude;
    private double longitude;

    @Column(name = "available_vehicles")
    private int availableVehicles;

    private int capacity;

    private String status;

    // Constructor mặc định
    public Station() {}

    // Constructor đầy đủ
    public Station(String name, double latitude, double longitude, int availableVehicles, int capacity, String status) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.availableVehicles = availableVehicles;
        this.capacity = capacity;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public int getAvailableVehicles() { return availableVehicles; }
    public void setAvailableVehicles(int availableVehicles) { this.availableVehicles = availableVehicles; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // Logic helper
    @Transient
    public boolean getFull() {
        return availableVehicles >= capacity;
    }
}
