package com.GiaoThongTM.demo.payments.mappers;

import com.GiaoThongTM.demo.payments.dtos.PaymentResponse;
import com.GiaoThongTM.demo.payments.entities.Payment;

public class PaymentMapper {
    public static PaymentResponse toDto(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .bookingId(p.getBooking().getId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .method(p.getMethod())
                .provider(p.getProvider())
                .providerIntentId(p.getProviderIntentId())
                .providerTxnId(p.getProviderTxnId())
                .description(p.getDescription())
                .capturedAt(p.getCapturedAt())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
