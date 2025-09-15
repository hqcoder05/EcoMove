package com.GiaoThongTM.demo.payments.dtos;

import com.GiaoThongTM.demo.payments.entities.PaymentMethod;
import com.GiaoThongTM.demo.payments.entities.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID paymentId;
    private UUID bookingId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private PaymentMethod method;
    private String provider;
    private String providerIntentId;
    private String providerTxnId;
    private String description;
    private Instant capturedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
