package com.campusworks.auth.repo;

import com.campusworks.auth.model.VerificationToken;
import com.campusworks.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for VerificationToken entity
 */
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    /**
     * Find verification token by token string
     */
    Optional<VerificationToken> findByToken(String token);

    /**
     * Find verification token by user
     */
    Optional<VerificationToken> findByUser(User user);

    /**
     * Find verification token by user and token type
     */
    Optional<VerificationToken> findByUserAndTokenType(User user, VerificationToken.TokenType tokenType);

    /**
     * Check if token exists and is not used
     */
    boolean existsByTokenAndUsedFalse(String token);

    /**
     * Delete all tokens for a specific user
     */
    void deleteByUser(User user);

    /**
     * Delete all tokens for a specific user and token type
     */
    void deleteByUserAndTokenType(User user, VerificationToken.TokenType tokenType);

    /**
     * Delete all expired tokens (cleanup task)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken t WHERE t.expiryDate <= ?1")
    void deleteExpiredTokens(LocalDateTime now);

    /**
     * Delete all used tokens older than specified date
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken t WHERE t.used = true AND t.usedAt <= ?1")
    void deleteUsedTokensOlderThan(LocalDateTime cutoffDate);
}
