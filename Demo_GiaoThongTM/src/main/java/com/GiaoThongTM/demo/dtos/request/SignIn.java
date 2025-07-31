package com.GiaoThongTM.demo.dtos.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SignIn {
    private String username;
    private String password;
}
