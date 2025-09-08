package com.campusworks.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/**
 * Service for validating college email addresses
 * Only allows RGUKT Nuzvidu emails with specific pattern
 */
@Service
public class EmailValidationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailValidationService.class);

    @Value("${app.email.college.pattern:^n\\d{6}@rguktn\\.ac\\.in$}")
    private String collegeEmailPattern;

    @Value("${app.email.college.domain:rguktn.ac.in}")
    private String collegeDomain;

    private Pattern pattern;

    /**
     * Initialize the email pattern
     */
    private Pattern getPattern() {
        if (pattern == null) {
            pattern = Pattern.compile(collegeEmailPattern);
            logger.info("🎓 Initialized college email pattern: {}", collegeEmailPattern);
        }
        return pattern;
    }

    /**
     * Validate if email matches the college email pattern
     * Pattern: ^n\d{6}@rguktn\.ac\.in$
     * 
     * Valid examples:
     * - n210419@rguktn.ac.in
     * - n191003@rguktn.ac.in
     * - n210456@rguktn.ac.in
     * 
     * Invalid examples:
     * - student@rguktn.ac.in
     * - n12345@rguktn.ac.in (only 5 digits)
     * - n1234567@rguktn.ac.in (7 digits)
     * - n210419@gmail.com
     */
    public boolean isValidCollegeEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            logger.debug("❌ Email validation failed: Email is null or empty");
            return false;
        }

        email = email.trim().toLowerCase();
        boolean isValid = getPattern().matcher(email).matches();
        
        if (isValid) {
            logger.debug("✅ Email validation successful: {}", email);
        } else {
            logger.debug("❌ Email validation failed: {} (doesn't match pattern: {})", email, collegeEmailPattern);
        }
        
        return isValid;
    }

    /**
     * Extract student ID from email
     * Example: n210419@rguktn.ac.in -> 210419
     */
    public String extractStudentId(String email) {
        if (!isValidCollegeEmail(email)) {
            return null;
        }
        
        // Extract the 6 digits after 'n'
        String localPart = email.substring(0, email.indexOf("@"));
        return localPart.substring(1); // Remove 'n' prefix
    }

    /**
     * Extract student year from email
     * Example: n210419@rguktn.ac.in -> 21 (year 2021)
     */
    public String extractStudentYear(String email) {
        String studentId = extractStudentId(email);
        if (studentId != null && studentId.length() >= 2) {
            return "20" + studentId.substring(0, 2); // 21 -> 2021
        }
        return null;
    }

    /**
     * Get validation error message for invalid emails
     */
    public String getValidationErrorMessage(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "Email address is required";
        }

        email = email.trim().toLowerCase();

        if (!email.endsWith("@" + collegeDomain)) {
            return "Only " + collegeDomain + " email addresses are allowed";
        }

        if (!email.startsWith("n")) {
            return "Email must start with 'n' followed by 6 digits";
        }

        String localPart = email.substring(0, email.indexOf("@"));
        if (localPart.length() != 7) { // n + 6 digits
            return "Email must be in format: n######@" + collegeDomain + " (n followed by exactly 6 digits)";
        }

        try {
            String digits = localPart.substring(1);
            Integer.parseInt(digits); // Check if it's numeric
            if (digits.length() != 6) {
                return "Email must contain exactly 6 digits after 'n'";
            }
        } catch (NumberFormatException e) {
            return "Email must contain only digits after 'n'";
        }

        return "Invalid email format. Use: n######@" + collegeDomain + " (example: n210419@" + collegeDomain + ")";
    }

    /**
     * Get the college domain
     */
    public String getCollegeDomain() {
        return collegeDomain;
    }

    /**
     * Get example valid emails for display
     */
    public String[] getExampleEmails() {
        return new String[]{
            "n210419@" + collegeDomain,
            "n191003@" + collegeDomain,
            "n210456@" + collegeDomain
        };
    }
}
