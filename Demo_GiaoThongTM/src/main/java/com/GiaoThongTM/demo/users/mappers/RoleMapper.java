package com.GiaoThongTM.demo.users.mappers;

import com.GiaoThongTM.demo.users.dtos.request.RoleRequest;
import com.GiaoThongTM.demo.users.dtos.response.RoleResponse;
import com.GiaoThongTM.demo.users.entities.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permission", ignore = true)
    Role toRole(RoleRequest roleRequest);
    RoleResponse toRoleResponse(Role role);
}
