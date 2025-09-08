package com.campusworks.profile;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Profile Service Application
 * Main entry point for the Profile Service microservice
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@Slf4j
public class ProfileServiceApplication {
    
    public static void main(String[] args) {
        log.info("🚀 Starting Profile Service - Phase 2");
        log.info("👤 Service: User Profile Management");
        log.info("🔧 Port: 9003");
        log.info("🗄️ Database: campusworks_profile");
        log.info("🌐 Eureka Client: Enabled");
        
        SpringApplication.run(ProfileServiceApplication.class, args);
        
        log.info("✅ Profile Service started successfully!");
        log.info("🔗 Health Check: http://localhost:9003/actuator/health");
        log.info("📊 API Endpoints: http://localhost:9003/api/profiles");
        log.info("🏷️ Service Name: profile-service");
    }
}
