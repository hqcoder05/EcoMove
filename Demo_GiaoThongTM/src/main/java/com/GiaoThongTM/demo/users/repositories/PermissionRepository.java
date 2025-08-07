package com.GiaoThongTM.demo.users.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.GiaoThongTM.demo.users.entities.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {
}
