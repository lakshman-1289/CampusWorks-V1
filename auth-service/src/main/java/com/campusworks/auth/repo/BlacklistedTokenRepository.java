package com.campusworks.auth.repo;

import com.campusworks.auth.model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for BlacklistedToken entity
 */
@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    
    /**
     * Check if a token is blacklisted by its JTI
     * @param tokenJti the JWT ID
     * @return true if token is blacklisted
     */
    boolean existsByTokenJti(String tokenJti);
    
    /**
     * Find blacklisted token by JTI
     * @param tokenJti the JWT ID
     * @return Optional containing the blacklisted token if found
     */
    Optional<BlacklistedToken> findByTokenJti(String tokenJti);
    
    /**
     * Find all blacklisted tokens for a user
     * @param userId the user ID
     * @return list of blacklisted tokens
     */
    List<BlacklistedToken> findByUserId(Long userId);
    
    /**
     * Delete expired blacklisted tokens
     * This is used for cleanup to prevent the table from growing indefinitely
     * @param now current timestamp
     * @return number of deleted records
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM BlacklistedToken bt WHERE bt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * Count blacklisted tokens for a user
     * @param userId the user ID
     * @return count of blacklisted tokens
     */
    long countByUserId(Long userId);
}
