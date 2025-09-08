package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for profile rating response via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRatingResponse {
    private Long profileId;
    private Double rating;
    private Long totalReviews;
    private String ratingLevel;
    private LocalDateTime lastReviewDate;
}
