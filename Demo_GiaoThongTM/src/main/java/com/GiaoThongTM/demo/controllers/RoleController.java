package com.GiaoThongTM.demo.controllers;

import com.GiaoThongTM.demo.dtos.request.RoleRequest;
import com.GiaoThongTM.demo.dtos.response.ApiResponse;
import com.GiaoThongTM.demo.dtos.response.RoleResponse;
import com.GiaoThongTM.demo.services.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@RequestBody RoleRequest role) {
        var roles = ApiResponse.<RoleResponse>builder()
                .code(200)
                .message("Role created")
                .result(roleService.create(role))
                .build();
        return ResponseEntity.status(roles.getCode()).body(roles);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getRoles() {
        var roles = ApiResponse.<List<RoleResponse>>builder()
                .code(200)
                .message("Roles list")
                .result(roleService.getAll())
                .build();
        return ResponseEntity.status(roles.getCode()).body(roles);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable String role) {
        roleService.deleteRole(role);
        var roles = ApiResponse.<Void>builder()
                .code(200)
                .message("Role deleted")
                .build();
        return ResponseEntity.status(roles.getCode()).body(roles);
    }
}
