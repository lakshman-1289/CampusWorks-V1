package com.campusworks.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * BlacklistedToken Entity
 * Represents tokens that have been invalidated through logout
 */
@Entity
@Table(name = "blacklisted_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlacklistedToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "token_jti", unique = true, nullable = false, length = 500)
    private String tokenJti; // JWT ID - unique identifier for the token
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "user_email", nullable = false)
    private String userEmail;
    
    @Column(name = "blacklisted_at", nullable = false)
    private LocalDateTime blacklistedAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "reason")
    private String reason;
    
    @PrePersist
    protected void onCreate() {
        blacklistedAt = LocalDateTime.now();
    }
}
