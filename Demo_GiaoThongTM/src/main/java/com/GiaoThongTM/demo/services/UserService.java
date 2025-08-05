package com.GiaoThongTM.demo.services;

import com.GiaoThongTM.demo.constants.PredefinedRole;
import com.GiaoThongTM.demo.dtos.request.SignUp;
import com.GiaoThongTM.demo.dtos.request.UserUpdateRequest;
import com.GiaoThongTM.demo.dtos.response.UserResponse;
import com.GiaoThongTM.demo.entities.Role;
import com.GiaoThongTM.demo.entities.User;
import com.GiaoThongTM.demo.enums.ErrorCode;
import com.GiaoThongTM.demo.exceptions.AppException;
import com.GiaoThongTM.demo.mappers.UserMapper;
import com.GiaoThongTM.demo.repositories.RoleRepository;
import com.GiaoThongTM.demo.repositories.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.KeyLengthException;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public UserResponse getUserProfile(UUID userId){
        User user = findByIdOrThrow(userId);
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(UUID userId, UserUpdateRequest updateRequest){
        User user = findByIdOrThrow(userId);
        userMapper.updateUser(user, updateRequest);
        var roles = roleRepository.findAllById(updateRequest.getRoles());
        user.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(user);
    }

    public User findByUsernameOrThrow(String username){
        return userRepository.findByUsername(username).orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public User findByIdOrThrow(UUID userId){
        return userRepository.findById(userId)
                .orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public void deleteUser(UUID userId){
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers(){
        return userRepository.findAll().stream().map(user -> userMapper.toUserResponse(user)).toList();
    }
}
