package com.GiaoThongTM.demo.payments.dtos;

import com.GiaoThongTM.demo.payments.entities.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {
    private BigDecimal amount;         // nếu null -> lấy theo booking.total
    private String currency;           // mặc định "VND"
    private PaymentMethod method;      // CASH/CARD/EWALLET/BANK_TRANSFER
    private String provider;           // "MOMO"/"ZALOPAY"/"VNPAY"/...
    private String description;        // mô tả đơn giản
    private String idempotencyKey;     // khuyến nghị truyền để chống double-charge
}
