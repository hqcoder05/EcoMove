package com.GiaoThongTM.demo.users.mappers;

import com.GiaoThongTM.demo.bookings.mappers.BookingMapper;
import com.GiaoThongTM.demo.users.dtos.request.SignUp;
import com.GiaoThongTM.demo.users.dtos.request.UserUpdateRequest;
import com.GiaoThongTM.demo.stations.dtos.response.StationResponse;
import com.GiaoThongTM.demo.users.dtos.response.UserResponse;
import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.users.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {BookingMapper.class})
public interface UserMapper {
    User toUser(SignUp userCreationRequest);
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest userUpdateRequest);

    StationResponse toStationResponse(Station station);
}
