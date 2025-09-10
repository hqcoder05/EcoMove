package com.GiaoThongTM.demo.bookings.controllers;

import com.GiaoThongTM.demo.bookings.dtos.request.BookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.BookingUpdateRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.CancelBookingRequest;
import com.GiaoThongTM.demo.commons.dtos.ApiResponse;
import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.bookings.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** USER: tạo booking */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        BookingResponse bookingResponse = bookingService.createBooking(bookingRequest);
        var response = ApiResponse.<BookingResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Đặt xe thành công! Vui lòng chờ xác nhận.")
                .result(bookingResponse)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** USER: lấy booking của chính mình (Pending/Confirmed) */
    @GetMapping("/get-user-booking")
    public ResponseEntity<ApiResponse<BookingResponse>> getUserBooking() {
        BookingResponse bookingResponse = bookingService.getUserBooking();
        var response = ApiResponse.<BookingResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin đặt xe thành công.")
                .result(bookingResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    /** USER: huỷ booking của chính mình (đổi trạng thái thành Canceled, không xóa record) */
    @PutMapping("/cancel-user-booking")
    public ResponseEntity<ApiResponse<String>> cancelUserBooking() {
        bookingService.cancelUserBooking();
        var response = ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Huỷ đơn thành công.")
                .result("OK")
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: lấy chi tiết 1 booking */
    @GetMapping("/{bookingId}/get-booking")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable UUID bookingId) {
        BookingResponse bookingResponse = bookingService.getBooking(bookingId);
        var response = ApiResponse.<BookingResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin đơn đặt xe thành công.")
                .result(bookingResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: cập nhật nội dung 1 booking (chỉ cho phép khi đang Pending) */
    @PutMapping("/{bookingId}/update")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(@PathVariable UUID bookingId,
                                                                      @Valid @RequestBody BookingUpdateRequest bookingUpdateRequest) {
        BookingResponse bookingResponse = bookingService.updateBooking(bookingId, bookingUpdateRequest);
        var response = ApiResponse.<BookingResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thông tin đặt xe thành công.")
                .result(bookingResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: huỷ 1 booking bất kỳ (đổi trạng thái thành Canceled) */
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelBooking(@PathVariable UUID bookingId) {
        bookingService.cancelBooking(bookingId);
        var response = ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Huỷ đơn đặt xe thành công.")
                .result("OK")
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: xoá cứng 1 booking */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<String>> deleteBooking(@PathVariable UUID bookingId) {
        bookingService.deleteBooking(bookingId);
        var response = ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Xoá đơn đặt xe thành công.")
                .result("OK")
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: lấy tất cả booking */
    @GetMapping("/get-all")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        var response = ApiResponse.<List<BookingResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách đơn đặt xe thành công.")
                .result(bookings)
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: confirm 1 booking đang Pending
     *  LƯU Ý: Service hiện đặt tên hàm là ConfirmedBooking(UUID) (viết hoa chữ C).
     *  Nếu bạn đổi tên service → confirmBooking(UUID), hãy sửa lại chỗ gọi dưới đây.
     */
    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<ApiResponse<String>> confirmBooking(@PathVariable UUID bookingId) {
        bookingService.ConfirmedBooking(bookingId); // <-- khớp với tên hàm trong service hiện tại
        var response = ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Xác nhận đơn đặt xe thành công.")
                .result("OK")
                .build();
        return ResponseEntity.ok(response);
    }

    /** ADMIN: cập nhật trạng thái (chỉ cho phép Pending -> {Confirmed, Canceled}) */
    @PutMapping("/{bookingId}/update-status")
    public ResponseEntity<ApiResponse<String>> updateStatusBooking(@PathVariable UUID bookingId,
                                                                   @Valid @RequestBody CancelBookingRequest cancel) {
        bookingService.updateBookingStatus(bookingId, cancel);
        var response = ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật trạng thái đơn đặt xe thành công.")
                .result("OK")
                .build();
        return ResponseEntity.ok(response);
    }
}
