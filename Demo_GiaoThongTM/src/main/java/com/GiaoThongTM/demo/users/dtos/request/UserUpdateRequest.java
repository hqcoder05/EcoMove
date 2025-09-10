package com.GiaoThongTM.demo.users.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String username;
    private String fullName;
    private String phoneNumber;
    private String password;
}
