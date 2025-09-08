package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for bidding status responses via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiddingStatusResponse {
    private Long taskId;
    private String status;
    private LocalDateTime biddingDeadline;
    private boolean isOpenForBidding;
    private int totalBids;
    private BigDecimal lowestBidAmount;
    private BigDecimal highestBidAmount;
    private LocalDateTime lastBidTime;
}
