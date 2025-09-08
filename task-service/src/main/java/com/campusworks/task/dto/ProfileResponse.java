package com.campusworks.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for profile response via inter-service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String bio;
    private String university;
    private String major;
    private Integer experienceYears;
    private List<String> skills;
    private BigDecimal hourlyRate;
    private Double rating;
    private String availabilityStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
