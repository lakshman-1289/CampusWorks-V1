package com.campusworks.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Email Verification Token Entity
 * Stores tokens for email verification during user registration
 */
@Entity
@Table(name = "verification_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime usedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType tokenType = TokenType.EMAIL_VERIFICATION;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Check if the token is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    /**
     * Check if the token is valid (not used and not expired)
     */
    public boolean isValid() {
        return !used && !isExpired();
    }

    /**
     * Mark the token as used
     */
    public void markAsUsed() {
        this.used = true;
        this.usedAt = LocalDateTime.now();
    }

    /**
     * Token types for different verification purposes
     */
    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }
}
