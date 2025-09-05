package com.GiaoThongTM.demo.users.services;

import com.GiaoThongTM.demo.users.dtos.request.PermissionRequest;
import com.GiaoThongTM.demo.users.dtos.response.PermissionResponse;
import com.GiaoThongTM.demo.users.entities.Permission;
import com.GiaoThongTM.demo.users.mappers.PermissionMapper;
import com.GiaoThongTM.demo.users.repositories.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@EnableMethodSecurity
public class PermissionService {
    private final PermissionMapper permissionMapper;
    private final PermissionRepository permissionRepository;

    public PermissionResponse createPermission(PermissionRequest permissionRequest) {
        Permission permission = permissionMapper.toPermission(permissionRequest);
        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll() {
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void deletePermission(String permissionName) {
        permissionRepository.deleteById(permissionName);
    }
}