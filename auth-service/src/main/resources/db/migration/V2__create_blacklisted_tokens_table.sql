-- Create blacklisted_tokens table for JWT logout functionality
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_jti VARCHAR(500) NOT NULL UNIQUE COMMENT 'JWT ID - unique identifier for the token',
    user_id BIGINT NOT NULL COMMENT 'ID of the user who owns the token',
    user_email VARCHAR(255) NOT NULL COMMENT 'Email of the user who owns the token',
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the token was blacklisted',
    expires_at TIMESTAMP NOT NULL COMMENT 'When the original token expires',
    reason VARCHAR(255) DEFAULT 'User logout' COMMENT 'Reason for blacklisting',
    
    INDEX idx_token_jti (token_jti),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_blacklisted_at (blacklisted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Stores blacklisted JWT tokens for logout functionality';
