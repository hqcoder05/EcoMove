package com.GiaoThongTM.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Permission {
    @Id
    private String name;
    private String description;

//    @ManyToMany(mappedBy = "permission")
//    private Set<Role> role;
}
