package com.foodcoffee.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(nullable = false)
    private String name;

    private String role; // "Food Reviewer", "Coffee Explorer"...

    private String email;

    private String password;

    private LocalDate registeredAt;

    @PrePersist
    public void prePersist() {
        if (this.registeredAt == null) {
            this.registeredAt = LocalDate.now();
        }
    }
}
