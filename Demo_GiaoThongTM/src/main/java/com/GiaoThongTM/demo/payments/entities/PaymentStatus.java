package com.GiaoThongTM.demo.payments.entities;

public enum PaymentStatus {
    REQUIRES_METHOD,
    PENDING,          // đã tạo ý định thanh toán / chờ trả
    AUTHORIZED,       // (nếu có pre-auth)
    CAPTURED,         // đã trả thành công (đã thu tiền)
    FAILED,
    CANCELLED,
    REFUNDED,
    PARTIALLY_REFUNDED
}
