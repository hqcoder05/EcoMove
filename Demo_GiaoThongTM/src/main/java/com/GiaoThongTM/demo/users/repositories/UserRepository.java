package com.GiaoThongTM.demo.users.repositories;

import com.GiaoThongTM.demo.users.entities.User;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>{
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
