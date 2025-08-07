package com.GiaoThongTM.demo.bookings.controllers;

import com.GiaoThongTM.demo.bookings.dtos.request.BookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.BookingUpdateRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.CancelBookingRequest;
import com.GiaoThongTM.demo.commons.dtos.ApiResponse;
import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.bookings.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        BookingResponse bookingResponse = bookingService.createBooking(bookingRequest);
        var response = ApiResponse.<BookingResponse>builder()
                .code(200)
                .message("Đặt xe thành công! Vui lòng chờ xác nhận")
                .result(bookingResponse)
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/get-booking")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable UUID bookingId) {
        BookingResponse bookingResponse = bookingService.getBooking(bookingId);
        var response = ApiResponse.<BookingResponse>builder()
                .code(200)
                .message("Lấy thông tin đơn đặt xe thành công!")
                .result(bookingResponse)
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PutMapping("/{bookingId}/update")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(@PathVariable UUID bookingId,
                                                                      @Valid @RequestBody BookingUpdateRequest bookingUpdateRequest) {
        BookingResponse bookingResponse = bookingService.updateBooking(bookingId, bookingUpdateRequest);
        var response = ApiResponse.<BookingResponse>builder()
                .code(200)
                .message("Cập nhật thông tin đặt xe thành công!")
                .result(bookingResponse)
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelBooking(@PathVariable UUID bookingId) {
        bookingService.cancelBooking(bookingId);
        var response = ApiResponse.<String>builder()
                .code(200)
                .result("Huy đơn đặt xe thành công")
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<String>> deleteBooking(@PathVariable UUID bookingId) {
        bookingService.deleteBooking(bookingId);
        var response = ApiResponse.<String>builder()
                .code(200)
                .result("Xóa đơn đặt xe thành công")
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/{bookingId}/get-all")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings(@PathVariable UUID bookingId) {
        List<BookingResponse> booking = bookingService.getAllBookings();
        var response = ApiResponse.<List<BookingResponse>>builder()
                .code(200)
                .message("Lấy danh sách đơn đặt xe thành công!")
                .result(booking)
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<ApiResponse<String>> confirmBooking(@PathVariable UUID bookingId) {
        bookingService.confirmedBooking(bookingId);
        var response = ApiResponse.<String>builder()
                .code(200)
                .result("Xác nhận đơn đặt xe thành công!")
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PutMapping("/{bookingId}/update-status")
    public ResponseEntity<ApiResponse<String>> updateStatusBooking(@PathVariable UUID bookingId,
                                                                   @Valid @RequestBody CancelBookingRequest cancel){
        bookingService.updateBookingStatus(bookingId, cancel);
        var response = ApiResponse.<String>builder()
                .code(200)
                .result("Cập nhật trạng thái đơn đặt xe thành công")
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }
}
