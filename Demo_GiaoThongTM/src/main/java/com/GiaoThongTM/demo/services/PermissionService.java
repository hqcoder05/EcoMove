package com.GiaoThongTM.demo.services;

import com.GiaoThongTM.demo.dtos.request.PermissionRequest;
import com.GiaoThongTM.demo.dtos.response.PermissionResponse;
import com.GiaoThongTM.demo.entities.Permission;
import com.GiaoThongTM.demo.mappers.PermissionMapper;
import com.GiaoThongTM.demo.repositories.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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