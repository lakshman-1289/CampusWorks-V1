package com.campusworks.auth.service;

import com.campusworks.auth.model.User;
import com.campusworks.auth.model.VerificationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;

/**
 * Email Service for sending verification and notification emails
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.name:CampusWorks}")
    private String appName;

    /**
     * Send email verification email to user
     */
    public boolean sendVerificationEmail(User user, VerificationToken token) {
        if (user == null || token == null || user.getEmail() == null) {
            logger.error("❌ Cannot send verification email: user or token is null");
            return false;
        }

        logger.info("📧 Sending verification email to: {}", user.getEmail());

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Email details
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("🎓 Verify Your " + (appName != null ? appName : "CampusWorks") + " Account");

            // Create email content
            String verificationUrl = frontendUrl + "/verify-email?token=" + token.getToken();
            String htmlContent = createVerificationEmailContent(user, verificationUrl, token);

            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(mimeMessage);
            
            logger.info("✅ Verification email sent successfully to: {}", user.getEmail());
            return true;

        } catch (MailException | MessagingException e) {
            logger.error("❌ Failed to send verification email to {}: {}", user.getEmail(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send welcome email after successful verification
     */
    public boolean sendWelcomeEmail(User user) {
        if (user == null || user.getEmail() == null) {
            logger.error("❌ Cannot send welcome email: user is null");
            return false;
        }

        logger.info("📧 Sending welcome email to: {}", user.getEmail());

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("🎉 Welcome to " + (appName != null ? appName : "CampusWorks") + "!");

            String htmlContent = createWelcomeEmailContent(user);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            
            logger.info("✅ Welcome email sent successfully to: {}", user.getEmail());
            return true;

        } catch (MailException | MessagingException e) {
            logger.error("❌ Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Send password reset email to user
     * @param user the user to send reset email to
     * @param resetToken the password reset token
     * @return true if email sent successfully
     */
    public boolean sendPasswordResetEmail(User user, VerificationToken resetToken) {
        if (user == null || user.getEmail() == null || resetToken == null) {
            logger.error("❌ Cannot send password reset email: user or token is null");
            return false;
        }

        logger.info("📧 Sending password reset email to: {}", user.getEmail());

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("🔑 Reset Your Password - " + (appName != null ? appName : "CampusWorks"));

            String resetUrl = (frontendUrl != null ? frontendUrl : "http://localhost:3000") + 
                            "/reset-password?token=" + resetToken.getToken() + 
                            "&email=" + user.getEmail();
            
            String htmlContent = createPasswordResetEmailContent(user, resetUrl);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            
            logger.info("✅ Password reset email sent successfully to: {}", user.getEmail());
            return true;

        } catch (MailException | MessagingException e) {
            logger.error("❌ Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * Create HTML content for verification email
     */
    private String createVerificationEmailContent(User user, String verificationUrl, VerificationToken token) {
        Context context = new Context();
        context.setVariable("userName", extractNameFromEmail(user.getEmail()));
        context.setVariable("userEmail", user.getEmail());
        context.setVariable("verificationUrl", verificationUrl);
        context.setVariable("appName", appName);
        context.setVariable("frontendUrl", frontendUrl);
        context.setVariable("expiryHours", "24");

        try {
            return templateEngine.process("verification-email", context);
        } catch (Exception e) {
            logger.warn("⚠️ Failed to process email template, using fallback: {}", e.getMessage());
            return createFallbackVerificationEmail(user, verificationUrl);
        }
    }

    /**
     * Create HTML content for welcome email
     */
    private String createWelcomeEmailContent(User user) {
        Context context = new Context();
        context.setVariable("userName", extractNameFromEmail(user.getEmail()));
        context.setVariable("userEmail", user.getEmail());
        context.setVariable("appName", appName);
        context.setVariable("frontendUrl", frontendUrl);

        try {
            return templateEngine.process("welcome-email", context);
        } catch (Exception e) {
            logger.warn("⚠️ Failed to process welcome email template, using fallback: {}", e.getMessage());
            return createFallbackWelcomeEmail(user);
        }
    }
    
    /**
     * Create HTML content for password reset email
     */
    private String createPasswordResetEmailContent(User user, String resetUrl) {
        Context context = new Context();
        context.setVariable("userName", extractNameFromEmail(user.getEmail()));
        context.setVariable("userEmail", user.getEmail());
        context.setVariable("resetUrl", resetUrl);
        context.setVariable("appName", appName);
        context.setVariable("expiryHours", "24");

        try {
            return templateEngine.process("password-reset-email", context);
        } catch (Exception e) {
            logger.warn("⚠️ Failed to process password reset email template, using fallback: {}", e.getMessage());
            return createFallbackPasswordResetEmail(user, resetUrl);
        }
    }

    /**
     * Fallback verification email (HTML)
     */
    private String createFallbackVerificationEmail(User user, String verificationUrl) {
        String userName = extractNameFromEmail(user.getEmail());
        String appNameSafe = (appName != null) ? appName : "CampusWorks";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Verify Your Email</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 %s</h1>
                    <p>Email Verification Required</p>
                </div>
                <div class="content">
                    <h2>Hello %s! 👋</h2>
                    <p>Welcome to %s! To complete your registration and start using our peer-to-peer academic platform, please verify your email address.</p>
                    
                    <p><strong>Your Account Details:</strong></p>
                    <ul>
                        <li>Email: %s</li>
                        <li>Role: %s</li>
                        <li>Registration: Just now</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="%s" class="button">✅ Verify My Email</a>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⏰ Important:</strong> This verification link will expire in <strong>24 hours</strong>. Please verify your email as soon as possible.</p>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><a href="%s">%s</a></p>
                    
                    <hr>
                    <p><small>If you didn't create an account with %s, please ignore this email.</small></p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 %s - RGUKT Nuzvidu Academic Platform</p>
                </div>
            </body>
            </html>
            """, 
            appNameSafe, userName, appNameSafe, user.getEmail(), user.getRole(), 
            verificationUrl, verificationUrl, verificationUrl, appNameSafe, appNameSafe);
    }

    /**
     * Fallback welcome email (HTML)
     */
    private String createFallbackWelcomeEmail(User user) {
        String userName = extractNameFromEmail(user.getEmail());
        String appNameSafe = (appName != null) ? appName : "CampusWorks";
        String frontendUrlSafe = (frontendUrl != null) ? frontendUrl : "http://localhost:3000";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Welcome to %s</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
                    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
                    .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2196F3; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Welcome to %s!</h1>
                    <p>Your account is now active</p>
                </div>
                <div class="content">
                    <h2>Hello %s! 🎓</h2>
                    <p>Congratulations! Your email has been verified and your %s account is now active.</p>
                    
                    <h3>🚀 What can you do now?</h3>
                    
                    <div class="feature">
                        <h4>📝 Post Academic Tasks</h4>
                        <p>Need help with assignments, projects, or research? Post your tasks and get bids from fellow students.</p>
                    </div>
                    
                    <div class="feature">
                        <h4>💰 Earn Money</h4>
                        <p>Use your skills to help other students and earn money by bidding on tasks you can complete.</p>
                    </div>
                    
                    <div class="feature">
                        <h4>🔒 Secure Payments</h4>
                        <p>All payments are handled securely through our escrow system for your protection.</p>
                    </div>
                    
                    <div class="feature">
                        <h4>⭐ Build Reputation</h4>
                        <p>Complete tasks successfully to build your reputation and attract more opportunities.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s/login" class="button">🚀 Start Using %s</a>
                        <a href="%s/dashboard" class="button">📊 Go to Dashboard</a>
                    </div>
                    
                    <hr>
                    <p>Need help getting started? Check out our platform and explore the features!</p>
                    <p>Happy learning and earning! 🎓💰</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 %s - RGUKT Nuzvidu Academic Platform</p>
                    <p>Connecting students for academic success</p>
                </div>
            </body>
            </html>
            """, 
            appNameSafe, appNameSafe, userName, appNameSafe, 
            frontendUrlSafe, appNameSafe, frontendUrlSafe, appNameSafe);
    }

    /**
     * Extract name from RGUKT email (n210419@rguktn.ac.in -> N210419)
     */
    private String extractNameFromEmail(String email) {
        if (email != null && email.contains("@")) {
            String localPart = email.substring(0, email.indexOf("@"));
            return localPart.toUpperCase(); // Convert n210419 to N210419
        }
        return "Student";
    }
    
    /**
     * Fallback password reset email (HTML)
     */
    private String createFallbackPasswordResetEmail(User user, String resetUrl) {
        String userName = extractNameFromEmail(user.getEmail());
        String appNameSafe = (appName != null) ? appName : "CampusWorks";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reset Your Password</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔑 %s</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <h2>Hello %s! 👋</h2>
                    <p>We received a request to reset your password for your %s account.</p>
                    
                    <p><strong>Account Details:</strong></p>
                    <ul>
                        <li>Email: %s</li>
                        <li>Request Time: %s</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="%s" class="button">🔑 Reset My Password</a>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⏰ Important:</strong> This reset link will expire in <strong>24 hours</strong>. Please reset your password as soon as possible.</p>
                        <p><strong>🔒 Security:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><a href="%s">%s</a></p>
                    
                    <hr>
                    <p><small>This is an automated message. Please do not reply to this email.</small></p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 %s - RGUKT Nuzvidu Academic Platform</p>
                </div>
            </body>
            </html>
            """, 
            appNameSafe, userName, appNameSafe, user.getEmail(), 
            LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")),
            resetUrl, resetUrl, resetUrl, appNameSafe);
    }

    /**
     * Send simple text email (fallback)
     */
    public boolean sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            logger.info("✅ Simple email sent to: {}", to);
            return true;
            
        } catch (MailException e) {
            logger.error("❌ Failed to send simple email to {}: {}", to, e.getMessage());
            return false;
        }
    }
}
