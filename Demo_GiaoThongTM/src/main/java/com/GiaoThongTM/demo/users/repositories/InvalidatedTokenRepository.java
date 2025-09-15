package com.GiaoThongTM.demo.users.repositories;

import com.GiaoThongTM.demo.users.entities.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
