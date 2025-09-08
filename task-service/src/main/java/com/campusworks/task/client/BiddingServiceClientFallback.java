package com.campusworks.task.client;

import com.campusworks.task.dto.BidResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Fallback implementation for Bidding Service Client
 * Handles service unavailability gracefully
 */
@Component
@Slf4j
public class BiddingServiceClientFallback implements BiddingServiceClient {
    
    @Override
    public List<BidResponse> getBidsForTask(Long taskId) {
        log.error("Bidding Service unavailable - fallback triggered for taskId: {}", taskId);
        throw new RuntimeException("Bidding Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public BidResponse getWinningBidForTask(Long taskId) {
        log.error("Bidding Service unavailable - fallback triggered for taskId: {}", taskId);
        throw new RuntimeException("Bidding Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public BidResponse acceptBid(Long bidId) {
        log.error("Bidding Service unavailable - fallback triggered for bidId: {}", bidId);
        throw new RuntimeException("Bidding Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public Long getBidCountForTask(Long taskId) {
        log.error("Bidding Service unavailable - fallback triggered for taskId: {}", taskId);
        return 0L; // Return 0 bids when service is down
    }
    
    @Override
    public BidResponse getLowestBidForTask(Long taskId) {
        log.error("Bidding Service unavailable - fallback triggered for taskId: {}", taskId);
        throw new RuntimeException("Bidding Service is currently unavailable. Please try again later.");
    }
}
