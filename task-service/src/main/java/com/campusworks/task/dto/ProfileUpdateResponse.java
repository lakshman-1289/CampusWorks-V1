package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for profile update response via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateResponse {
    private Long profileId;
    private String status;
    private String message;
    private LocalDateTime updatedAt;
    private boolean success;
}
