package com.campusworks.auth.service;

import com.campusworks.auth.model.BlacklistedToken;
import com.campusworks.auth.repo.BlacklistedTokenRepository;
import com.campusworks.auth.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

/**
 * Token Blacklist Service
 * Handles token blacklisting for logout functionality
 */
@Service
public class TokenBlacklistService {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);
    
    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;
    
    @Autowired
    private JwtService jwtService;
    
    /**
     * Blacklist a token (logout)
     * @param token JWT token to blacklist
     * @param reason reason for blacklisting
     * @return true if successfully blacklisted
     */
    @Transactional
    public boolean blacklistToken(String token, String reason) {
        try {
            // Validate token first
            if (!jwtService.validateToken(token)) {
                logger.warn("❌ Cannot blacklist invalid token");
                return false;
            }
            
            // Extract token information
            String jti = jwtService.extractJti(token);
            String userId = jwtService.extractUserId(token);
            String email = jwtService.extractEmail(token);
            Date expirationDate = jwtService.extractExpiration(token);
            LocalDateTime expiresAt = jwtService.convertToLocalDateTime(expirationDate);
            
            // Check if token is already blacklisted
            if (blacklistedTokenRepository.existsByTokenJti(jti)) {
                logger.info("⚠️ Token with JTI {} is already blacklisted", jti);
                return true; // Already blacklisted, consider it successful
            }
            
            // Create blacklisted token entry
            BlacklistedToken blacklistedToken = BlacklistedToken.builder()
                    .tokenJti(jti)
                    .userId(Long.parseLong(userId))
                    .userEmail(email)
                    .expiresAt(expiresAt)
                    .reason(reason != null ? reason : "User logout")
                    .build();
            
            blacklistedTokenRepository.save(blacklistedToken);
            
            logger.info("✅ Token blacklisted successfully for user: {} with JTI: {}", email, jti);
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Error blacklisting token: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Check if a token is blacklisted
     * @param token JWT token to check
     * @return true if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            String jti = jwtService.extractJti(token);
            boolean isBlacklisted = blacklistedTokenRepository.existsByTokenJti(jti);
            
            if (isBlacklisted) {
                logger.debug("🚫 Token with JTI {} is blacklisted", jti);
            }
            
            return isBlacklisted;
            
        } catch (Exception e) {
            logger.error("❌ Error checking token blacklist status: {}", e.getMessage());
            // If we can't determine status, consider it blacklisted for security
            return true;
        }
    }
    
    /**
     * Blacklist all tokens for a user (logout from all devices)
     * @param userId user ID
     * @param reason reason for blacklisting
     * @return number of tokens blacklisted
     */
    @Transactional
    public int blacklistAllUserTokens(Long userId, String reason) {
        try {
            // Note: This would require storing active tokens, which we don't do
            // For now, we'll just log this action
            logger.info("🔒 Request to blacklist all tokens for user: {}", userId);
            
            // In a production system, you might want to:
            // 1. Store active sessions/tokens
            // 2. Implement a user-level token invalidation timestamp
            // 3. Or use a distributed cache like Redis
            
            return 0; // Placeholder implementation
        } catch (Exception e) {
            logger.error("❌ Error blacklisting all user tokens: {}", e.getMessage(), e);
            return 0;
        }
    }
    
    /**
     * Get blacklisted tokens for a user
     * @param userId user ID
     * @return list of blacklisted tokens
     */
    public List<BlacklistedToken> getUserBlacklistedTokens(Long userId) {
        return blacklistedTokenRepository.findByUserId(userId);
    }
    
    /**
     * Clean up expired blacklisted tokens
     * Runs every hour to prevent database bloat
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int deletedCount = blacklistedTokenRepository.deleteExpiredTokens(now);
            
            if (deletedCount > 0) {
                logger.info("🧹 Cleaned up {} expired blacklisted tokens", deletedCount);
            }
            
        } catch (Exception e) {
            logger.error("❌ Error during token cleanup: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get statistics about blacklisted tokens
     * @return statistics map
     */
    public long getTotalBlacklistedTokens() {
        return blacklistedTokenRepository.count();
    }
    
    /**
     * Get count of blacklisted tokens for a user
     * @param userId user ID
     * @return count of blacklisted tokens
     */
    public long getUserBlacklistedTokenCount(Long userId) {
        return blacklistedTokenRepository.countByUserId(userId);
    }
}
