package com.researchers_conicet.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "email_verifications")
public class EmailVerification {

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "username")
    private String username = null;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}