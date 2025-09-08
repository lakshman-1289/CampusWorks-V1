package com.campusworks.bidding.client;

import com.campusworks.bidding.dto.BiddingStatusResponse;
import com.campusworks.bidding.dto.TaskResponse;
import com.campusworks.bidding.dto.TaskUpdateResponse;
import com.campusworks.bidding.dto.TaskAssignmentRequest;
import com.campusworks.bidding.dto.TaskOwnershipResponse;
import com.campusworks.bidding.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign Client for Task Service
 * Handles inter-service communication with Task Service
 */
@FeignClient(name = "task-service", fallback = TaskServiceClientFallback.class, configuration = FeignClientConfig.class)
public interface TaskServiceClient {
    
    /**
     * Check if task exists
     */
    @GetMapping("/tasks/{taskId}/exists")
    boolean checkTaskExists(@PathVariable("taskId") Long taskId);
    
    /**
     * Get task bidding status
     */
    @GetMapping("/tasks/{taskId}/bidding-status")
    BiddingStatusResponse getTaskBiddingStatus(@PathVariable("taskId") Long taskId);
    
    /**
     * Update task status
     */
    @PutMapping("/tasks/{taskId}/status")
    TaskUpdateResponse updateTaskStatus(@PathVariable("taskId") Long taskId, @RequestBody TaskUpdateResponse request);
    
    /**
     * Automatically assign task to winning bidder
     */
    @PutMapping("/tasks/{taskId}/assign")
    TaskUpdateResponse assignTask(@PathVariable("taskId") Long taskId, @RequestBody TaskAssignmentRequest request);
    
    /**
     * Check if a user is the owner of a specific task
     */
    @GetMapping("/tasks/{taskId}/owner/{userId}")
    TaskOwnershipResponse isTaskOwner(@PathVariable("taskId") Long taskId, @PathVariable("userId") Long userId);
    
    /**
     * Get task by ID
     */
    @GetMapping("/tasks/{taskId}")
    TaskResponse getTaskById(@PathVariable("taskId") Long taskId);
    
    /**
     * Update task acceptance timestamp
     */
    @PutMapping("/tasks/{taskId}/accept")
    TaskUpdateResponse acceptTask(@PathVariable("taskId") Long taskId, @RequestBody TaskUpdateResponse request);
    
    /**
     * Update task completion timestamp
     */
    @PutMapping("/tasks/{taskId}/complete")
    TaskUpdateResponse completeTask(@PathVariable("taskId") Long taskId, @RequestBody TaskUpdateResponse request);
}
