package com.GiaoThongTM.demo.mappers;

import com.GiaoThongTM.demo.dtos.request.RoleRequest;
import com.GiaoThongTM.demo.dtos.response.RoleResponse;
import com.GiaoThongTM.demo.entities.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permission", ignore = true)
    Role toRole(RoleRequest roleRequest);
    RoleResponse toRoleResponse(Role role);
}
