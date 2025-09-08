package com.campusworks.profile.client;

import java.util.List;

import org.springframework.stereotype.Component;

import com.campusworks.profile.dto.TaskResponse;
import com.campusworks.profile.dto.UserEarningsResponse;
import com.campusworks.profile.dto.UserTaskStatisticsResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * Fallback implementation for Task Service Client
 * Handles service unavailability gracefully
 */
@Component
@Slf4j
public class TaskServiceClientFallback implements TaskServiceClient {
    
    @Override
    public List<TaskResponse> getCompletedTasksByUser(Long userId) {
        log.error("Task Service unavailable - fallback triggered for userId: {}", userId);
        throw new RuntimeException("Task Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public List<TaskResponse> getActiveTasksByUser(Long userId) {
        log.error("Task Service unavailable - fallback triggered for userId: {}", userId);
        throw new RuntimeException("Task Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public UserEarningsResponse getUserEarnings(Long userId) {
        log.error("Task Service unavailable - fallback triggered for userId: {}", userId);
        throw new RuntimeException("Task Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public UserTaskStatisticsResponse getUserTaskStatistics(Long userId) {
        log.error("Task Service unavailable - fallback triggered for userId: {}", userId);
        throw new RuntimeException("Task Service is currently unavailable. Please try again later.");
    }
}
