package com.GiaoThongTM.demo.users.entities;

import com.GiaoThongTM.demo.users.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    @Column(unique = true, nullable = false)
    private UUID id;

    @Column(unique = false, nullable = true)
    private String name;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String phoneNumber;

//    @ManyToMany
//    private Set<Role> roles;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Set<Role> role;
}
