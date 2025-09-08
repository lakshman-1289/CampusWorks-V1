package com.campusworks.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.campusworks.auth.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Security Configuration for Auth Service
 * Handles authentication and authorization only
 * CORS is handled by API Gateway to prevent duplicate headers
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    /**
     * Security Filter Chain
     * Configures security rules and authentication
     * CORS is disabled here as it's handled by API Gateway
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API usage
            .csrf(csrf -> csrf.disable())
            
            // Disable CORS - handled by API Gateway
            .cors(cors -> cors.disable())
            
            // Configure session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/auth/register", "/auth/login", "/auth/verify", 
                               "/auth/forgot-password", "/auth/reset-password", 
                               "/auth/verification-status/**", "/auth/validate-email/**", 
                               "/auth/resend-verification-public", "/auth/health").permitAll()
                
                // Protected endpoints (require authentication)
                .requestMatchers("/auth/change-password", "/auth/delete-account", 
                               "/auth/logout", "/auth/validate", "/auth/test-auth",
                               "/auth/user/**", "/auth/resend-verification").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            // Add JWT filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * Password Encoder
     * Uses BCrypt for secure password hashing
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
