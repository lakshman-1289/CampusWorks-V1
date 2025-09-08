package com.campusworks.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for user earnings response via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEarningsResponse {
    private Long userId;
    private BigDecimal totalEarnings;
    private Long completedTasksCount;
    private BigDecimal averageEarningsPerTask;
    private LocalDateTime lastEarningDate;
    private String currency;
}
