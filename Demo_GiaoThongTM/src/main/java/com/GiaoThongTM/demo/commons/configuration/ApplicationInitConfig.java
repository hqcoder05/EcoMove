package com.GiaoThongTM.demo.commons.configuration;

import com.GiaoThongTM.demo.commons.constants.PredefinedRole;
import com.GiaoThongTM.demo.users.entities.Role;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.users.repositories.RoleRepository;
import com.GiaoThongTM.demo.users.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    @NonFinal
    private static final String ADMIN_USER_NAME = "admin@gmail.com";
    @NonFinal
    private static final String ADMIN_PASSWORD = "123456";

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
            if(userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.USER_ROLE)
                        .description("user role")
                        .build());

                Role adminRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN_ROLE)
                        .description("admin role")
                        .build());

                var roles = new HashSet<Role>();

                roles.add(adminRole);

                User user = User.builder()
                        .username(ADMIN_USER_NAME)
                        .password(ADMIN_PASSWORD)
                        .roles(roles)
                        .build();
                userRepository.save(user);
            }
        };
    };
}
