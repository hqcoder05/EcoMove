package com.GiaoThongTM.demo.users.controllers;

import com.GiaoThongTM.demo.commons.dtos.ApiResponse;
import com.GiaoThongTM.demo.users.dtos.response.UserResponse;
import com.GiaoThongTM.demo.users.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/get-user-profile")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile() {
        UserResponse user = userService.getMyInfo();

        var response = ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Success")
                .result(user)
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        var response = ApiResponse.<List<UserResponse>>builder()
                .code(200)
                .message("Success")
                .result(userService.getAllUsers())
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID userId) {
        var response = ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Success")
                .result(userService.getUserProfile(userId))
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable("userId") UUID userId) {
        userService.deleteUser(userId);
        var response = ApiResponse.<String>builder()
                .code(200)
                .message("Deleted Success")
                .result("User has been deleted")
                .build();
        return ResponseEntity.status(response.getCode()).body(response);
    }
}
