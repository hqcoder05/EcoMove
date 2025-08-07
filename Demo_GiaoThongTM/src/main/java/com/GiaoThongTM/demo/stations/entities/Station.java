package com.GiaoThongTM.demo.stations.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public class Station {
    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID stationId;

    private String stationName;

    private String stationLocation;
}
