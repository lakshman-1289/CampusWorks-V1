package com.campusworks.profile.repo;

import com.campusworks.profile.model.Profile;
import com.campusworks.profile.model.Profile.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Profile Repository
 * Handles database operations for Profile entities
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    /**
     * Find profile by user ID
     */
    Optional<Profile> findByUserId(Long userId);
    
    /**
     * Find profile by user email
     */
    Optional<Profile> findByUserEmail(String userEmail);
    
    /**
     * Find all public profiles (newest first)
     */
    List<Profile> findByIsPublicTrueOrderByUpdatedAtDesc();
    
    /**
     * Find all verified profiles (newest first)
     */
    List<Profile> findByIsVerifiedTrueOrderByUpdatedAtDesc();
    
    /**
     * Find profiles by availability status (newest first)
     */
    List<Profile> findByAvailabilityStatusOrderByUpdatedAtDesc(AvailabilityStatus status);
    
    /**
     * Find profiles by university (newest first)
     */
    List<Profile> findByUniversityOrderByUpdatedAtDesc(String university);
    
    /**
     * Find profiles by major (newest first)
     */
    List<Profile> findByMajorOrderByUpdatedAtDesc(String major);
    
    /**
     * Find profiles by academic year (newest first)
     */
    List<Profile> findByAcademicYearOrderByUpdatedAtDesc(Integer academicYear);
    
    /**
     * Find profiles by completed tasks count
     */
    @Query("SELECT p FROM Profile p WHERE p.completedTasks >= :minTasks ORDER BY p.completedTasks DESC")
    List<Profile> findByCompletedTasksAbove(@Param("minTasks") Integer minTasks);
    
    /**
     * Find profiles by successful tasks count
     */
    @Query("SELECT p FROM Profile p WHERE p.successfulTasks >= :minTasks ORDER BY p.successfulTasks DESC")
    List<Profile> findBySuccessfulTasksAbove(@Param("minTasks") Integer minTasks);
    
    /**
     * Find profiles by total earnings
     */
    @Query("SELECT p FROM Profile p WHERE p.totalEarnings >= :minEarnings ORDER BY p.totalEarnings DESC")
    List<Profile> findByTotalEarningsAbove(@Param("minEarnings") java.math.BigDecimal minEarnings);
    
    /**
     * Find profiles by total earnings range
     */
    @Query("SELECT p FROM Profile p WHERE p.totalEarnings BETWEEN :minEarnings AND :maxEarnings ORDER BY p.totalEarnings DESC")
    List<Profile> findByTotalEarningsRange(@Param("minEarnings") java.math.BigDecimal minEarnings, @Param("maxEarnings") java.math.BigDecimal maxEarnings);
    
    /**
     * Find profiles that are available for work
     */
    @Query("SELECT p FROM Profile p WHERE p.isPublic = true AND p.isVerified = true AND p.availabilityStatus = 'AVAILABLE' ORDER BY p.updatedAt DESC")
    List<Profile> findAvailableForWork();
    
    /**
     * Find profiles by multiple criteria (simplified)
     */
    @Query("SELECT p FROM Profile p WHERE " +
           "(:university IS NULL OR p.university = :university) AND " +
           "(:major IS NULL OR p.major = :major) AND " +
           "p.isPublic = true " +
           "ORDER BY p.updatedAt DESC")
    List<Profile> findByMultipleCriteria(
            @Param("university") String university,
            @Param("major") String major);
    
    /**
     * Find profiles by last active time
     */
    @Query("SELECT p FROM Profile p WHERE p.lastActive >= :since ORDER BY p.lastActive DESC")
    List<Profile> findRecentlyActive(@Param("since") java.time.LocalDateTime since);
    
    /**
     * Find profiles created within a date range
     */
    @Query("SELECT p FROM Profile p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Profile> findByCreatedDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                       @Param("endDate") java.time.LocalDateTime endDate);
    
    /**
     * Find profiles updated within a date range
     */
    @Query("SELECT p FROM Profile p WHERE p.updatedAt BETWEEN :startDate AND :endDate ORDER BY p.updatedAt DESC")
    List<Profile> findByUpdatedDateRange(@Param("startDate") java.time.LocalDateTime startDate, 
                                       @Param("endDate") java.time.LocalDateTime endDate);
    
    /**
     * Count profiles by university
     */
    long countByUniversity(String university);
    
    /**
     * Count profiles by major
     */
    long countByMajor(String major);
    
    /**
     * Count profiles by availability status
     */
    long countByAvailabilityStatus(AvailabilityStatus status);
    
    /**
     * Count verified profiles
     */
    long countByIsVerifiedTrue();
    
    /**
     * Count public profiles
     */
    long countByIsPublicTrue();
    
    /**
     * Count profiles by academic year
     */
    long countByAcademicYear(Integer academicYear);
    
    /**
     * Check if profile exists by user ID
     */
    boolean existsByUserId(Long userId);
    
    /**
     * Check if profile exists by user email
     */
    boolean existsByUserEmail(String userEmail);
}
