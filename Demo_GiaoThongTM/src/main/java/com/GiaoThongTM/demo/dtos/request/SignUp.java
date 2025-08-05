package com.GiaoThongTM.demo.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUp {
    @NotBlank
    @Size(min = 2, message = "USERNAME_INVALID")
    private String username;
    private String name;
    private String password;
}
