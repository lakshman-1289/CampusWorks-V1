package com.campusworks.task.client;

import com.campusworks.task.dto.TaskCompletionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

/**
 * Feign Client for communicating with Profile Service
 */
@FeignClient(name = "profile-service", fallback = ProfileServiceClientFallback.class)
public interface ProfileServiceClient {
    
    /**
     * Get profile by user ID
     */
    @GetMapping("/profiles/user/{userId}")
    com.campusworks.task.dto.ProfileResponse getProfileByUserId(@PathVariable("userId") Long userId);
    
    /**
     * Mark task as completed for user
     */
    @PutMapping("/profiles/{profileId}/task-completed")
    com.campusworks.task.dto.ProfileUpdateResponse markTaskCompleted(@PathVariable("profileId") Long profileId, 
                            @RequestBody TaskCompletionRequest request);
    
    /**
     * Update user availability status
     */
    @PutMapping("/profiles/{profileId}/availability")
    com.campusworks.task.dto.ProfileUpdateResponse updateAvailability(@PathVariable("profileId") Long profileId, 
                             @RequestBody String availabilityStatus);
    
    /**
     * Get user profile rating
     */
    @GetMapping("/profiles/{profileId}/rating")
    com.campusworks.task.dto.ProfileRatingResponse getProfileRating(@PathVariable("profileId") Long profileId);
    
    /**
     * Check if user is available for work
     */
    @GetMapping("/profiles/{profileId}/available")
    boolean isUserAvailable(@PathVariable("profileId") Long profileId);
}
