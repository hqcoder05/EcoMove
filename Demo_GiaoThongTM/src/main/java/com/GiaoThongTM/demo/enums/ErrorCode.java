package com.GiaoThongTM.demo.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_EXISTED(HttpStatus.BAD_REQUEST.value(), "Tên tài khoản đã tồn tại"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED.value(), "Không đủ thẩm quyền"),
    TOKEN_SIGNING_FAILED(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Không thể tạo mã xác thực"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND.value(), "Không tìm thấy tài khoản"),
    INVALID_TOKEN(HttpStatus.BAD_REQUEST.value(), "Token không hợp lệ"),
    PASSWORD_WASUSED(HttpStatus.BAD_REQUEST.value(), "Mật khẩu đã tồn tại"),
    UNAUTHORIZED(HttpStatus.BAD_REQUEST.value(), "Bạn không có đủ thẩm quyền"),
    USERNAME_INVALID(HttpStatus.BAD_REQUEST.value(), "Tên tài khoản không hợp lệ");


    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}
