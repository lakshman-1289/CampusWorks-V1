package com.campusworks.auth;

import com.campusworks.auth.model.User;
import com.campusworks.auth.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Auth Service Application
 * Handles user authentication, registration, and JWT token generation
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class AuthServiceApplication {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceApplication.class);
    
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
        System.out.println("🚀 Auth Service started successfully!");
        System.out.println("🔐 Service URL: http://localhost:9001");
        System.out.println("📱 Gateway Route: http://localhost:8080/api/auth");
    }
    
    /**
     * CommandLineRunner to create default admin user on startup
     * This ensures there's always at least one admin user in the system
     */
    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Check if admin user already exists
                if (userRepository.findByEmail("admin@campusworks.com").isEmpty()) {
                    logger.info("👑 Creating default ADMIN user...");
                    
                    User adminUser = User.builder()
                            .email("admin@campusworks.com")
                            .password(passwordEncoder.encode("admin123"))
                            .role(User.UserRole.ADMIN)
                            .enabled(true)
                            .build();
                    
                    User savedAdmin = userRepository.save(adminUser);
                    logger.info("✅ Default ADMIN user created successfully with ID: {}", savedAdmin.getId());
                    System.out.println("👑 Default Admin Created:");
                    System.out.println("   Email: admin@campusworks.com");
                    System.out.println("   Password: admin123");
                    System.out.println("   Role: ADMIN");
                } else {
                    logger.info("✅ Default ADMIN user already exists");
                    System.out.println("👑 Default Admin already exists");
                }
            } catch (Exception e) {
                logger.error("❌ Failed to create default admin user: {}", e.getMessage(), e);
                System.err.println("❌ Failed to create default admin user: " + e.getMessage());
            }
        };
    }
}
