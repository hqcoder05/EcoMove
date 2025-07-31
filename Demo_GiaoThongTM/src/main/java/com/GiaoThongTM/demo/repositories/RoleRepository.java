package com.GiaoThongTM.demo.repositories;

import com.GiaoThongTM.demo.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
}
