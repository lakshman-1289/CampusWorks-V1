package com.campusworks.auth.service;

import com.campusworks.auth.model.User;
import com.campusworks.auth.model.VerificationToken;
import com.campusworks.auth.repo.VerificationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing email verification tokens
 */
@Service
public class VerificationTokenService {

    private static final Logger logger = LoggerFactory.getLogger(VerificationTokenService.class);

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Value("${app.verification.token.expiry:24}")
    private int tokenExpiryHours;

    /**
     * Generate a new verification token for a user
     */
    @Transactional
    public VerificationToken generateVerificationToken(User user) {
        logger.info("🔑 Generating verification token for user: {}", user.getEmail());

        // Delete any existing tokens for this user
        deleteExistingTokensForUser(user);

        // Create new token
        String tokenValue = generateUniqueToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(tokenExpiryHours);

        VerificationToken token = VerificationToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(expiryDate)
                .tokenType(VerificationToken.TokenType.EMAIL_VERIFICATION)
                .used(false)
                .build();

        token = tokenRepository.save(token);
        logger.info("✅ Verification token generated successfully for user: {} (expires: {})", 
                   user.getEmail(), expiryDate);

        return token;
    }
    
    /**
     * Generate a new password reset token for a user
     */
    @Transactional
    public VerificationToken generatePasswordResetToken(User user) {
        logger.info("🔑 Generating password reset token for user: {}", user.getEmail());

        // Delete any existing password reset tokens for this user
        deleteExistingPasswordResetTokensForUser(user);

        // Create new token
        String tokenValue = generateUniqueToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(tokenExpiryHours);

        VerificationToken token = VerificationToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(expiryDate)
                .tokenType(VerificationToken.TokenType.PASSWORD_RESET)
                .used(false)
                .build();

        token = tokenRepository.save(token);
        logger.info("✅ Password reset token generated successfully for user: {} (expires: {})", 
                   user.getEmail(), expiryDate);

        return token;
    }

    /**
     * Find verification token by token string
     */
    public Optional<VerificationToken> findByToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return Optional.empty();
        }
        return tokenRepository.findByToken(token.trim());
    }

    /**
     * Validate and use a verification token
     */
    @Transactional
    public boolean validateAndUseToken(String tokenValue) {
        logger.info("🔍 Validating verification token: {}", tokenValue);

        Optional<VerificationToken> tokenOpt = findByToken(tokenValue);
        if (tokenOpt.isEmpty()) {
            logger.warn("❌ Token not found: {}", tokenValue);
            return false;
        }

        VerificationToken token = tokenOpt.get();

        if (token.isUsed()) {
            logger.warn("❌ Token already used: {}", tokenValue);
            return false;
        }

        if (token.isExpired()) {
            logger.warn("❌ Token expired: {} (expired at: {})", tokenValue, token.getExpiryDate());
            return false;
        }

        // Mark token as used
        token.markAsUsed();
        tokenRepository.save(token);

        logger.info("✅ Token validated and marked as used: {}", tokenValue);
        return true;
    }

    /**
     * Get user associated with a token
     */
    public Optional<User> getUserByToken(String tokenValue) {
        return findByToken(tokenValue)
                .map(VerificationToken::getUser);
    }

    /**
     * Check if token is valid (exists, not used, not expired)
     */
    public boolean isTokenValid(String tokenValue) {
        return findByToken(tokenValue)
                .map(VerificationToken::isValid)
                .orElse(false);
    }
    
    /**
     * Save a token (for updating used status)
     */
    @Transactional
    public VerificationToken saveToken(VerificationToken token) {
        return tokenRepository.save(token);
    }

    /**
     * Delete all existing tokens for a user
     */
    @Transactional
    public void deleteExistingTokensForUser(User user) {
        try {
            tokenRepository.deleteByUserAndTokenType(user, VerificationToken.TokenType.EMAIL_VERIFICATION);
            logger.debug("🗑️ Deleted existing verification tokens for user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to delete existing tokens for user {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    /**
     * Delete all existing password reset tokens for a user
     */
    @Transactional
    public void deleteExistingPasswordResetTokensForUser(User user) {
        try {
            tokenRepository.deleteByUserAndTokenType(user, VerificationToken.TokenType.PASSWORD_RESET);
            logger.debug("🗑️ Deleted existing password reset tokens for user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to delete existing password reset tokens for user {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    /**
     * Delete all tokens for a user (for account deletion)
     */
    @Transactional
    public void deleteTokensForUser(User user) {
        try {
            tokenRepository.deleteByUser(user);
            logger.info("🗑️ Deleted all verification tokens for user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to delete tokens for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Generate a unique token string
     */
    private String generateUniqueToken() {
        String token;
        int attempts = 0;
        int maxAttempts = 10;

        do {
            token = UUID.randomUUID().toString().replace("-", "");
            attempts++;
            
            if (attempts > maxAttempts) {
                logger.warn("⚠️ Max attempts reached for token generation, using UUID with timestamp");
                token = UUID.randomUUID().toString().replace("-", "") + System.currentTimeMillis();
                break;
            }
            
        } while (tokenRepository.existsByTokenAndUsedFalse(token));

        logger.debug("🔑 Generated unique token in {} attempts", attempts);
        return token;
    }

    /**
     * Scheduled task to clean up expired tokens
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600 * 1000 ms
    @Transactional
    public void cleanupExpiredTokens() {
        logger.info("🧹 Running scheduled cleanup of expired verification tokens...");
        
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Delete expired tokens
            tokenRepository.deleteExpiredTokens(now);
            
            // Delete used tokens older than 7 days
            LocalDateTime sevenDaysAgo = now.minusDays(7);
            tokenRepository.deleteUsedTokensOlderThan(sevenDaysAgo);
            
            logger.info("✅ Expired verification tokens cleanup completed successfully");
            
        } catch (Exception e) {
            logger.error("❌ Failed to cleanup expired tokens: {}", e.getMessage(), e);
        }
    }

    /**
     * Get token expiry hours
     */
    public int getTokenExpiryHours() {
        return tokenExpiryHours;
    }

    /**
     * Check if user has pending verification token
     */
    public boolean hasPendingVerificationToken(User user) {
        Optional<VerificationToken> tokenOpt = tokenRepository.findByUserAndTokenType(
            user, VerificationToken.TokenType.EMAIL_VERIFICATION);
        
        return tokenOpt.isPresent() && tokenOpt.get().isValid();
    }

    /**
     * Resend verification token (generate new one)
     */
    @Transactional
    public VerificationToken resendVerificationToken(User user) {
        logger.info("🔄 Resending verification token for user: {}", user.getEmail());
        return generateVerificationToken(user);
    }
}
