package com.campusworks.task;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Task Service Application
 * Main entry point for the Task Service microservice
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@Slf4j
public class TaskServiceApplication {
    
    public static void main(String[] args) {
        log.info("🚀 Starting Task Service - Phase 2");
        log.info("📋 Service: Task Management");
        log.info("🔧 Port: 9001");
        log.info("🗄️ Database: campusworks_tasks");
        log.info("🌐 Eureka Client: Enabled");
        
        SpringApplication.run(TaskServiceApplication.class, args);
        
        log.info("✅ Task Service started successfully!");
        log.info("🔗 Health Check: http://localhost:9001/actuator/health");
        log.info("📊 API Endpoints: http://localhost:9001/api/tasks");
        log.info("🏷️ Service Name: task-service");
    }
}
