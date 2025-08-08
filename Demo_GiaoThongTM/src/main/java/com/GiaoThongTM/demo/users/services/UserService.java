package com.GiaoThongTM.demo.users.services;

import com.GiaoThongTM.demo.commons.constants.PredefinedRole;
import com.GiaoThongTM.demo.users.dtos.request.SignUp;
import com.GiaoThongTM.demo.users.dtos.request.UserUpdateRequest;
import com.GiaoThongTM.demo.users.dtos.response.UserResponse;
import com.GiaoThongTM.demo.users.entities.Role;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.commons.enums.ErrorCode;
import com.GiaoThongTM.demo.commons.exceptions.AppException;
import com.GiaoThongTM.demo.users.mappers.UserMapper;
import com.GiaoThongTM.demo.users.repositories.RoleRepository;
import com.GiaoThongTM.demo.users.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final UserMapper userMapper;

    public User createUser(SignUp request){
        String username = request.getUsername();

        boolean existsByUsername = userRepository.existsByUsername(username);

        if(existsByUsername){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        User user = userRepository.findByUsername(name).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }


    public User findByUsernameOrThrow(String username){
        return userRepository.findByUsername(username).orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public User findByIdOrThrow(UUID userId){
        return userRepository.findById(userId)
                .orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public void deleteInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        User user = userRepository.findByUsername(name).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void deleteUser(UUID userId){
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse updateUser(UUID userId, UserUpdateRequest updateRequest){
        User user = findByIdOrThrow(userId);
        userMapper.updateUser(user, updateRequest);
        var roles = roleRepository.findAllById(updateRequest.getRoles());
        user.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse getUserProfile(UUID userId){
        User user = findByIdOrThrow(userId);
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> getAllUsers(){
        return userRepository.findAll().stream().map(user -> userMapper.toUserResponse(user)).toList();
    }
}
