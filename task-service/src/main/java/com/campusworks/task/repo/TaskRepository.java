package com.campusworks.task.repo;

import com.campusworks.task.model.Task;
import com.campusworks.task.model.Task.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Task Repository
 * Handles database operations for Task entities
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    /**
     * Find all tasks by owner ID
     */
    List<Task> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    
    /**
     * Find all tasks by assigned user ID
     */
    List<Task> findByAssignedUserIdOrderByCreatedAtDesc(Long assignedUserId);
    
    /**
     * Find all tasks by status
     */
    List<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status);
    
    /**
     * Find all tasks by category
     */
    List<Task> findByCategoryOrderByCreatedAtDesc(Task.TaskCategory category);
    
    /**
     * Find all tasks by budget range
     */
    @Query("SELECT t FROM Task t WHERE t.budget BETWEEN :minBudget AND :maxBudget ORDER BY t.createdAt DESC")
    List<Task> findByBudgetRange(@Param("minBudget") Double minBudget, @Param("maxBudget") Double maxBudget);
    
    /**
     * Find all open tasks that are still accepting bids
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'OPEN' AND t.biddingDeadline > :now ORDER BY t.createdAt DESC")
    List<Task> findOpenTasksForBidding(@Param("now") LocalDateTime now);
    
    /**
     * Find all tasks that are ready for assignment (bidding period ended)
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'OPEN' AND t.biddingDeadline <= :now ORDER BY t.createdAt DESC")
    List<Task> findTasksReadyForAssignment(@Param("now") LocalDateTime now);
    
    /**
     * Find all tasks by owner email
     */
    List<Task> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);
    
    /**
     * Find all tasks by assigned user email
     */
    List<Task> findByAssignedUserEmailOrderByCreatedAtDesc(String assignedUserEmail);
    
    /**
     * Find task by ID and owner ID (for authorization)
     */
    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);
    
    /**
     * Find task by ID and assigned user ID (for authorization)
     */
    Optional<Task> findByIdAndAssignedUserId(Long id, Long assignedUserId);
    
    /**
     * Check if user owns any tasks
     */
    boolean existsByOwnerId(Long ownerId);
    
    /**
     * Check if user is assigned to any tasks
     */
    boolean existsByAssignedUserId(Long assignedUserId);
    
    /**
     * Count tasks by status
     */
    long countByStatus(TaskStatus status);
    
    /**
     * Count tasks by owner ID
     */
    long countByOwnerId(Long ownerId);
    
    /**
     * Count tasks by assigned user ID
     */
    long countByAssignedUserId(Long assignedUserId);
    
    /**
     * Find tasks created within a date range
     */
    @Query("SELECT t FROM Task t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Task> findByCreatedDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find tasks with budgets above a certain amount
     */
    @Query("SELECT t FROM Task t WHERE t.budget > :minBudget ORDER BY t.budget DESC")
    List<Task> findByBudgetAbove(@Param("minBudget") Double minBudget);
    
    /**
     * Find tasks with budgets below a certain amount
     */
    @Query("SELECT t FROM Task t WHERE t.budget < :maxBudget ORDER BY t.budget ASC")
    List<Task> findByBudgetBelow(@Param("maxBudget") Double maxBudget);
    
    /**
     * Find tasks by multiple statuses
     */
    @Query("SELECT t FROM Task t WHERE t.status IN :statuses ORDER BY t.createdAt DESC")
    List<Task> findByStatusIn(@Param("statuses") List<TaskStatus> statuses);
    
    /**
     * Find tasks by multiple categories
     */
    @Query("SELECT t FROM Task t WHERE t.category IN :categories ORDER BY t.createdAt DESC")
    List<Task> findByCategoryIn(@Param("categories") List<Task.TaskCategory> categories);
    
    /**
     * Find tasks that need attention (expired bidding, overdue completion)
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(t.status = 'OPEN' AND t.biddingDeadline <= :now) OR " +
           "(t.status = 'IN_PROGRESS' AND t.completionDeadline <= :now) " +
           "ORDER BY t.createdAt ASC")
    List<Task> findTasksNeedingAttention(@Param("now") LocalDateTime now);
}
