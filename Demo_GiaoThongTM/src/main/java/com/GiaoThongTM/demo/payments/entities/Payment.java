package com.GiaoThongTM.demo.payments.entities;

import com.GiaoThongTM.demo.bookings.entities.Booking;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments", indexes = {
        @Index(name="idx_pay_booking", columnList = "booking_id"),
        @Index(name="idx_pay_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @UuidGenerator
    @Column(name = "payment_id", nullable = false, updatable = false)
    private UUID paymentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    // ✅ map tới cột amount_vnd (đang NOT NULL bên DB)
    @Column(name = "amount_vnd", precision = 19, scale = 2, nullable = false)
    private BigDecimal amountVnd;

    @Column(name = "currency", length = 8, nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32, nullable = false)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", length = 32, nullable = false)
    private PaymentMethod method;

    @Column(name = "provider", length = 32)
    private String provider;

    @Column(name = "provider_intent_id", length = 128)
    private String providerIntentId;

    @Column(name = "provider_txn_id", length = 128)
    private String providerTxnId;

    @Column(name = "idempotency_key", length = 128, unique = true)
    private String idempotencyKey;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "refunded_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal refundedAmount;

    @Column(name = "captured_at")
    private Instant capturedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (currency == null) currency = "VND";
        if (status == null) status = PaymentStatus.PENDING;
        if (refundedAmount == null) refundedAmount = BigDecimal.ZERO;

        // ✅ đảm bảo không vi phạm NOT NULL: nếu chưa set thì copy từ amount
        if (amountVnd == null) {
            // nếu bạn có logic quy đổi ngoại tệ -> VND thì thay thế dòng này
            amountVnd = amount;
        }

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        // giữ đồng bộ nếu cần
        if (amountVnd == null) {
            amountVnd = amount;
        }
        updatedAt = Instant.now();
    }
}
