package com.GiaoThongTM.demo.users.repositories;

import com.GiaoThongTM.demo.users.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
}
