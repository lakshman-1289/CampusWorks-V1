package com.campusworks.profile.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import com.campusworks.profile.dto.UserEarningsResponse;
import com.campusworks.profile.dto.UserTaskStatisticsResponse;

import java.util.List;

/**
 * Feign Client for communicating with Task Service
 */
@FeignClient(name = "task-service", fallback = TaskServiceClientFallback.class)
public interface TaskServiceClient {
    
    /**
     * Get completed tasks by user ID
     */
    @GetMapping("/tasks/user/{userId}/completed")
    List<com.campusworks.profile.dto.TaskResponse> getCompletedTasksByUser(@PathVariable("userId") Long userId);
    
    /**
     * Get active tasks by user ID
     */
    @GetMapping("/tasks/user/{userId}/active")
    List<com.campusworks.profile.dto.TaskResponse> getActiveTasksByUser(@PathVariable("userId") Long userId);
    
    /**
     * Get user earnings from completed tasks
     */
    @GetMapping("/tasks/user/{userId}/earnings")
    UserEarningsResponse getUserEarnings(@PathVariable("userId") Long userId);
    
    /**
     * Get task statistics for user
     */
    @GetMapping("/tasks/user/{userId}/statistics")
    UserTaskStatisticsResponse getUserTaskStatistics(@PathVariable("userId") Long userId);
}
