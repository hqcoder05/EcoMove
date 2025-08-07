package com.GiaoThongTM.demo.bookings.repositories;

import com.GiaoThongTM.demo.bookings.entities.Booking;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.bookings.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    boolean existsByUserAndStatusIn(User user, Collection<BookingStatus> statuses);
}
