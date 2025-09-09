package com.GiaoThongTM.demo.users.mappers;

import com.GiaoThongTM.demo.users.dtos.request.SignUp;
import com.GiaoThongTM.demo.users.dtos.request.UserUpdateRequest;
import com.GiaoThongTM.demo.users.dtos.response.UserResponse;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.users.enums.Role;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class UserCustomMapper {
    public User toUser(SignUp request){

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(new HashSet<>(Set.of(Role.USER)));

        return user;
    }

    public UserResponse toUserResponse(User user){
        if (user == null) {
            return null;
        }

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setUsername(user.getUsername());
        userResponse.setName(user.getName());
        user.setRole(user.getRole());

        return userResponse;
    }

    public void toUserUpdate(User user, UserUpdateRequest request){
        if(user == null || request == null){
            return;
        }
        if(request.getUsername() != null){
            user.setUsername(request.getUsername());
        }
        if(request.getPassword() != null){
            user.setPassword(request.getPassword());
        }
        if(request.getPhoneNumber() != null){
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if(request.getFullName() != null){
            user.setName(request.getFullName());
        }
    }
}
