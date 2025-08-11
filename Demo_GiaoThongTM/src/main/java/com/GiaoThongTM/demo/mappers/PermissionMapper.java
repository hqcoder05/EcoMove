package com.GiaoThongTM.demo.mappers;

import com.GiaoThongTM.demo.dtos.request.PermissionRequest;
import com.GiaoThongTM.demo.dtos.response.PermissionResponse;
import com.GiaoThongTM.demo.entities.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest permission);
    PermissionResponse toPermissionResponse(Permission permission);
}
