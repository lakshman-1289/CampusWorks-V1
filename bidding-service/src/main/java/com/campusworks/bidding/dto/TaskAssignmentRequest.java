package com.campusworks.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Task Assignment Request DTO
 * Used for communicating with Task Service when automatically assigning tasks
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentRequest {
    
    private Long taskId;
    private Long assignedUserId;
    private String assignedUserEmail;
    private LocalDateTime assignedAt;
    private String assignmentReason;
    private BigDecimal winningBidAmount;
    private String winningBidProposal;
    
    // Additional fields for comprehensive assignment
    private String status;
    private String message;
    private boolean success;
}
