package com.campusworks.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Task Ownership Response DTO
 * Used for checking if a user is the owner of a specific task
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskOwnershipResponse {
    
    private Long taskId;
    private Long userId;
    private boolean isOwner;
    private String message;
    private boolean success;
}
