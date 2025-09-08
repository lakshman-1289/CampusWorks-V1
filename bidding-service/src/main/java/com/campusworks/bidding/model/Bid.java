package com.campusworks.bidding.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bid Entity
 * Represents a bid placed by a user on a task
 */
@Entity
@Table(name = "bids")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bid {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Task ID is required")
    @Column(name = "task_id", nullable = false)
    private Long taskId;
    
    @NotNull(message = "Bidder ID is required")
    @Column(name = "bidder_id", nullable = false)
    private Long bidderId;
    
    @NotBlank(message = "Bidder email is required")
    @Column(name = "bidder_email", nullable = false)
    private String bidderEmail;
    
    @NotNull(message = "Bid amount is required")
    @DecimalMin(value = "50.00", message = "Bid amount must be at least ₹50.00")
    @DecimalMax(value = "10000.00", message = "Bid amount cannot exceed ₹10,000.00")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 500)
    private String proposal;
    
    @NotNull(message = "Bid status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length=500)
    @Builder.Default
    private BidStatus status = BidStatus.PENDING;
    
    @Column(name = "is_winning")
    @Builder.Default
    private Boolean isWinning = false;
    
    @Column(name = "is_accepted")
    @Builder.Default
    private Boolean isAccepted = false;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    @Column(length = 500)
    private String rejectionReason;
    
    @Column(name = "upi_id")
    private String upiId;
    
    @Column(name = "upi_id_viewed")
    @Builder.Default
    private Boolean upiIdViewed = false;
    
    @Column(name = "upi_id_submitted_at")
    private LocalDateTime upiIdSubmittedAt;
    
    @Column(name = "upi_id_viewed_at")
    private LocalDateTime upiIdViewedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Business Logic Methods
    
    /**
     * Check if bid is pending
     */
    public boolean isPending() {
        return status == BidStatus.PENDING;
    }
    
    /**
     * Check if bid is accepted
     */
    public boolean isAccepted() {
        return status == BidStatus.ACCEPTED;
    }
    
    /**
     * Check if bid is rejected
     */
    public boolean isRejected() {
        return status == BidStatus.REJECTED;
    }
    
    /**
     * Check if bid is withdrawn
     */
    public boolean isWithdrawn() {
        return status == BidStatus.WITHDRAWN;
    }
    
    /**
     * Check if bid is winning
     */
    public boolean isWinningBid() {
        return isWinning != null && isWinning;
    }
    
    /**
     * Accept bid
     */
    public void acceptBid() {
        this.status = BidStatus.ACCEPTED;
        this.isAccepted = true;
        this.acceptedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Reject bid
     */
    public void rejectBid(String reason) {
        this.status = BidStatus.REJECTED;
        this.isAccepted = false;
        this.rejectionReason = reason;
        this.rejectedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Withdraw bid
     */
    public void withdrawBid() {
        this.status = BidStatus.WITHDRAWN;
        this.isWinning = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Mark as winning bid
     */
    public void markAsWinning() {
        this.isWinning = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Mark as not winning bid
     */
    public void markAsNotWinning() {
        this.isWinning = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Submit UPI ID for payment
     */
    public void submitUpiId(String upiId) {
        this.upiId = upiId;
        this.upiIdSubmittedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Mark UPI ID as viewed by task owner
     */
    public void markUpiIdAsViewed() {
        this.upiIdViewed = true;
        this.upiIdViewedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Check if UPI ID has been submitted
     */
    public boolean hasUpiIdSubmitted() {
        return upiId != null && !upiId.trim().isEmpty();
    }
    
    /**
     * Check if UPI ID has been viewed by task owner
     */
    public boolean hasUpiIdBeenViewed() {
        return upiIdViewed != null && upiIdViewed;
    }
    
    // Enums
    
    /**
     * Bid Status
     */
    public enum BidStatus {
        PENDING("Pending"),
        ACCEPTED("Accepted"),
        REJECTED("Rejected"),
        WITHDRAWN("Withdrawn"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled");
        
        private final String displayName;
        
        BidStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
