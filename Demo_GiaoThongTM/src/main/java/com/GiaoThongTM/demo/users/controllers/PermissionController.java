package com.GiaoThongTM.demo.users.controllers;

import com.GiaoThongTM.demo.users.dtos.request.PermissionRequest;
import com.GiaoThongTM.demo.commons.dtos.ApiResponse;
import com.GiaoThongTM.demo.users.dtos.response.PermissionResponse;
import com.GiaoThongTM.demo.users.services.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permission")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(PermissionRequest request) {
        var permission = permissionService.createPermission(request);
        var apiResponse = ApiResponse.<PermissionResponse>builder()
                .code(200)
                .message("Permission created")
                .result(permission)
                .build();
        return ResponseEntity.status(apiResponse.getCode()).body(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getPermission() {
        var permission = ApiResponse.<List<PermissionResponse>>builder()
                .code(200)
                .message("Permission list")
                .result(permissionService.getAll())
                .build();
        return ResponseEntity.status(permission.getCode()).body(permission);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deletePermission(@PathVariable String permission) {
        permissionService.deletePermission(permission);
        var permissions = ApiResponse.<Void>builder()
                .code(200)
                .message("Deleted permission")
                .build();
        return ResponseEntity.status(permissions.getCode()).body(permissions);
    }
}
