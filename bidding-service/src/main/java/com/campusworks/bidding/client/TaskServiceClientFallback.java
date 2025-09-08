package com.campusworks.bidding.client;

import com.campusworks.bidding.dto.BiddingStatusResponse;
import com.campusworks.bidding.dto.TaskResponse;
import com.campusworks.bidding.dto.TaskUpdateResponse;
import com.campusworks.bidding.dto.TaskAssignmentRequest;
import com.campusworks.bidding.dto.TaskOwnershipResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Fallback implementation for TaskServiceClient
 * Provides default responses when Task Service is unavailable
 */
@Component
@Slf4j
public class TaskServiceClientFallback implements TaskServiceClient {
    
    @Override
    public boolean checkTaskExists(Long taskId) {
        log.warn("⚠️ Task Service unavailable - Fallback: Assuming task {} exists", taskId);
        return true; // Assume task exists to avoid blocking bid placement
    }
    
    @Override
    public BiddingStatusResponse getTaskBiddingStatus(Long taskId) {
        log.warn("⚠️ Task Service unavailable - Fallback: Returning default bidding status for task {}", taskId);
        
        // Return default response to allow bidding to continue
        // Note: BiddingStatusResponse doesn't have a 'message' field
        return BiddingStatusResponse.builder()
                .taskId(taskId)
                .isOpenForBidding(true)
                .status("OPEN")
                .biddingDeadline(LocalDateTime.now().plusHours(24)) // Default 24 hours
                .totalBids(0)
                .lowestBidAmount(BigDecimal.ZERO)
                .highestBidAmount(BigDecimal.ZERO)
                .lastBidTime(LocalDateTime.now())
                .build();
    }
    
    @Override
    public TaskUpdateResponse updateTaskStatus(Long taskId, TaskUpdateResponse request) {
        log.warn("⚠️ Task Service unavailable - Fallback: Cannot update task {} status", taskId);
        
        // Return failure response
        return TaskUpdateResponse.builder()
                .taskId(taskId)
                .status("FAILED")
                .message("Task Service unavailable - Status update failed")
                .updatedAt(LocalDateTime.now())
                .success(false)
                .build();
    }
    
    @Override
    public TaskUpdateResponse assignTask(Long taskId, TaskAssignmentRequest request) {
        log.warn("⚠️ Task Service unavailable - Fallback: Cannot assign task {} to user {}", 
                taskId, request.getAssignedUserId());
        
        // Return failure response for task assignment
        return TaskUpdateResponse.builder()
                .taskId(taskId)
                .status("FAILED")
                .message("Task Service unavailable - Task assignment failed")
                .updatedAt(LocalDateTime.now())
                .success(false)
                .build();
    }
    
    @Override
    public TaskOwnershipResponse isTaskOwner(Long taskId, Long userId) {
        log.error("❌ Task Service unavailable - Cannot verify task ownership for task {} and user {}", 
                taskId, userId);
        
        // In fallback mode, BLOCK the request for safety
        // We cannot verify ownership, so we must prevent potential owner bidding
        log.error("❌ BLOCKING: Task Service unavailable - Cannot verify ownership. Request blocked for safety.");
        
        return TaskOwnershipResponse.builder()
                .taskId(taskId)
                .userId(userId)
                .isOwner(true)  // Assume IS owner to BLOCK the request
                .message("Task Service unavailable - Cannot verify ownership. Request blocked for safety.")
                .success(false)
                .build();
    }
    
    @Override
    public TaskResponse getTaskById(Long taskId) {
        log.warn("⚠️ Task Service unavailable - Fallback: Returning default task response for task {}", taskId);
        
        // Return default response with far future deadline to avoid false expiration
        return TaskResponse.builder()
                .id(taskId)
                .title("Task Service Unavailable")
                .description("Task Service is unavailable")
                .status("UNKNOWN")
                .biddingDeadline(LocalDateTime.now().plusDays(30))
                .completionDeadline(LocalDateTime.now().plusDays(60)) // Far future to avoid false expiration
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    @Override
    public TaskUpdateResponse acceptTask(Long taskId, TaskUpdateResponse request) {
        log.warn("⚠️ Task Service unavailable - Fallback: Cannot accept task {}", taskId);
        
        return TaskUpdateResponse.builder()
                .taskId(taskId)
                .status("FAILED")
                .message("Task Service unavailable - Task acceptance failed")
                .updatedAt(LocalDateTime.now())
                .success(false)
                .build();
    }
    
    @Override
    public TaskUpdateResponse completeTask(Long taskId, TaskUpdateResponse request) {
        log.warn("⚠️ Task Service unavailable - Fallback: Cannot complete task {}", taskId);
        
        return TaskUpdateResponse.builder()
                .taskId(taskId)
                .status("FAILED")
                .message("Task Service unavailable - Task completion failed")
                .updatedAt(LocalDateTime.now())
                .success(false)
                .build();
    }
}
