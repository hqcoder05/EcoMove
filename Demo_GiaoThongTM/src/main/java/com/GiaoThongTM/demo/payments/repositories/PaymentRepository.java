package com.GiaoThongTM.demo.payments.repositories;

import com.GiaoThongTM.demo.payments.entities.Payment;
import com.GiaoThongTM.demo.payments.entities.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByBooking_Id(UUID bookingId);
    Optional<Payment> findFirstByBooking_IdAndStatusOrderByCreatedAtDesc(UUID bookingId, PaymentStatus status);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
}

