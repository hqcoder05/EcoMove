package com.GiaoThongTM.demo.payments.controllers;

import com.GiaoThongTM.demo.payments.dtos.CapturePaymentRequest;
import com.GiaoThongTM.demo.payments.dtos.CreatePaymentRequest;
import com.GiaoThongTM.demo.payments.dtos.PaymentResponse;
import com.GiaoThongTM.demo.payments.mappers.PaymentMapper;
import com.GiaoThongTM.demo.payments.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    // Tạo "ý định thanh toán" hoặc thanh toán tiền mặt (auto capture)
    @PostMapping("/bookings/{bookingId}/payments")
    public ResponseEntity<PaymentResponse> createForBooking(
            @PathVariable UUID bookingId,
            @RequestBody CreatePaymentRequest req
    ) {
        var payment = paymentService.createForBooking(bookingId, req);
        return ResponseEntity.ok(PaymentMapper.toDto(payment));
    }

    // Danh sách payment của 1 booking
    @GetMapping("/bookings/{bookingId}/payments")
    public ResponseEntity<List<PaymentResponse>> listForBooking(@PathVariable UUID bookingId) {
        var list = paymentService.listByBooking(bookingId).stream()
                .map(PaymentMapper::toDto)
                .collect(toList());
        return ResponseEntity.ok(list);
    }

    // Lấy chi tiết 1 payment
    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<PaymentResponse> get(@PathVariable UUID paymentId) {
        var payment = paymentService.get(paymentId);
        return ResponseEntity.ok(PaymentMapper.toDto(payment));
    }

    // Xác nhận thu tiền (capture) — dùng cho cổng thanh toán hoặc mô phỏng
    @PostMapping("/payments/{paymentId}/capture")
    public ResponseEntity<PaymentResponse> capture(
            @PathVariable UUID paymentId,
            @RequestBody(required = false) CapturePaymentRequest req
    ) {
        var payment = paymentService.capture(paymentId, req == null ? new CapturePaymentRequest() : req);
        return ResponseEntity.ok(PaymentMapper.toDto(payment));
    }
}
