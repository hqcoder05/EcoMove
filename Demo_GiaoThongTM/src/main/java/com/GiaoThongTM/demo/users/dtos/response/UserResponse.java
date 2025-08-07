package com.GiaoThongTM.demo.users.dtos.response;

import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
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
