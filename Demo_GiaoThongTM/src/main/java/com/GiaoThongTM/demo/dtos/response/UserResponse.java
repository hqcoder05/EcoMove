package com.GiaoThongTM.demo.dtos.response;

import lombok.*;

import java.util.List;
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
    private Set<RoleResponse> roles;
    private List<BookingResponse> bookings;
}
