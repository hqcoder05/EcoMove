package com.GiaoThongTM.demo.users.controllers;

import com.GiaoThongTM.demo.users.dtos.request.SignIn;
import com.GiaoThongTM.demo.users.dtos.request.SignOut;
import com.GiaoThongTM.demo.users.dtos.request.SignUp;
import com.GiaoThongTM.demo.commons.dtos.ApiResponse;
import com.GiaoThongTM.demo.users.dtos.response.AuthResponse;
import com.GiaoThongTM.demo.users.services.AuthService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/sign-in")
    public ResponseEntity<ApiResponse<AuthResponse>> signIn(@Valid @RequestBody SignIn request){
        var result = authService.signIn(request);

        var response = ApiResponse.<AuthResponse>builder()
                .code(200)
                .message("OK")
                .result(result)
                .build();

        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/sign-up")
    public ResponseEntity<ApiResponse<AuthResponse>> signUp(@Valid @RequestBody SignUp request){
        AuthResponse result = authService.signUp(request);
        var response = ApiResponse.<AuthResponse>builder()
                .code(201)
                .message("Tạo tài khoản mới thành công")
                .result(result)
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/sign-out")
    public ResponseEntity<ApiResponse<String>> signOut(@RequestBody SignOut request) throws ParseException, JOSEException {
        authService.signOut(request);
        var response = ApiResponse.<String>builder()
                .code(200)
                .message("Đăng xuất thành công")
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }
}
