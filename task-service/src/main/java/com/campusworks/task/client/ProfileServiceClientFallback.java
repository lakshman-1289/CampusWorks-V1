package com.campusworks.task.client;

import com.campusworks.task.dto.TaskCompletionRequest;
import com.campusworks.task.dto.ProfileResponse;
import com.campusworks.task.dto.ProfileUpdateResponse;
import com.campusworks.task.dto.ProfileRatingResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback implementation for Profile Service Client
 * Handles service unavailability gracefully
 */
@Component
@Slf4j
public class ProfileServiceClientFallback implements ProfileServiceClient {
    
    @Override
    public ProfileResponse getProfileByUserId(Long userId) {
        log.error("Profile Service unavailable - fallback triggered for userId: {}", userId);
        throw new RuntimeException("Profile Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public ProfileUpdateResponse markTaskCompleted(Long profileId, TaskCompletionRequest request) {
        log.error("Profile Service unavailable - fallback triggered for profileId: {}", profileId);
        throw new RuntimeException("Profile Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public ProfileUpdateResponse updateAvailability(Long profileId, String availabilityStatus) {
        log.error("Profile Service unavailable - fallback triggered for profileId: {}", profileId);
        throw new RuntimeException("Profile Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public ProfileRatingResponse getProfileRating(Long profileId) {
        log.error("Profile Service unavailable - fallback triggered for profileId: {}", profileId);
        throw new RuntimeException("Profile Service is currently unavailable. Please try again later.");
    }
    
    @Override
    public boolean isUserAvailable(Long profileId) {
        log.error("Profile Service unavailable - fallback triggered for profileId: {}", profileId);
        return false; // Assume user is not available when service is down
    }
}
