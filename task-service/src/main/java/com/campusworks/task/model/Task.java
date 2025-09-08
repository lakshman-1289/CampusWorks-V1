package com.campusworks.task.model;

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
 * Task Entity
 * Represents a task posted by a student that needs to be completed
 */
@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Task title is required")
    @Size(max = 100, message = "Task title cannot exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String title;
    
    @NotBlank(message = "Task description is required")
    @Size(max = 1000, message = "Task description cannot exceed 1000 characters")
    @Column(nullable = false, length = 1000)
    private String description;
    
    @NotNull(message = "Budget is required")
    @DecimalMin(value = "50.0", message = "Task budget must be at least ₹50.00")
    @DecimalMax(value = "10000.0", message = "Task budget cannot exceed ₹10,000.00")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal budget;
    
    @NotNull(message = "Task category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskCategory category;
    
    @NotNull(message = "Task status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.OPEN;
    
    @NotNull(message = "Owner ID is required")
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;
    
    @Column(name = "owner_email", nullable = false)
    private String ownerEmail;
    
    @Column(name = "assigned_user_id")
    private Long assignedUserId;
    
    @Column(name = "assigned_user_email")
    private String assignedUserEmail;
    
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
    
    @NotNull(message = "Bidding deadline is required")
    @Column(name = "bidding_deadline", nullable = false)
    private LocalDateTime biddingDeadline;
    
    @Column(name = "completion_deadline")
    private LocalDateTime completionDeadline;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Business Logic Methods
    
    /**
     * Check if task is open for bidding
     */
    public boolean isOpenForBidding() {
        return status == TaskStatus.OPEN && 
               !isBiddingPeriodExpired();
    }
    
    /**
     * Check if bidding period has expired
     */
    public boolean isBiddingPeriodExpired() {
        return LocalDateTime.now().isAfter(biddingDeadline);
    }
    
    /**
     * Check if task can be assigned
     */
    public boolean canBeAssigned() {
        return status == TaskStatus.OPEN && 
               isBiddingPeriodExpired();
    }
    
    /**
     * Check if task is in progress
     */
    public boolean isInProgress() {
        return status == TaskStatus.IN_PROGRESS;
    }
    
    /**
     * Check if task is completed
     */
    public boolean isCompleted() {
        return status == TaskStatus.COMPLETED;
    }
    
    /**
     * Check if task is cancelled
     */
    public boolean isCancelled() {
        return status == TaskStatus.CANCELLED;
    }
    
    /**
     * Assign task to a user
     */
    public void assignToUser(Long userId, String userEmail) {
        this.assignedUserId = userId;
        this.assignedUserEmail = userEmail;
        this.assignedAt = LocalDateTime.now();
        this.status = TaskStatus.IN_PROGRESS;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Mark task as completed
     */
    public void markAsCompleted() {
        this.status = TaskStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Accept completed task
     */
    public void acceptTask() {
        this.status = TaskStatus.ACCEPTED;
        this.acceptedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Cancel task
     */
    public void cancelTask() {
        this.status = TaskStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Enums
    
    /**
     * Task Categories
     */
    public enum TaskCategory {
        ACADEMIC_WRITING("Academic Writing"),
        PROGRAMMING("Programming"),
        MATHEMATICS("Mathematics"),
        SCIENCE("Science"),
        LITERATURE("Literature"),
        ENGINEERING("Engineering"),
        OTHER("Other");
        
        private final String displayName;
        
        TaskCategory(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    /**
     * Task Status
     */
    public enum TaskStatus {
        OPEN("Open for Bidding"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        ACCEPTED("Accepted"),
        CANCELLED("Cancelled");
        
        private final String displayName;
        
        TaskStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
