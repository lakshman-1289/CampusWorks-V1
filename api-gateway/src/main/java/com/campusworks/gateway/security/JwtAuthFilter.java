package com.campusworks.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * JWT Authentication Filter for API Gateway
 * Validates JWT tokens and propagates user context to downstream services
 */
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    
    @Value("${security.jwt.secret}")
    private String jwtSecret;
    
    @Value("${security.jwt.expiration}")
    private Long jwtExpiration;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        
        logger.info("🔐 Processing request: {} {}", request.getMethod(), path);
        
        // Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            logger.info("✅ Skipping authentication for public endpoint: {}", path);
            return chain.filter(exchange);
        }
        
        String token = getJwtFromRequest(request);
        
        if (!StringUtils.hasText(token)) {
            logger.warn("❌ No JWT token found in request: {}", path);
            return onError(exchange, "No JWT token found", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            if (validateToken(token)) {
                Claims claims = getClaimsFromToken(token);
                String userId = claims.getSubject();
                String email = claims.get("email", String.class);
                String roles = claims.get("roles", String.class);
                
                logger.info("✅ JWT token validated successfully for user: {} (email: {})", userId, email);
                
                // Add user info to headers for downstream services
                ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Email", email != null ? email : "")
                    .header("X-User-Roles", roles != null ? roles : "")
                    .build();
                
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            } else {
                logger.warn("❌ Invalid JWT token for request: {}", path);
                return onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            logger.error("❌ Error processing JWT token: {}", e.getMessage(), e);
            return onError(exchange, "Error processing JWT token", HttpStatus.UNAUTHORIZED);
        }
    }
    
    private boolean isPublicEndpoint(String path) {
        List<String> publicPaths = List.of(
            "/auth/",
            "/api/auth/",
            "/actuator/",
            "/health",
            "/info"
        );
        
        return publicPaths.stream().anyMatch(path::startsWith);
    }
    
    private String getJwtFromRequest(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    private boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            logger.error("❌ Token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    private Claims getClaimsFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
    
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        logger.error("❌ Authentication error: {}", err);
        return exchange.getResponse().setComplete();
    }
    
    @Override
    public int getOrder() {
        return -100; // High priority - run before other filters
    }
}
