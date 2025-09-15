package com.GiaoThongTM.demo.payments.services;

import com.GiaoThongTM.demo.payments.dtos.CapturePaymentRequest;
import com.GiaoThongTM.demo.payments.dtos.CreatePaymentRequest;
import com.GiaoThongTM.demo.payments.entities.Payment;
import com.GiaoThongTM.demo.payments.entities.PaymentMethod;
import com.GiaoThongTM.demo.payments.entities.PaymentStatus;
import com.GiaoThongTM.demo.payments.repositories.PaymentRepository;
import com.GiaoThongTM.demo.bookings.entities.Booking;      // chỉnh package cho đúng
import com.GiaoThongTM.demo.bookings.repositories.BookingRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final BookingRepository bookingRepo;

    @Transactional(readOnly = true)
    public List<Payment> listByBooking(UUID bookingId) {
        return paymentRepo.findByBooking_Id(bookingId);
    }

    @Transactional(readOnly = true)
    public Payment get(UUID paymentId) {
        return paymentRepo.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));
    }

    @Transactional
    public Payment createForBooking(UUID bookingId, CreatePaymentRequest req) {
        if (req.getIdempotencyKey() != null) {
            Optional<Payment> existed = paymentRepo.findByIdempotencyKey(req.getIdempotencyKey());
            if (existed.isPresent()) {
                log.info("Idempotent hit for key: {}", req.getIdempotencyKey());
                return existed.get();
            }
        }

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        BigDecimal amount = (req.getAmount() != null) ? req.getAmount() : resolveBookingTotal(booking);
        String currency   = (req.getCurrency() != null) ? req.getCurrency() : "VND";
        if (req.getMethod() == null) {
            throw new IllegalArgumentException("Payment method is required");
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(amount)
                .currency(currency)
                .status(PaymentStatus.PENDING)
                .method(req.getMethod())
                .provider(req.getProvider())
                .description(req.getDescription())
                .idempotencyKey(req.getIdempotencyKey())
                .refundedAmount(BigDecimal.ZERO)
                .build();

        payment = paymentRepo.save(payment);

        // Nếu phương thức là CASH → có thể "thu ngay" (capture) luôn cho test nhanh:
        if (req.getMethod() == PaymentMethod.CASH) {
            captureInternal(payment, new CapturePaymentRequest()); // providerTxnId có thể null
        }

        return payment;
    }

    @Transactional
    public Payment capture(UUID paymentId, CapturePaymentRequest req) {
        Payment payment = get(paymentId);

        if (payment.getStatus() == PaymentStatus.CAPTURED) return payment;
        if (payment.getStatus() == PaymentStatus.CANCELLED || payment.getStatus() == PaymentStatus.FAILED) {
            throw new IllegalStateException("Payment cannot be captured from status " + payment.getStatus());
        }

        return captureInternal(payment, req);
    }

    private Payment captureInternal(Payment payment, CapturePaymentRequest req) {
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setCapturedAt(Instant.now());
        if (req != null && req.getProviderTxnId() != null) {
            payment.setProviderTxnId(req.getProviderTxnId());
        }
        paymentRepo.save(payment);

        log.info("Payment {} captured for booking {}", payment.getPaymentId(), payment.getBooking().getId());
        return payment;
    }

    private BigDecimal resolveBookingTotal(Booking booking) {
        throw new IllegalStateException("Chưa map tổng tiền từ Booking: hãy thay code tại resolveBookingTotal()");
    }
}
