package com.GiaoThongTM.demo.commons.configuration;

import com.GiaoThongTM.demo.commons.constants.PredefinedRole;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.users.enums.Role;
import com.GiaoThongTM.demo.users.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    @NonFinal
    private static final String ADMIN_USER_NAME = "admin@gmail.com";
    @NonFinal
    private static final String ADMIN_PASSWORD = "SecurePass2025!";

    private final UserRepository userRepository;

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            if(userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                Set<Role> roles = new HashSet<>();
                roles.add(Role.ADMIN);

                User user = User.builder()
                        .username(ADMIN_USER_NAME)
                        .name("Admin")
                        .role(roles)
                        .phoneNumber("023869789")
                        .password(ADMIN_PASSWORD)
                        .build();

                userRepository.save(user);
            }
        };
    };
}
