package com.campusworks.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for updating task status via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusUpdateRequest {
    private String status;
    private Long assignedUserId;
    private String assignedUserEmail;
    private String notes;
    private LocalDateTime updatedAt;
}
