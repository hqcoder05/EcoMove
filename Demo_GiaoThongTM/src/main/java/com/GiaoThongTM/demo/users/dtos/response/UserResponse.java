package com.GiaoThongTM.demo.users.dtos.response;

import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.users.enums.Role;
import lombok.*;
import java.util.Set;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String name;
    private String username;
    private String phoneNumber;
    private String email;
    private Set<Role> roles;
}
