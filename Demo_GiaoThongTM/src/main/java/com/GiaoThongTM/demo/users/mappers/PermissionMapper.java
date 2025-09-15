package com.GiaoThongTM.demo.users.mappers;

import com.GiaoThongTM.demo.users.dtos.request.PermissionRequest;
import com.GiaoThongTM.demo.users.dtos.response.PermissionResponse;
import com.GiaoThongTM.demo.users.entities.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest permission);
    PermissionResponse toPermissionResponse(Permission permission);
}
