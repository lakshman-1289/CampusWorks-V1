package com.campusworks.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User Entity
 * Represents users in the CampusWorks system
 * Only two roles: STUDENT (default) and ADMIN
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Column(nullable = false)
    private boolean enabled = false; // Changed to false by default - requires email verification
    
    // Email verification fields
    @Column(nullable = false)
    private boolean emailVerified = false;
    
    @Column
    private LocalDateTime emailVerifiedAt;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * User Roles - Simplified approach as per blueprint
     * STUDENT: Can do everything (post tasks, bid on tasks, etc.)
     * ADMIN: System administrator with full access
     */
    public enum UserRole {
        STUDENT,    // Default role for all new registrations
        ADMIN       // Only one admin created automatically
    }
}
