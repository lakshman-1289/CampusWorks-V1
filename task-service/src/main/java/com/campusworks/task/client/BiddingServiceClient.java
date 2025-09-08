package com.campusworks.task.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign Client for communicating with Bidding Service
 */
@FeignClient(name = "bidding-service", fallback = BiddingServiceClientFallback.class)
public interface BiddingServiceClient {
    
    /**
     * Get all bids for a specific task
     */
    @GetMapping("/api/bids/task/{taskId}")
    List<com.campusworks.task.dto.BidResponse> getBidsForTask(@PathVariable("taskId") Long taskId);
    
    /**
     * Get winning bid for a specific task
     */
    @GetMapping("/api/bids/task/{taskId}/winning")
    com.campusworks.task.dto.BidResponse getWinningBidForTask(@PathVariable("taskId") Long taskId);
    
    /**
     * Accept a bid
     */
    @PutMapping("/api/bids/{bidId}/accept")
    com.campusworks.task.dto.BidResponse acceptBid(@PathVariable("bidId") Long bidId);
    
    /**
     * Get bid count for a specific task
     */
    @GetMapping("/api/bids/task/{taskId}/count")
    Long getBidCountForTask(@PathVariable("taskId") Long taskId);
    
    /**
     * Get lowest bid for a specific task
     */
    @GetMapping("/api/bids/task/{taskId}/lowest")
    com.campusworks.task.dto.BidResponse getLowestBidForTask(@PathVariable("taskId") Long taskId);
}
