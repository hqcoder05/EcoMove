package com.GiaoThongTM.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvalidatedToken {
    @Id
    String id; //Id này chính là jwtID(UUID.randomUUID().toString()) trong AuthenticationService

    Date expiryTime;
}
