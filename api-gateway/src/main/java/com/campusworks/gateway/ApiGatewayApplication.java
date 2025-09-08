package com.campusworks.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway Application
 * Centralized routing, JWT validation, and CORS handling for CampusWorks
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
        System.out.println("🚀 API Gateway started successfully!");
        System.out.println("🌐 Gateway URL: http://localhost:8080");
        System.out.println("🔐 JWT Authentication: Enabled");
        System.out.println("🌍 CORS: Globally configured");
    }
}
