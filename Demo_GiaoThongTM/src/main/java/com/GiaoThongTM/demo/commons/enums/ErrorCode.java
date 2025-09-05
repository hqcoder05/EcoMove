package com.GiaoThongTM.demo.commons.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_EXISTED(HttpStatus.BAD_REQUEST.value(), "Tên tài khoản đã tồn tại"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED.value(), "Không đủ thẩm quyền"),
    FIELD_ERROR(HttpStatus.BAD_REQUEST.value(), "Tên trường không được để trống"),
    STATION_ERROR(HttpStatus.BAD_REQUEST.value(), "Không tìm thấy trạm"),
    VEHICLETYPE_ERROR(HttpStatus.BAD_REQUEST.value(), "Không tìm thấy loại phương tiện này"),
    BOOKING_INVALID(HttpStatus.BAD_REQUEST.value(), "Không tìm thấy lịch sử thuê xe"),
    PENDING_INVALID(HttpStatus.BAD_REQUEST.value(), "Chỉ trạng thái chơf mới được phép cập nhật"),
    USERBOOKING_INVALID(HttpStatus.BAD_REQUEST.value(), "Tên tài khoản không hợp lệ để cập nhật lịch sử đặt xe"),
    GETBOOKING_INVALID(HttpStatus.BAD_REQUEST.value(), "Tên tài khoản không hợp lệ để xem lịch sử đặt xe"),
    STATUS_UNCHANGED(HttpStatus.BAD_REQUEST.value(), "Trạng thái mới trùng với trạng thái hiện tại"),
    STATUS_INVALID_TRANSITION(HttpStatus.BAD_REQUEST.value(), "Chuyển trạng thái không hợp lệ"),
    BOOKING_DUPLICATE(HttpStatus.BAD_REQUEST.value(), "Bạn chỉ được đặt 1 lịch. Hãy huỷ lịch cũ để đặt mới!"),
    VEHICLE_INVALID(HttpStatus.BAD_REQUEST.value(), "Phương tiện không có sẵn ở trạm này"),
    TOKEN_SIGNING_FAILED(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Không thể tạo mã xác thực"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND.value(), "Không tìm thấy tài khoản"),
    INVALID_TOKEN(HttpStatus.BAD_REQUEST.value(), "Token không hợp lệ"),
    PASSWORD_WASUSED(HttpStatus.BAD_REQUEST.value(), "Mật khẩu đã tồn tại"),
    UNAUTHORIZED(HttpStatus.BAD_REQUEST.value(), "Bạn không có đủ thẩm quyền"),
    INVALID_PICKUPTIME(HttpStatus.BAD_REQUEST.value(), "Thời gian đăt phải lớn hơn hoăc bằng thời điểm hiện tại"),
    INVALID_RETURNTIME(HttpStatus.BAD_REQUEST.value(), "Thời gian trả xe không thể lớn hơn thời gian đặt xe"),
    USERNAME_INVALID(HttpStatus.BAD_REQUEST.value(), "Tên tài khoản không hợp lệ");


    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}
