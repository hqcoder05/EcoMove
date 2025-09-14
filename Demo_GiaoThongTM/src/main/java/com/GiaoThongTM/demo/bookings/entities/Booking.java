package com.GiaoThongTM.demo.bookings.entities;

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

    private long totalPrice;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private Long durationDays;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String pickupArea;

    private String  returnArea;

    @ManyToOne
    private Vehicle vehicle;
}
