package com.campusworks.task.controller;

import com.campusworks.task.model.Task;
import com.campusworks.task.service.TaskService;
import com.campusworks.task.dto.BiddingStatusResponse;
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
import java.util.Optional;

/**
 * Task Controller
 * Handles HTTP requests for task management
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {
    
    private final TaskService taskService;
    
    /**
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody CreateTaskRequest request, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("📝 Creating new task: '{}' by user: {} ({})", request.getTitle(), userEmail, userId);
        log.info("📅 Completion deadline from request: {}", request.getCompletionDeadline());
        
        try {
            // Build task from request
            Task task = Task.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .budget(request.getBudget())
                    .category(request.getCategory())
                    .ownerId(Long.parseLong(userId))
                    .ownerEmail(userEmail)
                    .completionDeadline(request.getCompletionDeadline())
                    .build();
            
            log.info("📅 Task completion deadline set to: {}", task.getCompletionDeadline());
            
            // Create task
            Task createdTask = taskService.createTask(task);
            
            log.info("✅ Task created successfully: {} (ID: {})", createdTask.getTitle(), createdTask.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task created successfully");
            response.put("taskId", createdTask.getId());
            response.put("title", createdTask.getTitle());
            response.put("status", createdTask.getStatus());
            response.put("biddingDeadline", createdTask.getBiddingDeadline());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to create task: {} - Error: {}", request.getTitle(), e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get all tasks
     */
    @GetMapping
    public ResponseEntity<?> getAllTasks() {
        log.info("📋 Retrieving all tasks");
        
        try {
            List<Task> tasks = taskService.getAllTasks();
            
            log.info("✅ Retrieved {} tasks successfully", tasks.size());
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        log.info("🔍 Retrieving task with ID: {}", id);
        
        try {
            var taskOpt = taskService.getTaskById(id);
            
            if (taskOpt.isPresent()) {
                Task task = taskOpt.get();
                log.info("✅ Task retrieved successfully: {} (ID: {})", task.getTitle(), task.getId());
                return ResponseEntity.ok(task);
            } else {
                log.warn("❌ Task not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get completed tasks by user ID
     */
    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<?> getCompletedTasksByUserId(@PathVariable Long userId) {
        log.info("✅ Retrieving completed tasks for user ID: {}", userId);
        
        try {
            List<Task> tasks = taskService.getTasksByAssignedUserId(userId)
                    .stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.ACCEPTED)
                    .toList();
            
            log.info("✅ Retrieved {} completed tasks for user ID: {}", tasks.size(), userId);
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve completed tasks for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve completed tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get active tasks by user ID
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getActiveTasksByUserId(@PathVariable Long userId) {
        log.info("🔄 Retrieving active tasks for user ID: {}", userId);
        
        try {
            List<Task> tasks = taskService.getTasksByAssignedUserId(userId)
                    .stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.IN_PROGRESS)
                    .toList();
            
            log.info("✅ Retrieved {} active tasks for user ID: {}", tasks.size(), userId);
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve active tasks for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve active tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get user earnings from completed tasks
     */
    @GetMapping("/user/{userId}/earnings")
    public ResponseEntity<?> getUserEarnings(@PathVariable Long userId) {
        log.info("💰 Retrieving earnings for user ID: {}", userId);
        
        try {
            List<Task> completedTasks = taskService.getTasksByAssignedUserId(userId)
                    .stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.ACCEPTED)
                    .toList();
            
            java.math.BigDecimal totalEarnings = completedTasks.stream()
                    .map(Task::getBudget)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalEarnings", totalEarnings);
            response.put("completedTasksCount", completedTasks.size());
            response.put("completedTasks", completedTasks);
            
            log.info("✅ Retrieved earnings for user ID: {} - Total: ${}", userId, totalEarnings);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve earnings for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve earnings");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get task statistics for user
     */
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<?> getUserTaskStatistics(@PathVariable Long userId) {
        log.info("📊 Retrieving task statistics for user ID: {}", userId);
        
        try {
            List<Task> allTasks = taskService.getTasksByAssignedUserId(userId);
            
            long totalTasks = allTasks.size();
            long completedTasks = allTasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.ACCEPTED)
                    .count();
            long activeTasks = allTasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.IN_PROGRESS)
                    .count();
            long cancelledTasks = allTasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.CANCELLED)
                    .count();
            
            java.math.BigDecimal totalEarnings = allTasks.stream()
                    .filter(task -> task.getStatus() == Task.TaskStatus.ACCEPTED)
                    .map(Task::getBudget)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalTasks", totalTasks);
            response.put("completedTasks", completedTasks);
            response.put("activeTasks", activeTasks);
            response.put("cancelledTasks", cancelledTasks);
            response.put("totalEarnings", totalEarnings);
            response.put("completionRate", totalTasks > 0 ? (double) completedTasks / totalTasks : 0.0);
            
            log.info("✅ Retrieved task statistics for user ID: {} - Total: {}, Completed: {}, Active: {}", 
                    userId, totalTasks, completedTasks, activeTasks);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve task statistics for user ID: {} - Error: {}", userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve task statistics");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Check if task exists
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> checkTaskExists(@PathVariable Long id) {
        log.info("🔍 Checking if task exists with ID: {}", id);
        
        try {
            boolean exists = taskService.getTaskById(id).isPresent();
            
            log.info("✅ Task existence check completed for ID: {} - Exists: {}", id, exists);
            
            return ResponseEntity.ok(exists);
            
        } catch (Exception e) {
            log.error("❌ Failed to check task existence for ID: {} - Error: {}", id, e.getMessage(), e);
            
            // Return false if there's an error checking existence
            return ResponseEntity.ok(false);
        }
    }
    
    /**
     * Get tasks by owner ID
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getTasksByOwnerId(@PathVariable Long ownerId) {
        log.info("👤 Retrieving tasks for owner ID: {}", ownerId);
        
        try {
            List<Task> tasks = taskService.getTasksByOwnerId(ownerId);
            
            log.info("✅ Retrieved {} tasks for owner ID: {}", tasks.size(), ownerId);
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks for owner ID: {} - Error: {}", ownerId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get tasks by owner email
     */
    @GetMapping("/owner-email/{ownerEmail}")
    public ResponseEntity<?> getTasksByOwnerEmail(@PathVariable String ownerEmail) {
        log.info("👤 Retrieving tasks for owner email: {}", ownerEmail);
        
        try {
            List<Task> tasks = taskService.getTasksByOwnerEmail(ownerEmail);
            
            log.info("✅ Retrieved {} tasks for owner email: {}", tasks.size(), ownerEmail);
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks for owner email: {} - Error: {}", ownerEmail, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get tasks by assigned user ID
     */
    @GetMapping("/assigned/{assignedUserId}")
    public ResponseEntity<?> getTasksByAssignedUserId(@PathVariable Long assignedUserId) {
        log.info("👷 Retrieving tasks assigned to user ID: {}", assignedUserId);
        
        try {
            List<Task> tasks = taskService.getTasksByAssignedUserId(assignedUserId);
            
            log.info("✅ Retrieved {} tasks assigned to user ID: {}", tasks.size(), assignedUserId);
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks for assigned user ID: {} - Error: {}", assignedUserId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get tasks by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTasksByStatus(@PathVariable String status) {
        log.info("🏷️ Retrieving tasks with status: {}", status);
        
        try {
            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            List<Task> tasks = taskService.getTasksByStatus(taskStatus);
            
            log.info("✅ Retrieved {} tasks with status: {}", tasks.size(), status);
            
            return ResponseEntity.ok(tasks);
            
        } catch (IllegalArgumentException e) {
            log.warn("❌ Invalid status: {}", status);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid status");
            errorResponse.put("message", "Status must be one of: OPEN, IN_PROGRESS, COMPLETED, ACCEPTED, CANCELLED");
            
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks with status: {} - Error: {}", status, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get tasks by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getTasksByCategory(@PathVariable String category) {
        log.info("📂 Retrieving tasks in category: {}", category);
        
        try {
            Task.TaskCategory taskCategory = Task.TaskCategory.valueOf(category.toUpperCase());
            List<Task> tasks = taskService.getTasksByCategory(taskCategory);
            
            log.info("✅ Retrieved {} tasks in category: {}", tasks.size(), category);
            
            return ResponseEntity.ok(tasks);
            
        } catch (IllegalArgumentException e) {
            log.warn("❌ Invalid category: {}", category);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid category");
            errorResponse.put("message", "Category must be one of: ACADEMIC_WRITING, PROGRAMMING, MATHEMATICS, SCIENCE, LITERATURE, ENGINEERING, OTHER");
            
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks in category: {} - Error: {}", category, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get open tasks available for bidding
     */
    @GetMapping("/open-for-bidding")
    public ResponseEntity<?> getOpenTasksForBidding() {
        log.info("🏷️ Retrieving open tasks available for bidding");
        
        try {
            List<Task> tasks = taskService.getOpenTasksForBidding();
            
            log.info("✅ Retrieved {} open tasks available for bidding", tasks.size());
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve open tasks for bidding - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve open tasks");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get tasks ready for assignment
     */
    @GetMapping("/ready-for-assignment")
    public ResponseEntity<?> getTasksReadyForAssignment() {
        log.info("⏰ Retrieving tasks ready for assignment");
        
        try {
            List<Task> tasks = taskService.getTasksReadyForAssignment();
            
            log.info("✅ Retrieved {} tasks ready for assignment", tasks.size());
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks ready for assignment - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks ready for assignment");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update task
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody UpdateTaskRequest request, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("✏️ Updating task ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            // Build updated task
            Task updatedTask = Task.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .budget(request.getBudget())
                    .category(request.getCategory())
                    .completionDeadline(request.getCompletionDeadline())
                    .build();
            
            // Update task
            Task savedTask = taskService.updateTask(id, updatedTask, Long.parseLong(userId));
            
            log.info("✅ Task updated successfully: {} (ID: {})", savedTask.getTitle(), savedTask.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task updated successfully");
            response.put("taskId", savedTask.getId());
            response.put("title", savedTask.getTitle());
            response.put("status", savedTask.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to update task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Delete task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("🗑️ Deleting task ID: {} by user: {} ({})", id, userEmail, userId);
        
        try {
            taskService.deleteTask(id, Long.parseLong(userId));
            
            log.info("✅ Task deleted successfully (ID: {})", id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Task deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to delete task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    

    
    /**
     * Mark task as completed
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<?> markTaskAsCompleted(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("✅ Marking task ID: {} as completed by assigned user: {} ({})", id, userEmail, userId);
        
        try {
            Task completedTask = taskService.markTaskAsCompleted(id, Long.parseLong(userId));
            
            log.info("✅ Task marked as completed: {} (ID: {})", completedTask.getTitle(), completedTask.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task marked as completed");
            response.put("taskId", completedTask.getId());
            response.put("title", completedTask.getTitle());
            response.put("status", completedTask.getStatus());
            response.put("completedAt", completedTask.getCompletedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to mark task ID: {} as completed - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to mark task as completed");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Accept completed task
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptTask(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("👍 Accepting completed task ID: {} by owner: {} ({})", id, userEmail, userId);
        
        try {
            Task acceptedTask = taskService.acceptTask(id, Long.parseLong(userId));
            
            log.info("✅ Task accepted successfully: {} (ID: {})", acceptedTask.getTitle(), acceptedTask.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task accepted successfully");
            response.put("taskId", acceptedTask.getId());
            response.put("title", acceptedTask.getTitle());
            response.put("status", acceptedTask.getStatus());
            response.put("acceptedAt", acceptedTask.getAcceptedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to accept task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to accept task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Cancel task
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTask(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("❌ Cancelling task ID: {} by owner: {} ({})", id, userEmail, userId);
        
        try {
            Task cancelledTask = taskService.cancelTask(id, Long.parseLong(userId));
            
            log.info("✅ Task cancelled successfully: {} (ID: {})", cancelledTask.getTitle(), cancelledTask.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task cancelled successfully");
            response.put("taskId", cancelledTask.getId());
            response.put("title", cancelledTask.getTitle());
            response.put("status", cancelledTask.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to cancel task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to cancel task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get tasks that need attention
     */
    @GetMapping("/needing-attention")
    public ResponseEntity<?> getTasksNeedingAttention() {
        log.info("⚠️ Retrieving tasks that need attention");
        
        try {
            List<Task> tasks = taskService.getTasksNeedingAttention();
            
            log.info("✅ Retrieved {} tasks that need attention", tasks.size());
            
            return ResponseEntity.ok(tasks);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve tasks needing attention - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve tasks needing attention");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get task statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getTaskStatistics() {
        log.info("📊 Retrieving task statistics");
        
        try {
            var stats = taskService.getTaskStatistics();
            
            log.info("✅ Task statistics retrieved successfully");
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("❌ Failed to retrieve task statistics - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve task statistics");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get task bidding status
     */
    @GetMapping("/{id}/bidding-status")
    public ResponseEntity<BiddingStatusResponse> getTaskBiddingStatus(@PathVariable Long id) {
        log.info("🔍 Checking bidding status for task ID: {}", id);
        
        try {
            Optional<Task> taskOpt = taskService.getTaskById(id);
            if (taskOpt.isEmpty()) {
                log.warn("❌ Task not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            Task task = taskOpt.get();
            
            // Create bidding status response using BiddingStatusResponse DTO
            BiddingStatusResponse biddingStatus = BiddingStatusResponse.builder()
                .taskId(task.getId())
                .status(task.getStatus().toString())
                .biddingDeadline(task.getBiddingDeadline())
                .isOpenForBidding(task.isOpenForBidding())
                .totalBids(0) // Will be updated by Bidding Service
                .lowestBidAmount(null) // Will be updated by Bidding Service
                .highestBidAmount(null) // Will be updated by Bidding Service
                .lastBidTime(null) // Will be updated by Bidding Service
                .build();
            
            log.info("✅ Bidding status retrieved for task ID: {} - Open: {}", id, biddingStatus.isOpenForBidding());
            
            return ResponseEntity.ok(biddingStatus);
            
        } catch (Exception e) {
            log.error("❌ Failed to get bidding status for task ID: {} - Error: {}", id, e.getMessage(), e);
            
            // Return error response with proper DTO structure
            BiddingStatusResponse errorResponse = BiddingStatusResponse.builder()
                .taskId(id)
                .status("ERROR")
                .isOpenForBidding(false)
                .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update task status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestBody UpdateTaskStatusRequest request) {
        log.info("🔄 Updating status for task ID: {} to: {}", id, request.getStatus());
        
        try {
            Task updatedTask = taskService.updateTaskStatus(id, request.getStatus());
            
            log.info("✅ Task status updated successfully: ID: {}, New Status: {}", id, updatedTask.getStatus());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task status updated successfully");
            response.put("taskId", updatedTask.getId());
            response.put("newStatus", updatedTask.getStatus());
            response.put("updatedAt", updatedTask.getUpdatedAt());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to update task status for ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update task status");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Assign task to user
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignTask(@PathVariable Long id, @RequestBody AssignTaskRequest request) {
        log.info("👤 Assigning task ID: {} to user: {} ({})", id, request.getAssignedUserEmail(), request.getAssignedUserId());
        
        try {
            Task assignedTask = taskService.assignTask(id, request.getAssignedUserId(), request.getAssignedUserEmail());
            
            log.info("✅ Task assigned successfully: ID: {} to user: {}", id, request.getAssignedUserEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task assigned successfully");
            response.put("taskId", assignedTask.getId());
            response.put("assignedUserId", assignedTask.getAssignedUserId());
            response.put("assignedUserEmail", assignedTask.getAssignedUserEmail());
            response.put("assignedAt", assignedTask.getAssignedAt());
            response.put("status", assignedTask.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to assign task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to assign task");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Extend bidding deadline for testing purposes
     */
    @PostMapping("/{id}/extend-bidding")
    public ResponseEntity<?> extendBiddingDeadline(@PathVariable Long id, @RequestBody ExtendBiddingRequest request) {
        log.info("⏰ Extending bidding deadline for task ID: {} by {} hours", id, request.getAdditionalHours());
        
        try {
            Optional<Task> taskOpt = taskService.getTaskById(id);
            if (taskOpt.isEmpty()) {
                log.warn("❌ Task not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            Task task = taskOpt.get();
            
            // Extend bidding deadline
            LocalDateTime newDeadline = task.getBiddingDeadline().plusHours(request.getAdditionalHours());
            task.setBiddingDeadline(newDeadline);
            task.setUpdatedAt(LocalDateTime.now());
            
            Task savedTask = taskService.saveTask(task);
            
            log.info("✅ Bidding deadline extended for task ID: {} to: {}", id, newDeadline);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bidding deadline extended successfully");
            response.put("taskId", savedTask.getId());
            response.put("newBiddingDeadline", savedTask.getBiddingDeadline());
            response.put("isOpenForBidding", savedTask.isOpenForBidding());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to extend bidding deadline for task ID: {} - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to extend bidding deadline");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Reset bidding deadline for testing
     */
    @PostMapping("/{id}/reset-deadline")
    public ResponseEntity<?> resetBiddingDeadline(@PathVariable Long id) {
        log.info("⏰ Resetting bidding deadline for task ID: {}", id);
        
        try {
            Optional<Task> taskOpt = taskService.getTaskById(id);
            if (taskOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Task task = taskOpt.get();
            LocalDateTime newDeadline = LocalDateTime.now().plusHours(24);
            task.setBiddingDeadline(newDeadline);
            task.setUpdatedAt(LocalDateTime.now());
            
            Task savedTask = taskService.saveTask(task);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Deadline reset successfully");
            response.put("newDeadline", savedTask.getBiddingDeadline());
            response.put("isOpenForBidding", savedTask.isOpenForBidding());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to reset deadline for task ID: {} - Error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Test endpoint to check bidding logic
     */
    @GetMapping("/test-bidding")
    public ResponseEntity<?> testBiddingLogic() {
        log.info("🔄 Testing bidding logic");
        
        try {
            // This endpoint is primarily for testing the bidding logic.
            // It will simulate a bidding period and then extend it.
            
            // 1. Get an open task for bidding
            Optional<Task> openTaskOpt = taskService.getOpenTasksForBidding().stream().findFirst();
            
            if (openTaskOpt.isEmpty()) {
                log.warn("❌ No open task found for bidding test.");
                return ResponseEntity.badRequest().body(Map.of("error", "No open task found for bidding test."));
            }
            
            Task openTask = openTaskOpt.get();
            log.info("🏷️ Found open task for bidding test: {} (ID: {})", openTask.getTitle(), openTask.getId());
            
            // 2. Check initial bidding status
            ResponseEntity<BiddingStatusResponse> initialBiddingStatus = getTaskBiddingStatus(openTask.getId());
            if (initialBiddingStatus.getStatusCode() != HttpStatus.OK) {
                log.error("❌ Failed to get initial bidding status for task ID: {}", openTask.getId());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to get initial bidding status"));
            }
            
            log.info("🔍 Initial Bidding Status for Task ID {}: {}", openTask.getId(), initialBiddingStatus.getBody());
            
            // 3. Extend bidding deadline
            LocalDateTime newDeadline = LocalDateTime.now().plusHours(24); // Extend by 24 hours
            openTask.setBiddingDeadline(newDeadline);
            openTask.setUpdatedAt(LocalDateTime.now());
            
            Task savedTask = taskService.saveTask(openTask);
            
            log.info("✅ Bidding deadline extended for task ID: {} to: {}", openTask.getId(), newDeadline);
            
            // 4. Check updated bidding status
            ResponseEntity<BiddingStatusResponse> updatedBiddingStatus = getTaskBiddingStatus(openTask.getId());
            if (updatedBiddingStatus.getStatusCode() != HttpStatus.OK) {
                log.error("❌ Failed to get updated bidding status for task ID: {}", openTask.getId());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to get updated bidding status"));
            }
            
            log.info("🔍 Updated Bidding Status for Task ID {}: {}", openTask.getId(), updatedBiddingStatus.getBody());
            
            return ResponseEntity.ok(Map.of("message", "Bidding logic test completed successfully."));
            
        } catch (Exception e) {
            log.error("❌ Failed to run bidding logic test - Error: {}", e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to run bidding logic test");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Check if a user is the owner of a specific task
     */
    @GetMapping("/{taskId}/owner/{userId}")
    public ResponseEntity<?> isTaskOwner(@PathVariable Long taskId, 
                                       @PathVariable Long userId,
                                       HttpServletRequest httpRequest) {
        log.info("🔍 Checking if user ID: {} is the owner of task ID: {}", userId, taskId);
        
        try {
            // Extract user context from headers for validation
            String requestUserId = httpRequest.getHeader("X-User-Id");
            String requestUserEmail = httpRequest.getHeader("X-User-Email");
            
            log.info("🔍 Request context - User ID: {}, Email: {}, Checking ownership for: {}", 
                    requestUserId, requestUserEmail, userId);
            
            // Validate that the requesting user matches the user being checked
            if (requestUserId == null || !requestUserId.equals(userId.toString())) {
                log.warn("⚠️ User ID mismatch: Request from user {}, checking ownership for user {}", 
                        requestUserId, userId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized ownership check");
                errorResponse.put("message", "You can only check your own ownership status");
                errorResponse.put("success", false);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }
            
            boolean isOwner = taskService.isTaskOwner(taskId, userId);
            
            log.info("✅ Task ownership check completed: User {} {} the owner of task {}", 
                    userId, isOwner ? "IS" : "IS NOT", taskId);
            
            // Return response that matches the DTO structure expected by Feign Client
            Map<String, Object> response = new HashMap<>();
            response.put("taskId", taskId);
            response.put("userId", userId);
            response.put("isOwner", isOwner);
            response.put("message", isOwner ? "User is the task owner" : "User is not the task owner");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to check task ownership for task ID: {} and user ID: {} - Error: {}", 
                    taskId, userId, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check task ownership");
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
        return ResponseEntity.ok("Task Service is running - Phase 2 ✅");
    }
    
    // ==================== INNER CLASSES ====================
    
    /**
     * Create Task Request DTO
     */
    @lombok.Data
    public static class CreateTaskRequest {
        private String title;
        private String description;
        private java.math.BigDecimal budget;
        private Task.TaskCategory category;
        private java.time.LocalDateTime completionDeadline;
    }
    
    /**
     * Update Task Request DTO
     */
    @lombok.Data
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private java.math.BigDecimal budget;
        private Task.TaskCategory category;
        private java.time.LocalDateTime completionDeadline;
    }
    
    /**
     * Assign Task Request DTO
     */
    @lombok.Data
    public static class AssignTaskRequest {
        private Long assignedUserId;
        private String assignedUserEmail;
    }
    
    /**
     * Update Task Status Request DTO
     */
    @lombok.Data
    public static class UpdateTaskStatusRequest {
        private Task.TaskStatus status;
    }

    /**
     * Extend Bidding Request DTO
     */
    @lombok.Data
    public static class ExtendBiddingRequest {
        private int additionalHours;
    }
    
    /**
     * Accept task with timestamp synchronization (called by Bidding Service)
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptTaskWithTimestamp(@PathVariable Long id, @RequestBody TaskAcceptRequest request) {
        log.info("🔄 Accepting task ID: {} with timestamp synchronization", id);
        
        try {
            Task acceptedTask = taskService.acceptTaskWithTimestamp(id, request.getAcceptedAt());
            
            log.info("✅ Task accepted with timestamp: {} (ID: {}) at {}", 
                    acceptedTask.getTitle(), acceptedTask.getId(), acceptedTask.getAcceptedAt());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task accepted successfully");
            response.put("taskId", acceptedTask.getId());
            response.put("title", acceptedTask.getTitle());
            response.put("status", acceptedTask.getStatus());
            response.put("acceptedAt", acceptedTask.getAcceptedAt());
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to accept task ID: {} with timestamp - Error: {}", id, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to accept task");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Complete task with timestamp synchronization (called by Bidding Service)
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeTaskWithTimestamp(@PathVariable Long id, @RequestBody TaskCompleteRequest request) {
        log.info("🔄 Completing task ID: {} with timestamp synchronization", id);
        
        try {
            Task completedTask = taskService.completeTaskWithTimestamp(id, request.getCompletedAt());
            
            log.info("✅ Task completed with timestamp: {} (ID: {}) at {}", 
                    completedTask.getTitle(), completedTask.getId(), completedTask.getCompletedAt());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Task completed successfully");
            response.put("taskId", completedTask.getId());
            response.put("title", completedTask.getTitle());
            response.put("status", completedTask.getStatus());
            response.put("completedAt", completedTask.getCompletedAt());
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to complete task ID: {} with timestamp - Error: {}", id, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to complete task");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Check if task can be edited or deleted
     */
    @GetMapping("/{id}/can-edit")
    public ResponseEntity<?> canTaskBeEdited(@PathVariable Long id, HttpServletRequest httpRequest) {
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userId = httpRequest.getHeader("X-User-Id");
        
        log.info("🔍 Checking if task ID: {} can be edited by user: {} ({})", id, userEmail, userId);
        
        try {
            boolean canEdit = taskService.canTaskBeEditedOrDeleted(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("canEdit", canEdit);
            response.put("taskId", id);
            response.put("message", canEdit ? 
                "Task can be edited or deleted" : 
                "Task cannot be edited or deleted because it has bids or bidding period has ended");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to check if task ID: {} can be edited - Error: {}", id, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check task edit status");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Task Accept Request DTO
     */
    @lombok.Data
    public static class TaskAcceptRequest {
        private LocalDateTime acceptedAt;
    }
    
    /**
     * Task Complete Request DTO
     */
    @lombok.Data
    public static class TaskCompleteRequest {
        private LocalDateTime completedAt;
    }
}
