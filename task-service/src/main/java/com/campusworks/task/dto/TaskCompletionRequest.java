package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for task completion requests via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCompletionRequest {
    private Long taskId;
    private String taskTitle;
    private BigDecimal taskAmount;
    private LocalDateTime completedAt;
    private String completionNotes;
    private String taskCategory;
}
