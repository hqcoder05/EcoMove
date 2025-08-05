package com.GiaoThongTM.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

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
