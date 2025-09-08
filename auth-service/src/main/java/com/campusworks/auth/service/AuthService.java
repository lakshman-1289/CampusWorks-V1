package com.campusworks.auth.service;

import com.campusworks.auth.model.User;
import com.campusworks.auth.model.VerificationToken;
import com.campusworks.auth.repo.UserRepository;
import java.util.Optional;
import com.campusworks.auth.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Auth Service
 * Handles user registration, authentication, and JWT token generation
 */
@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private TokenBlacklistService tokenBlacklistService;
    
    @Autowired
    private EmailValidationService emailValidationService;
    
    @Autowired
    private VerificationTokenService verificationTokenService;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Register a new user with email verification
     * All new registrations default to STUDENT role and require email verification
     * @param email user's email address (must be valid college email)
     * @param password user's password
     * @return created user object
     */
    @Transactional
    public User register(String email, String password) {
        logger.info("📝 Attempting to register user with email: {}", email);
        
        // Validate college email format
        if (!emailValidationService.isValidCollegeEmail(email)) {
            String errorMessage = emailValidationService.getValidationErrorMessage(email);
            logger.warn("❌ User registration failed: Invalid email format - {}", errorMessage);
            throw new RuntimeException(errorMessage);
        }
        
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            logger.warn("❌ User registration failed: Email {} already exists", email);
            throw new RuntimeException("User with this email already exists");
        }
        
        // Create new user with STUDENT role by default (disabled until email verification)
        User user = User.builder()
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(password))
                .role(User.UserRole.STUDENT) // Default to STUDENT role
                .enabled(false) // Disabled until email verification
                .emailVerified(false)
                .build();
        
        User savedUser = userRepository.save(user);
        logger.info("✅ User registered successfully: {} with ID: {} and role: {} (email verification required)", 
                   email, savedUser.getId(), savedUser.getRole());
        
        // Generate and send verification email
        try {
            VerificationToken verificationToken = verificationTokenService.generateVerificationToken(savedUser);
            boolean emailSent = emailService.sendVerificationEmail(savedUser, verificationToken);
            
            if (emailSent) {
                logger.info("📧 Verification email sent successfully to: {}", email);
            } else {
                logger.warn("⚠️ Failed to send verification email to: {} - user can request resend", email);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to send verification email to {}: {}", email, e.getMessage(), e);
            // Don't throw exception here - user is registered but needs to request email resend
        }
        
        return savedUser;
    }
    
    /**
     * Authenticate user and generate JWT token
     * @param email user's email address
     * @param password user's password
     * @return JWT token string
     */
    public String login(String email, String password) {
        logger.info("🔐 Attempting login for user: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.warn("❌ Login failed: User {} not found", email);
            throw new RuntimeException("Invalid credentials");
        }
        
        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("❌ Login failed: Invalid password for user {}", email);
            throw new RuntimeException("Invalid credentials");
        }
        
        if (!user.isEnabled()) {
            if (!user.isEmailVerified()) {
                logger.warn("❌ Login failed: User {} email not verified", email);
                throw new RuntimeException("Please verify your email address before logging in. Check your inbox for verification link.");
            } else {
                logger.warn("❌ Login failed: User {} account is disabled", email);
                throw new RuntimeException("Account is disabled. Please contact support.");
            }
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(
            user.getId().toString(), 
            user.getEmail(), 
            user.getRole().name()
        );
        
        logger.info("✅ User {} logged in successfully", email);
        return token;
    }
    
    /**
     * Find user by email
     * @param email user's email address
     * @return Optional containing user if found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Find user by ID
     * @param id user's ID
     * @return Optional containing user if found
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Logout user by blacklisting their JWT token
     * @param token JWT token to invalidate
     * @return true if logout successful
     */
    public boolean logout(String token) {
        logger.info("🚪 Logout request received");
        
        try {
            // Validate token before blacklisting
            if (!jwtService.validateToken(token)) {
                logger.warn("❌ Cannot logout with invalid token");
                return false;
            }
            
            // Extract user info for logging
            String email = jwtService.extractEmail(token);
            String userId = jwtService.extractUserId(token);
            
            // Blacklist the token
            boolean blacklisted = tokenBlacklistService.blacklistToken(token, "User logout");
            
            if (blacklisted) {
                logger.info("✅ User {} (ID: {}) logged out successfully", email, userId);
            } else {
                logger.error("❌ Failed to logout user {} (ID: {})", email, userId);
            }
            
            return blacklisted;
            
        } catch (Exception e) {
            logger.error("❌ Logout failed: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Check if a token is valid and not blacklisted
     * @param token JWT token to validate
     * @return true if token is valid and not blacklisted
     */
    public boolean isTokenValid(String token) {
        try {
            // First check basic JWT validation
            if (!jwtService.validateToken(token)) {
                return false;
            }
            
            // Check if token is blacklisted
            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                return false;
            }
            
            // Check if token is expired
            if (jwtService.isTokenExpired(token)) {
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Error validating token: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Verify user email using verification token
     * @param token verification token string
     * @return true if verification successful
     */
    @Transactional
    public boolean verifyEmail(String token) {
        logger.info("📧 Attempting to verify email with token: {}", token);
        
        try {
            // Validate and use the token
            if (!verificationTokenService.validateAndUseToken(token)) {
                logger.warn("❌ Email verification failed: Invalid or expired token");
                return false;
            }
            
            // Get the user associated with the token
            Optional<User> userOpt = verificationTokenService.getUserByToken(token);
            if (userOpt.isEmpty()) {
                logger.error("❌ Email verification failed: No user found for token");
                return false;
            }
            
            User user = userOpt.get();
            
            // Update user verification status
            user.setEmailVerified(true);
            user.setEmailVerifiedAt(LocalDateTime.now());
            user.setEnabled(true); // Enable the account
            
            userRepository.save(user);
            
            logger.info("✅ Email verified successfully for user: {}", user.getEmail());
            
            // Send welcome email
            try {
                emailService.sendWelcomeEmail(user);
                logger.info("📧 Welcome email sent to: {}", user.getEmail());
            } catch (Exception e) {
                logger.warn("⚠️ Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
                // Don't fail verification if welcome email fails
            }
            
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Email verification failed: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Resend verification email
     * @param email user's email address
     * @return true if email sent successfully
     */
    @Transactional
    public boolean resendVerificationEmail(String email) {
        logger.info("🔄 Resending verification email for: {}", email);
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                logger.warn("❌ Resend verification failed: User {} not found", email);
                return false;
            }
            
            User user = userOpt.get();
            
            if (user.isEmailVerified()) {
                logger.warn("❌ Resend verification failed: Email {} already verified", email);
                throw new RuntimeException("Email is already verified");
            }
            
            // Generate new verification token
            VerificationToken verificationToken = verificationTokenService.resendVerificationToken(user);
            
            // Send verification email
            boolean emailSent = emailService.sendVerificationEmail(user, verificationToken);
            
            if (emailSent) {
                logger.info("✅ Verification email resent successfully to: {}", email);
            } else {
                logger.error("❌ Failed to resend verification email to: {}", email);
            }
            
            return emailSent;
            
        } catch (Exception e) {
            logger.error("❌ Resend verification failed for {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Check if email is verified
     * @param email user's email address
     * @return true if email is verified
     */
    public boolean isEmailVerified(String email) {
        return userRepository.findByEmail(email)
                .map(User::isEmailVerified)
                .orElse(false);
    }
    
    /**
     * Get user verification status
     * @param email user's email address
     * @return verification status information
     */
    public VerificationStatus getVerificationStatus(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new VerificationStatus(false, false, false, null);
        }
        
        User user = userOpt.get();
        boolean hasPendingToken = verificationTokenService.hasPendingVerificationToken(user);
        
        return new VerificationStatus(
            true, // user exists
            user.isEmailVerified(),
            hasPendingToken,
            user.getEmailVerifiedAt()
        );
    }
    
    /**
     * Forgot password - send reset email
     * @param email user's email address
     * @return true if reset email sent successfully
     */
    @Transactional
    public boolean forgotPassword(String email) {
        logger.info("🔑 Forgot password request for: {}", email);
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                logger.warn("❌ Forgot password failed: User {} not found", email);
                return false;
            }
            
            User user = userOpt.get();
            logger.debug("🔍 Found user for password reset: {} (ID: {})", user.getEmail(), user.getId());
            
            // Generate password reset token
            VerificationToken resetToken = verificationTokenService.generatePasswordResetToken(user);
            logger.debug("🔍 Generated password reset token: {} (Type: {}, Expires: {})", 
                        resetToken.getToken(), resetToken.getTokenType(), resetToken.getExpiryDate());
            
            // Send password reset email
            boolean emailSent = emailService.sendPasswordResetEmail(user, resetToken);
            
            if (emailSent) {
                logger.info("✅ Password reset email sent successfully to: {}", email);
            } else {
                logger.error("❌ Failed to send password reset email to: {}", email);
            }
            
            return emailSent;
            
        } catch (Exception e) {
            logger.error("❌ Forgot password failed for {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Reset password with token
     * @param token reset token
     * @param email user's email address
     * @param newPassword new password
     * @return true if password reset successfully
     */
    @Transactional
    public boolean resetPassword(String token, String email, String newPassword) {
        logger.info("🔑 Password reset request for: {}", email);
        
        try {
            // First, find the token without validating it yet
            Optional<VerificationToken> tokenOpt = verificationTokenService.findByToken(token);
            if (tokenOpt.isEmpty()) {
                logger.warn("❌ Password reset failed: Token not found: {}", token);
                return false;
            }
            
            VerificationToken resetToken = tokenOpt.get();
            logger.debug("🔍 Found reset token: {} (Type: {}, Used: {}, Expired: {})", 
                        token, resetToken.getTokenType(), resetToken.isUsed(), resetToken.isExpired());
            
            // Check if it's a password reset token
            if (resetToken.getTokenType() != VerificationToken.TokenType.PASSWORD_RESET) {
                logger.warn("❌ Password reset failed: Token is not a password reset token. Type: {}", resetToken.getTokenType());
                return false;
            }
            
            // Check if token is used
            if (resetToken.isUsed()) {
                logger.warn("❌ Password reset failed: Token already used: {}", token);
                return false;
            }
            
            // Check if token is expired
            if (resetToken.isExpired()) {
                logger.warn("❌ Password reset failed: Token expired: {} (expired at: {})", token, resetToken.getExpiryDate());
                return false;
            }
            
            // Get user from token
            User user = resetToken.getUser();
            if (user == null) {
                logger.warn("❌ Password reset failed: User not found for token");
                return false;
            }
            
            logger.debug("🔍 Found user: {} (ID: {})", user.getEmail(), user.getId());
            
            // Verify email matches
            if (!user.getEmail().equals(email)) {
                logger.warn("❌ Password reset failed: Email mismatch. Token email: {}, Request email: {}", user.getEmail(), email);
                return false;
            }
            
            // Mark token as used
            resetToken.markAsUsed();
            verificationTokenService.saveToken(resetToken);
            
            // Update password
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userRepository.save(user);
            
            logger.info("✅ Password reset successfully for: {}", email);
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Password reset failed for {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Change password (authenticated user)
     * @param currentPassword current password
     * @param newPassword new password
     * @return true if password changed successfully
     */
    @Transactional
    public boolean changePassword(String currentPassword, String newPassword) {
        logger.info("🔑 Change password request");
        
        try {
            // Get current user from security context
            String currentUserEmail = null;
            try {
                currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
                logger.debug("🔍 Retrieved user email from security context: {}", currentUserEmail);
            } catch (Exception e) {
                logger.error("❌ Failed to get user from security context: {}", e.getMessage());
                return false;
            }
            
            if (currentUserEmail == null || currentUserEmail.equals("anonymousUser")) {
                logger.warn("❌ Change password failed: User not properly authenticated");
                return false;
            }
            
            Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
            if (userOpt.isEmpty()) {
                logger.warn("❌ Change password failed: User {} not found", currentUserEmail);
                return false;
            }
            
            User user = userOpt.get();
            logger.debug("🔍 Found user: {} (ID: {})", user.getEmail(), user.getId());
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                logger.warn("❌ Change password failed: Invalid current password for {}", currentUserEmail);
                return false;
            }
            
            // Update password
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userRepository.save(user);
            
            logger.info("✅ Password changed successfully for: {}", currentUserEmail);
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Change password failed: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Delete user account
     * @param email user's email address
     * @return true if account deleted successfully
     */
    @Transactional
    public boolean deleteAccount(String email) {
        logger.info("🗑️ Attempting to delete account for: {}", email);
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                logger.warn("❌ Account deletion failed: User {} not found", email);
                return false;
            }
            
            User user = userOpt.get();
            
            // Delete verification tokens first
            verificationTokenService.deleteTokensForUser(user);
            
            // Delete blacklisted tokens for this user
            // Note: This would require extending the blacklist service to support user-specific cleanup
            
            // Delete the user account
            userRepository.delete(user);
            
            logger.info("✅ Account deleted successfully for: {}", email);
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Account deletion failed for {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Verification status data class
     */
    public static class VerificationStatus {
        public final boolean userExists;
        public final boolean emailVerified;
        public final boolean hasPendingVerificationToken;
        public final LocalDateTime verifiedAt;
        
        public VerificationStatus(boolean userExists, boolean emailVerified, 
                                boolean hasPendingVerificationToken, LocalDateTime verifiedAt) {
            this.userExists = userExists;
            this.emailVerified = emailVerified;
            this.hasPendingVerificationToken = hasPendingVerificationToken;
            this.verifiedAt = verifiedAt;
        }
    }
}
