package com.campusworks.bidding.repo;

import com.campusworks.bidding.model.Bid;
import com.campusworks.bidding.model.Bid.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Bid Repository
 * Handles database operations for Bid entities
 */
@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    
    /**
     * Find all bids by task ID
     */
    List<Bid> findByTaskIdOrderByAmountAsc(Long taskId);
    
    /**
     * Find all bids by bidder ID
     */
    List<Bid> findByBidderIdOrderByCreatedAtDesc(Long bidderId);
    
    /**
     * Find all bids by bidder email
     */
    List<Bid> findByBidderEmailOrderByCreatedAtDesc(String bidderEmail);
    
    /**
     * Find all bids by status
     */
    List<Bid> findByStatusOrderByCreatedAtDesc(BidStatus status);
    
    /**
     * Find all bids by task ID and status
     */
    List<Bid> findByTaskIdAndStatusOrderByAmountAsc(Long taskId, BidStatus status);
    
    /**
     * Find all bids by bidder ID and status
     */
    List<Bid> findByBidderIdAndStatusOrderByCreatedAtDesc(Long bidderId, BidStatus status);
    
    /**
     * Find all winning bids
     */
    List<Bid> findByIsWinningTrueOrderByCreatedAtDesc();
    
    /**
     * Find winning bid for a specific task
     */
    Optional<Bid> findByTaskIdAndIsWinningTrue(Long taskId);
    
    /**
     * Find all accepted bids
     */
    List<Bid> findByIsAcceptedTrueOrderByCreatedAtDesc();
    
    /**
     * Find accepted bid for a specific task
     */
    Optional<Bid> findByTaskIdAndIsAcceptedTrue(Long taskId);
    

    
    /**
     * Find lowest bid for a task
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId AND b.status = 'PENDING' ORDER BY b.amount ASC")
    Optional<Bid> findLowestBidForTask(@Param("taskId") Long taskId);
    
    /**
     * Find highest bid for a task
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId AND b.status = 'PENDING' ORDER BY b.amount DESC")
    Optional<Bid> findHighestBidForTask(@Param("taskId") Long taskId);
    
    /**
     * Find bids by amount range
     */
    @Query("SELECT b FROM Bid b WHERE b.amount BETWEEN :minAmount AND :maxAmount ORDER BY b.amount ASC")
    List<Bid> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    /**
     * Find bids above a certain amount
     */
    @Query("SELECT b FROM Bid b WHERE b.amount > :amount ORDER BY b.amount ASC")
    List<Bid> findByAmountAbove(@Param("amount") BigDecimal amount);
    
    /**
     * Find bids below a certain amount
     */
    @Query("SELECT b FROM Bid b WHERE b.amount < :amount ORDER BY b.amount ASC")
    List<Bid> findByAmountBelow(@Param("amount") BigDecimal amount);
    
    /**
     * Count bids by task ID
     */
    long countByTaskId(Long taskId);
    
    /**
     * Count bids by bidder ID
     */
    long countByBidderId(Long bidderId);
    
    /**
     * Count bids by status
     */
    long countByStatus(BidStatus status);
    
    /**
     * Count bids by task ID and status
     */
    long countByTaskIdAndStatus(Long taskId, BidStatus status);
    
    /**
     * Count winning bids
     */
    long countByIsWinningTrue();
    
    /**
     * Count accepted bids
     */
    long countByIsAcceptedTrue();
    
    /**
     * Check if user has bid on task
     */
    boolean existsByTaskIdAndBidderId(Long taskId, Long bidderId);
    
    /**
     * Check if user has winning bid on task
     */
    boolean existsByTaskIdAndBidderIdAndIsWinningTrue(Long taskId, Long bidderId);
    
    /**
     * Check if user has accepted bid on task
     */
    boolean existsByTaskIdAndBidderIdAndIsAcceptedTrue(Long taskId, Long bidderId);
    

    
    /**
     * Find bids created within a date range
     */
    @Query("SELECT b FROM Bid b WHERE b.createdAt BETWEEN :startDate AND :endDate ORDER BY b.createdAt DESC")
    List<Bid> findByCreatedDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                    @Param("endDate") java.time.LocalDateTime endDate);
    
    /**
     * Find bids by multiple statuses
     */
    @Query("SELECT b FROM Bid b WHERE b.status IN :statuses ORDER BY b.createdAt DESC")
    List<Bid> findByStatusIn(@Param("statuses") List<BidStatus> statuses);
    
    /**
     * Find bids that need attention (pending bids older than specified time)
     */
    @Query("SELECT b FROM Bid b WHERE b.status = 'PENDING' AND b.createdAt <= :cutoffTime " +
           "ORDER BY b.createdAt ASC")
    List<Bid> findBidsNeedingAttention(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find all bids for a specific task with detailed information
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId " +
           "ORDER BY b.amount ASC, b.createdAt ASC")
    List<Bid> findDetailedBidsForTask(@Param("taskId") Long taskId);
    
    /**
     * Find user's active bids (pending or winning)
     */
    @Query("SELECT b FROM Bid b WHERE b.bidderId = :bidderId " +
           "AND (b.status = 'PENDING' OR b.isWinning = true) " +
           "ORDER BY b.createdAt DESC")
    List<Bid> findActiveBidsByUser(@Param("bidderId") Long bidderId);
    
    /**
     * Find user's completed bids (accepted, rejected, withdrawn)
     */
    @Query("SELECT b FROM Bid b WHERE b.bidderId = :bidderId " +
           "AND b.status IN ('ACCEPTED', 'REJECTED', 'WITHDRAWN') " +
           "ORDER BY b.updatedAt DESC")
    List<Bid> findCompletedBidsByUser(@Param("bidderId") Long bidderId);
    
    // ==================== AUTOMATIC BID SELECTION METHODS ====================
    
    /**
     * Find all pending bids for a task ordered by amount ASC, created_at ASC for tie-breaking
     * This ensures the lowest bidder wins, and in case of ties, the first to bid wins
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId " +
           "AND b.status = 'PENDING' " +
           "ORDER BY b.amount ASC, b.createdAt ASC")
    List<Bid> findPendingBidsForTaskOrderedByAmountAndTime(@Param("taskId") Long taskId);
    
    /**
     * Find all bids for a task with comprehensive ordering for automatic selection
     * Orders by: amount ASC, created_at ASC (tie-breaking rule)
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId " +
           "ORDER BY b.amount ASC, b.createdAt ASC")
    List<Bid> findAllBidsForTaskOrderedForSelection(@Param("taskId") Long taskId);
    
    /**
     * Count pending bids for a specific task
     */
    @Query("SELECT COUNT(b) FROM Bid b WHERE b.taskId = :taskId AND b.status = 'PENDING'")
    long countPendingBidsForTask(@Param("taskId") Long taskId);
    
    /**
     * Find the lowest bid amount for a specific task
     */
    @Query("SELECT MIN(b.amount) FROM Bid b WHERE b.taskId = :taskId AND b.status = 'PENDING'")
    Optional<BigDecimal> findLowestBidAmountForTask(@Param("taskId") Long taskId);
    
    /**
     * Find all bids with the same amount as the lowest bid for tie-breaking
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId " +
           "AND b.status = 'PENDING' " +
           "AND b.amount = (SELECT MIN(b2.amount) FROM Bid b2 WHERE b2.taskId = :taskId AND b2.status = 'PENDING') " +
           "ORDER BY b.createdAt ASC")
    List<Bid> findLowestBidsForTaskOrderedByTime(@Param("taskId") Long taskId);
    
    /**
     * Find all task IDs that have pending bids
     * This is used to identify tasks that might need automatic bid selection
     */
    @Query("SELECT DISTINCT b.taskId FROM Bid b WHERE b.status = 'PENDING'")
    List<Long> findAllTaskIdsWithPendingBids();
    
    // ==================== UPI ID OPERATIONS ====================
    
    /**
     * Find accepted bid for a specific task that has UPI ID submitted
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId AND b.status = 'ACCEPTED' AND b.upiId IS NOT NULL AND b.upiId != ''")
    Optional<Bid> findAcceptedBidWithUpiIdForTask(@Param("taskId") Long taskId);
    
    /**
     * Find accepted bid for a specific task
     */
    @Query("SELECT b FROM Bid b WHERE b.taskId = :taskId AND b.status = 'ACCEPTED'")
    Optional<Bid> findAcceptedBidForTask(@Param("taskId") Long taskId);
    
    /**
     * Find bids with UPI ID submitted but not viewed
     */
    @Query("SELECT b FROM Bid b WHERE b.upiId IS NOT NULL AND b.upiId != '' AND (b.upiIdViewed IS NULL OR b.upiIdViewed = false)")
    List<Bid> findBidsWithUnviewedUpiId();
    
    /**
     * Find bids with UPI ID submitted and viewed
     */
    @Query("SELECT b FROM Bid b WHERE b.upiId IS NOT NULL AND b.upiId != '' AND b.upiIdViewed = true")
    List<Bid> findBidsWithViewedUpiId();
    
    /**
     * Check if task has accepted bid with UPI ID submitted
     */
    @Query("SELECT COUNT(b) > 0 FROM Bid b WHERE b.taskId = :taskId AND b.status = 'ACCEPTED' AND b.upiId IS NOT NULL AND b.upiId != ''")
    boolean existsAcceptedBidWithUpiIdForTask(@Param("taskId") Long taskId);
    
    /**
     * Check if task has accepted bid with UPI ID viewed
     */
    @Query("SELECT COUNT(b) > 0 FROM Bid b WHERE b.taskId = :taskId AND b.status = 'ACCEPTED' AND b.upiIdViewed = true")
    boolean existsAcceptedBidWithViewedUpiIdForTask(@Param("taskId") Long taskId);
}
