package com.campusworks.auth.repo;

import com.campusworks.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository
 * Handles database operations for User entities
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email address
     * @param email user's email address
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email address
     * @param email user's email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
}
