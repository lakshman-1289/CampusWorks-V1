package com.campusworks.bidding.controller;

import com.campusworks.bidding.model.Bid;
import com.campusworks.bidding.service.BiddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
/**
 * Bid Controller
 * Handles HTTP requests for bid management
 */
@RestController
@RequestMapping("/bids")
@RequiredArgsConstructor
@Slf4j
public class BidController {
    
    private final BiddingService biddingService;
    
    /**
     * Place a new bid on a task
     */
    @PostMapping
    public ResponseEntity<?> placeBid(@RequestBody PlaceBidRequest request, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("💰 Placing bid on task ID: {} by user: {} ({}) for amount: ${}", 
                request.getTaskId(), userEmail, userId, request.getAmount());
        
        try {
            // Build bid from request
            Bid bid = Bid.builder()
                    .taskId(request.getTaskId())
                    .bidderId(Long.parseLong(userId))
                    .bidderEmail(userEmail)
                    .amount(request.getAmount())
                    .proposal(request.getProposal())
                    .build();
            
            // Place bid
            Bid placedBid = biddingService.placeBid(bid);
            
            log.info("✅ Bid placed successfully: ID: {}, Amount: ${}, Task: {}", 
                    placedBid.getId(), placedBid.getAmount(), placedBid.getTaskId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bid placed successfully");
            response.put("bidId", placedBid.getId());
            response.put("amount", placedBid.getAmount());
            response.put("status", placedBid.getStatus());
            response.put("isWinning", placedBid.getIsWinning());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to place bid on task ID: {} - Error: {}", request.getTaskId(), e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to place bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get all bids for a task
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getBidsByTaskId(@PathVariable Long taskId) {
        log.info("📋 Retrieving all bids for task ID: {}", taskId);
        
        try {
            List<Bid> bids = biddingService.getBidsByTaskId(taskId);
            
            log.info("✅ Retrieved {} bids for task ID: {}", bids.size(), taskId);
            
            return ResponseEntity.ok(bids);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve bids for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bids");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all bids by a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBidsByUserId(@PathVariable Long userId) {
        log.info("👤 Retrieving all bids by user ID: {}", userId);
        
        try {
            List<Bid> bids = biddingService.getBidsByUserId(userId);
            
            log.info("✅ Retrieved {} bids by user ID: {}", bids.size(), userId);
            
            return ResponseEntity.ok(bids);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve bids for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bids");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all bids by user email
     */
    @GetMapping("/user/email/{userEmail}")
    public ResponseEntity<?> getBidsByUserEmail(@PathVariable String userEmail) {
        log.info("📧 Retrieving all bids by user email: {}", userEmail);
        
        try {
            List<Bid> bids = biddingService.getBidsByUserEmail(userEmail);
            
            log.info("✅ Retrieved {} bids by user email: {}", bids.size(), userEmail);
            
            return ResponseEntity.ok(bids);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve bids for user email: {} - Error: {}", userEmail, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bids");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all bids by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBidsByStatus(@PathVariable String status) {
        log.info("🏷️ Retrieving bids with status: {}", status);
        
        try {
            Bid.BidStatus bidStatus = Bid.BidStatus.valueOf(status.toUpperCase());
            List<Bid> bids = biddingService.getBidsByStatus(bidStatus);
            
            log.info("✅ Retrieved {} bids with status: {}", bids.size(), status);
            
            return ResponseEntity.ok(bids);
            
        } catch (IllegalArgumentException e) {
            log.warn("❌ Invalid status: {}", status);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid status");
            errorResponse.put("message", "Status must be one of: PENDING, ACCEPTED, REJECTED, WITHDRAWN");
            
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve bids with status: {} - Error: {}", status, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bids");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get winning bid for a task
     */
    @GetMapping("/task/{taskId}/winning")
    public ResponseEntity<?> getWinningBidForTask(@PathVariable Long taskId) {
        log.info("🏆 Retrieving winning bid for task ID: {}", taskId);
        
        try {
            var winningBidOpt = biddingService.getWinningBidForTask(taskId);
            
            if (winningBidOpt.isPresent()) {
                Bid winningBid = winningBidOpt.get();
                log.info("✅ Winning bid found: ID: {}, Amount: ${}, Bidder: {}", 
                        winningBid.getId(), winningBid.getAmount(), winningBid.getBidderEmail());
                return ResponseEntity.ok(winningBid);
            } else {
                log.info("ℹ️ No winning bid found for task ID: {}", taskId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve winning bid for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve winning bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get lowest bid for a task
     */
    @GetMapping("/task/{taskId}/lowest")
    public ResponseEntity<?> getLowestBidForTask(@PathVariable Long taskId) {
        log.info("💰 Retrieving lowest bid for task ID: {}", taskId);
        
        try {
            var lowestBidOpt = biddingService.getLowestBidForTask(taskId);
            
            if (lowestBidOpt.isPresent()) {
                Bid lowestBid = lowestBidOpt.get();
                log.info("✅ Lowest bid found: ID: {}, Amount: ${}, Bidder: {}", 
                        lowestBid.getId(), lowestBid.getAmount(), lowestBid.getBidderEmail());
                return ResponseEntity.ok(lowestBid);
            } else {
                log.info("ℹ️ No bids found for task ID: {}", taskId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve lowest bid for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve lowest bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get highest bid for a task
     */
    @GetMapping("/task/{taskId}/highest")
    public ResponseEntity<?> getHighestBidForTask(@PathVariable Long taskId) {
        log.info("💎 Retrieving highest bid for task ID: {}", taskId);
        
        try {
            var highestBidOpt = biddingService.getHighestBidForTask(taskId);
            
            if (highestBidOpt.isPresent()) {
                Bid highestBid = highestBidOpt.get();
                log.info("✅ Highest bid found: ID: {}, Amount: ${}, Bidder: {}", 
                        highestBid.getId(), highestBid.getAmount(), highestBid.getBidderEmail());
                return ResponseEntity.ok(highestBid);
            } else {
                log.info("ℹ️ No bids found for task ID: {}", taskId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve highest bid for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve highest bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Accept a bid
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptBid(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("👍 Accepting bid ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            Bid acceptedBid = biddingService.acceptBid(id, Long.parseLong(userId));
            
            log.info("✅ Bid accepted successfully: ID: {}, Amount: ${}, Bidder: {}", 
                    acceptedBid.getId(), acceptedBid.getAmount(), acceptedBid.getBidderEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bid accepted successfully");
            response.put("bidId", acceptedBid.getId());
            response.put("amount", acceptedBid.getAmount());
            response.put("status", acceptedBid.getStatus());
            response.put("acceptedAt", acceptedBid.getAcceptedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to accept bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to accept bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Reject a bid
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBid(@PathVariable Long id, @RequestBody RejectBidRequest request) {
        log.info("❌ Rejecting bid ID: {} with reason: {}", id, request.getRejectionReason());
        
        try {
            Bid rejectedBid = biddingService.rejectBid(id, request.getRejectionReason());
            
            log.info("✅ Bid rejected successfully: ID: {}, Reason: {}", rejectedBid.getId(), request.getRejectionReason());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bid rejected successfully");
            response.put("bidId", rejectedBid.getId());
            response.put("status", rejectedBid.getStatus());
            response.put("rejectionReason", rejectedBid.getRejectionReason());
            response.put("rejectedAt", rejectedBid.getRejectedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to reject bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to reject bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Withdraw a bid
     */
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawBid(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("↩️ Withdrawing bid ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            Bid withdrawnBid = biddingService.withdrawBid(id, Long.parseLong(userId));
            
            log.info("✅ Bid withdrawn successfully: ID: {}, Bidder: {}", withdrawnBid.getId(), withdrawnBid.getBidderEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bid withdrawn successfully");
            response.put("bidId", withdrawnBid.getId());
            response.put("status", withdrawnBid.getStatus());
            response.put("updatedAt", withdrawnBid.getUpdatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to withdraw bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to withdraw bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get bids that need attention
     */
    @GetMapping("/needing-attention")
    public ResponseEntity<?> getBidsNeedingAttention() {
        log.info("⚠️ Retrieving bids that need attention");
        
        try {
            List<Bid> bids = biddingService.getBidsNeedingAttention();
            
            log.info("✅ Retrieved {} bids that need attention", bids.size());
            
            return ResponseEntity.ok(bids);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve bids needing attention - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bids needing attention");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get user's active bids
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getUserActiveBids(@PathVariable Long userId) {
        log.info("👤 Retrieving active bids for user ID: {}", userId);
        
        try {
            List<Bid> activeBids = biddingService.getUserActiveBids(userId);
            
            log.info("✅ Retrieved {} active bids for user ID: {}", activeBids.size(), userId);
            
            return ResponseEntity.ok(activeBids);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve active bids for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve active bids");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get user's completed bids
     */
    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<?> getUserCompletedBids(@PathVariable Long userId) {
        log.info("✅ Retrieving completed bids for user ID: {}", userId);
        
        try {
            List<Bid> completedBids = biddingService.getUserCompletedBids(userId);
            
            log.info("✅ Retrieved {} completed bids for user ID: {}", completedBids.size(), userId);
            
            return ResponseEntity.ok(completedBids);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve completed bids for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve completed bids");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get bid statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getBidStatistics() {
        log.info("📊 Retrieving bid statistics");
        
        try {
            var stats = biddingService.getBidStatistics();
            
            log.info("✅ Bid statistics retrieved successfully");
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve bid statistics - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve bid statistics");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.info("🏥 Health check endpoint called");
        return ResponseEntity.ok("Bidding Service is running - Phase 2 ✅");
    }
    
    // ==================== AUTOMATIC BID SELECTION ENDPOINTS ====================
    
    /**
     * Manually trigger automatic bid selection for a specific task
     * Useful for testing or manual intervention
     */
    @PostMapping("/{taskId}/auto-select")
    public ResponseEntity<?> manuallyTriggerBidSelection(@PathVariable Long taskId, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("🔧 Manual trigger: Automatic bid selection for task ID: {} by user: {} ({})", 
                taskId, userEmail, userId);
        
        try {
            biddingService.manuallyTriggerBidSelection(taskId);
            
            log.info("✅ Automatic bid selection triggered successfully for task ID: {}", taskId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Automatic bid selection triggered successfully");
            response.put("taskId", taskId);
            response.put("triggeredBy", userEmail);
            response.put("triggeredAt", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to trigger automatic bid selection for task ID: {} - Error: {}", 
                    taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to trigger automatic bid selection");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get tasks that are ready for automatic bid selection
     * (Tasks with expired bidding deadlines that are still open)
     */
    @GetMapping("/auto-selection/ready")
    public ResponseEntity<?> getTasksReadyForAutomaticBidSelection(HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("📋 Getting tasks ready for automatic bid selection by user: {} ({})", userEmail, userId);
        
        try {
            List<Long> readyTaskIds = biddingService.getTasksReadyForAutomaticBidSelection();
            
            log.info("✅ Found {} tasks ready for automatic bid selection", readyTaskIds.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tasks ready for automatic bid selection retrieved successfully");
            response.put("readyTaskCount", readyTaskIds.size());
            response.put("readyTaskIds", readyTaskIds);
            response.put("retrievedAt", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to get tasks ready for automatic bid selection - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get tasks ready for automatic bid selection");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get automatic bid selection configuration
     */
    @GetMapping("/auto-selection/config")
    public ResponseEntity<?> getAutomaticBidSelectionConfig() {
        log.info("⚙️ Getting automatic bid selection configuration");
        
        try {
            Map<String, Object> config = new HashMap<>();
            config.put("autoAssignmentEnabled", biddingService.isAutoAssignmentEnabled());
            config.put("checkInterval", biddingService.getAutoAssignmentCheckInterval());
            config.put("autoCancellationCheckInterval", biddingService.getAutoCancellationCheckInterval());
            config.put("lastCheckTime", LocalDateTime.now()); // This would be tracked in a real implementation
            
            log.info("✅ Automatic bid selection configuration retrieved successfully");
            
            return ResponseEntity.ok(config);
            
        } catch (Exception e) {
            log.error("❌ Failed to get automatic bid selection configuration - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get automatic bid selection configuration");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // ==================== UPI ID OPERATIONS ====================
    
    /**
     * Submit UPI ID for an accepted bid
     */
    @PostMapping("/{id}/submit-upi")
    public ResponseEntity<?> submitUpiId(@PathVariable Long id, @RequestBody SubmitUpiIdRequest request, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("💳 Submitting UPI ID for bid ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            Bid bid = biddingService.submitUpiId(id, request.getUpiId(), Long.parseLong(userId));
            
            log.info("✅ UPI ID submitted successfully: Bid ID: {}, UPI ID: {}", bid.getId(), request.getUpiId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "UPI ID submitted successfully");
            response.put("bidId", bid.getId());
            response.put("upiId", bid.getUpiId());
            response.put("upiIdSubmittedAt", bid.getUpiIdSubmittedAt());
            response.put("status", bid.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to submit UPI ID for bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to submit UPI ID");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * View UPI ID for an accepted bid (by task owner)
     */
    @PostMapping("/{id}/view-upi")
    public ResponseEntity<?> viewUpiId(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("👁️ Viewing UPI ID for bid ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            Bid bid = biddingService.viewUpiId(id, Long.parseLong(userId));
            
            log.info("✅ UPI ID viewed successfully: Bid ID: {}, UPI ID: {}", bid.getId(), bid.getUpiId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "UPI ID viewed successfully");
            response.put("bidId", bid.getId());
            response.put("upiId", bid.getUpiId());
            response.put("upiIdViewedAt", bid.getUpiIdViewedAt());
            response.put("upiIdViewed", bid.getUpiIdViewed());
            response.put("status", bid.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to view UPI ID for bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to view UPI ID");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Accept completed work (by task owner after viewing UPI ID)
     */
    @PostMapping("/{id}/accept-work")
    public ResponseEntity<?> acceptCompletedWork(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("✅ Accepting completed work for bid ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            Bid bid = biddingService.acceptCompletedWork(id, Long.parseLong(userId));
            
            log.info("✅ Work accepted successfully: Bid ID: {}, Task ID: {}", bid.getId(), bid.getTaskId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Work accepted successfully");
            response.put("bidId", bid.getId());
            response.put("taskId", bid.getTaskId());
            response.put("status", bid.getStatus());
            response.put("updatedAt", bid.getUpdatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to accept work for bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to accept work");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get accepted bid with UPI ID for a task
     */
    @GetMapping("/task/{taskId}/accepted-with-upi")
    public ResponseEntity<?> getAcceptedBidWithUpiIdForTask(@PathVariable Long taskId) {
        log.info("🔍 Retrieving accepted bid with UPI ID for task ID: {}", taskId);
        
        try {
            var bidOpt = biddingService.getAcceptedBidWithUpiIdForTask(taskId);
            
            if (bidOpt.isPresent()) {
                Bid bid = bidOpt.get();
                log.info("✅ Found accepted bid with UPI ID: ID: {}, Task: {}", bid.getId(), taskId);
                return ResponseEntity.ok(bid);
            } else {
                log.info("ℹ️ No accepted bid with UPI ID found for task ID: {}", taskId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve accepted bid with UPI ID for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve accepted bid with UPI ID");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get accepted bid for a task
     */
    @GetMapping("/task/{taskId}/accepted")
    public ResponseEntity<?> getAcceptedBidForTask(@PathVariable Long taskId) {
        log.info("🔍 Retrieving accepted bid for task ID: {}", taskId);
        
        try {
            var bidOpt = biddingService.getAcceptedBidForTask(taskId);
            
            if (bidOpt.isPresent()) {
                Bid bid = bidOpt.get();
                log.info("✅ Found accepted bid: ID: {}, Task: {}", bid.getId(), taskId);
                return ResponseEntity.ok(bid);
            } else {
                log.info("ℹ️ No accepted bid found for task ID: {}", taskId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve accepted bid for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve accepted bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Check if task has accepted bid with UPI ID submitted
     */
    @GetMapping("/task/{taskId}/has-upi-submitted")
    public ResponseEntity<?> hasAcceptedBidWithUpiIdForTask(@PathVariable Long taskId) {
        log.info("🔍 Checking if task ID: {} has accepted bid with UPI ID submitted", taskId);
        
        try {
            boolean hasUpiId = biddingService.hasAcceptedBidWithUpiIdForTask(taskId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("hasUpiIdSubmitted", hasUpiId);
            
            log.info("✅ Check completed: Task ID: {}, Has UPI ID: {}", taskId, hasUpiId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to check UPI ID status for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check UPI ID status");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Check if task has accepted bid with UPI ID viewed
     */
    @GetMapping("/task/{taskId}/has-upi-viewed")
    public ResponseEntity<?> hasAcceptedBidWithViewedUpiIdForTask(@PathVariable Long taskId) {
        log.info("🔍 Checking if task ID: {} has accepted bid with UPI ID viewed", taskId);
        
        try {
            boolean hasUpiIdViewed = biddingService.hasAcceptedBidWithViewedUpiIdForTask(taskId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("hasUpiIdViewed", hasUpiIdViewed);
            
            log.info("✅ Check completed: Task ID: {}, Has UPI ID Viewed: {}", taskId, hasUpiIdViewed);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to check UPI ID viewed status for task ID: {} - Error: {}", taskId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check UPI ID viewed status");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Auto-cancel expired tasks and their bids
     */
    @PostMapping("/auto-cancel-expired")
    public ResponseEntity<?> autoCancelExpiredTasks() {
        log.info("🔄 Manually triggering auto-cancellation of expired tasks");
        
        try {
            biddingService.autoCancelExpiredTasks();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Auto-cancellation of expired tasks completed");
            response.put("triggeredAt", LocalDateTime.now());
            
            log.info("✅ Auto-cancellation of expired tasks completed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to auto-cancel expired tasks - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to auto-cancel expired tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Delete a bid (only for rejected bids)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBid(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("🗑️ Deleting bid ID: {} by user ID: {}", id, userId);
        
        try {
            biddingService.deleteBid(id, Long.parseLong(userId));
            
            log.info("✅ Bid deleted successfully: ID: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bid deleted successfully");
            response.put("bidId", id);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to delete bid ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete bid");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // ==================== INNER CLASSES ====================
    
    /**
     * Place Bid Request DTO
     */
    @lombok.Data
    public static class PlaceBidRequest {
        private Long taskId;
        private java.math.BigDecimal amount;
        private String proposal;
    }
    
    /**
     * Reject Bid Request DTO
     */
    @lombok.Data
    public static class RejectBidRequest {
        private String rejectionReason;
    }
    
    /**
     * Submit UPI ID Request DTO
     */
    @lombok.Data
    public static class SubmitUpiIdRequest {
        private String upiId;
    }
}
