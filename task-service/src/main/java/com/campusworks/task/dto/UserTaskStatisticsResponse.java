package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for user task statistics response via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTaskStatisticsResponse {
    private Long userId;
    private Long totalTasks;
    private Long completedTasks;
    private Long activeTasks;
    private Long pendingTasks;
    private BigDecimal totalEarnings;
    private Double averageRating;
    private LocalDateTime lastTaskDate;
    private String userLevel;
}
