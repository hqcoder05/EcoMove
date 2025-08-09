package com.ecomove.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Vehicle {

    @Id
    private Long id;

    private String name;
    private double lat;
    private double lng;

    private String status;

    // Constructors, getters, setters
}
