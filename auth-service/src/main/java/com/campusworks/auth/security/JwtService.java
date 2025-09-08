package com.campusworks.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

/**
 * JWT Service
 * Handles JWT token generation, validation, and claim extraction
 */
@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    
    @Value("${security.jwt.secret}")
    private String jwtSecret;
    
    @Value("${security.jwt.expiration}")
    private Long jwtExpiration;
    
    /**
     * Generate JWT token for user
     * @param userId user's unique identifier
     * @param email user's email address
     * @param role user's role
     * @return JWT token string
     */
    public String generateToken(String userId, String email, String role) {
        logger.debug("🔐 Generating JWT token for user: {} with role: {}", userId, role);
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        String jti = UUID.randomUUID().toString(); // Unique token identifier
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        String token = Jwts.builder()
                .subject(userId)
                .id(jti) // Add JTI for token identification
                .claim("email", email)
                .claim("roles", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
        
        logger.debug("✅ JWT token generated successfully for user: {} with JTI: {}", userId, jti);
        return token;
    }
    
    /**
     * Extract claims from JWT token
     * @param token JWT token string
     * @return Claims object containing token data
     */
    public Claims extractClaims(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            logger.error("❌ Error extracting claims from JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
    
    /**
     * Validate JWT token
     * @param token JWT token string
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            logger.warn("❌ JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Extract user ID from JWT token
     * @param token JWT token string
     * @return user ID string
     */
    public String extractUserId(String token) {
        Claims claims = extractClaims(token);
        return claims.getSubject();
    }
    
    /**
     * Extract email from JWT token
     * @param token JWT token string
     * @return email string
     */
    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims.get("email", String.class);
    }
    
    /**
     * Extract roles from JWT token
     * @param token JWT token string
     * @return roles string
     */
    public String extractRoles(String token) {
        Claims claims = extractClaims(token);
        return claims.get("roles", String.class);
    }
    
    /**
     * Extract JTI (JWT ID) from token
     * @param token JWT token string
     * @return JWT ID string
     */
    public String extractJti(String token) {
        Claims claims = extractClaims(token);
        return claims.getId();
    }
    
    /**
     * Extract expiration date from JWT token
     * @param token JWT token string
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        Claims claims = extractClaims(token);
        return claims.getExpiration();
    }
    
    /**
     * Convert Date to LocalDateTime
     * @param date Date object
     * @return LocalDateTime object
     */
    public LocalDateTime convertToLocalDateTime(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
    
    /**
     * Check if token is expired
     * @param token JWT token string
     * @return true if expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            return true; // Consider invalid tokens as expired
        }
    }
}
