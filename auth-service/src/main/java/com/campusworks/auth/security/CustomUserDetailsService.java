package com.campusworks.auth.security;

import com.campusworks.auth.model.User;
import com.campusworks.auth.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom User Details Service
 * Loads user details from database for Spring Security authentication
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("🔍 Loading user details for email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("❌ User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        
        // Create UserDetails object
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .accountExpired(false)
                .accountLocked(!user.isEnabled())
                .credentialsExpired(false)
                .disabled(!user.isEnabled())
                .build();
        
        logger.debug("✅ User details loaded successfully for: {}", email);
        return userDetails;
    }
}
