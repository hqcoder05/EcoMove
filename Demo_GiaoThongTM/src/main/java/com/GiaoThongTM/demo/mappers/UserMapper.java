package com.GiaoThongTM.demo.mappers;

import com.GiaoThongTM.demo.dtos.request.SignUp;
import com.GiaoThongTM.demo.dtos.request.UserUpdateRequest;
import com.GiaoThongTM.demo.dtos.response.UserResponse;
import com.GiaoThongTM.demo.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(SignUp userCreationRequest);
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest userUpdateRequest);
}
