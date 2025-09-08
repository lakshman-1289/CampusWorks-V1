package com.campusworks.auth.security;

import com.campusworks.auth.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * Intercepts requests and validates JWT tokens to set up authentication context
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private TokenBlacklistService tokenBlacklistService;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        try {
            // Get Authorization header
            final String authHeader = request.getHeader("Authorization");
            
            // If no Authorization header or doesn't start with "Bearer ", continue
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // Extract token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            
            // Basic validation of token structure/signature
            if (!jwtService.validateToken(jwt)) {
                logger.debug("❌ Invalid JWT token in request to: {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }
            
            // Check if token is blacklisted or expired
            if (tokenBlacklistService.isTokenBlacklisted(jwt) || jwtService.isTokenExpired(jwt)) {
                logger.debug("🚫 JWT token is blacklisted or expired for request: {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }
            
            // Extract user email from token
            final String userEmail = jwtService.extractEmail(jwt);
            
            // If we have a valid token and user email, and no current authentication
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Load user details
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                
                if (userDetails != null) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    
                    // Set authentication details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    logger.debug("✅ JWT authentication successful for user: {} on request: {}", 
                               userEmail, request.getRequestURI());
                }
            }
            
        } catch (Exception e) {
            logger.error("❌ Error processing JWT authentication: {}", e.getMessage(), e);
        }
        
        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}
