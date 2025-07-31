package com.GiaoThongTM.demo.services;

import com.GiaoThongTM.demo.dtos.request.RoleRequest;
import com.GiaoThongTM.demo.dtos.response.RoleResponse;
import com.GiaoThongTM.demo.entities.Role;
import com.GiaoThongTM.demo.mappers.RoleMapper;
import com.GiaoThongTM.demo.repositories.PermissionRepository;
import com.GiaoThongTM.demo.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@EnableMethodSecurity
public class RoleService {
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final PermissionRepository permissionRepository;

    public RoleResponse create(RoleRequest roleRequest) {
        var roles = roleMapper.toRole(roleRequest);
        var permission = permissionRepository.findAllById(roleRequest.getPermissions());
        roles.setPermission(new HashSet<>(permission));
        return roleMapper.toRoleResponse(roleRepository.save(roles));
    }

    public List<RoleResponse> getAll() {
        var roles = roleRepository.findAll();
        return roles.stream().map(roleMapper::toRoleResponse).toList();
    }

    public void deleteRole(String role) {
        roleRepository.deleteById(role);
    }
}
