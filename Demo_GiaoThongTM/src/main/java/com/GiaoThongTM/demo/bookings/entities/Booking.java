package com.GiaoThongTM.demo.bookings.entities;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.vehicles.entities.Vehicle;
import com.GiaoThongTM.demo.bookings.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false, updatable = false)
    private UUID id;

    private LocalDate pickupTime;

    private LocalDate returnTime;

    private String notes;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "pickup_station_id")
    private Station pickupStation;

    @ManyToOne
    @JoinColumn(name = "return_station_id")
    private Station returnStation;

    @ManyToOne
    private Vehicle vehicle;
}
