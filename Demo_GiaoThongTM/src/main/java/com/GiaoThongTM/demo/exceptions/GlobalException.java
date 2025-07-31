package com.GiaoThongTM.demo.exceptions;

import com.GiaoThongTM.demo.dtos.response.ApiResponse;
import com.GiaoThongTM.demo.enums.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalException {

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<Object>> handleAppException(AppException exception){
        ErrorCode errorCode = exception.getErrorCode();
        var response =ApiResponse.builder()
                .code(errorCode.getCode())
                .message(exception.getMessage())
                .error("AppException")
                .build();

        return ResponseEntity.status(errorCode.getCode()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException exception){
        String message = exception.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        var response =ApiResponse.builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .error("ValidationException")
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST.value()).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Object>> handleJsonParseException(HttpMessageNotReadableException exception){
        var response =ApiResponse.builder().code(HttpStatus.BAD_REQUEST.value())
                .message(exception.getMessage())
                .error("HttpException")
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST.value()).body(response);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Object>> handleFallBackException(Exception exception){
        var response =ApiResponse.builder().code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(exception.getMessage())
                .error("UnexpectedException")
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR.value()).body(response);
    }
}
