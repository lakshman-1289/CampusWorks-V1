package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for task assignment requests via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentRequest {
    private Long assignedUserId;
    private String assignedUserEmail;
    private BigDecimal acceptedAmount;
    private LocalDateTime assignmentDate;
    private String assignmentNotes;
}
