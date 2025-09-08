package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for bid response via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidResponse {
    private Long id;
    private Long taskId;
    private Long bidderId;
    private String bidderEmail;
    private BigDecimal amount;
    private String status;
    private boolean isWinning;
    private boolean isAccepted;
    private String proposal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
