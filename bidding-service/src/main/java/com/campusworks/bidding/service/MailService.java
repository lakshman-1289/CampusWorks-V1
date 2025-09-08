package com.campusworks.bidding.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Mail Service for sending email notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${spring.mail.properties.mail.smtp.from:manikantareddi2273@gmail.com}")
    private String fromName;
    
    /**
     * Send email to bidder when task is assigned
     */
    public void sendTaskAssignmentEmailToBidder(String bidderEmail, String taskOwnerEmail, 
                                               String taskTitle, LocalDateTime deadline, 
                                               BigDecimal amount) {
        try {
            log.info("📧 Sending task assignment email to bidder: {}", bidderEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(bidderEmail);
            message.setSubject("🎉 Congratulations! You Won the Bid - " + taskTitle);
            
            String deadlineFormatted = deadline.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String amountFormatted = "₹" + amount.toString();
            
            String emailContent = String.format("""
                Dear Bidder,
                
                🎉 Congratulations! You have won the bid for the task assigned by %s.
                
                Task Details:
                • Task Title: %s
                • Deadline: %s
                • Amount: %s
                
                Please log in to your CampusWorks account to view the full task details and submit your UPI ID to receive payment.
                
                Best regards,
                CampusWorks Team
                """, taskOwnerEmail, taskTitle, deadlineFormatted, amountFormatted);
            
            message.setText(emailContent);
            
            mailSender.send(message);
            log.info("✅ Task assignment email sent successfully to bidder: {}", bidderEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send task assignment email to bidder: {}. Error: {}", 
                    bidderEmail, e.getMessage(), e);
        }
    }
    
    /**
     * Send email to task owner when task is assigned to a bidder
     */
    public void sendTaskAssignmentEmailToOwner(String taskOwnerEmail, String taskTitle, 
                                             String bidderEmail, BigDecimal amount, 
                                             String bidDetails) {
        try {
            log.info("📧 Sending task assignment email to task owner: {}", taskOwnerEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(taskOwnerEmail);
            message.setSubject("📋 Task Assigned - " + taskTitle);
            
            String amountFormatted = "₹" + amount.toString();
            
            String emailContent = String.format("""
                Dear Task Owner,
                
                Your task '%s' has been assigned to %s.
                
                Assignment Details:
                • Bidding Amount: %s
                • Bidder Email: %s
                • Bid Details: %s
                
                Please log in to your CampusWorks account to view the full details and wait for the bidder to submit their UPI ID for payment.
                
                Best regards,
                CampusWorks Team
                """, taskTitle, bidderEmail, amountFormatted, bidderEmail, bidDetails);
            
            message.setText(emailContent);
            
            mailSender.send(message);
            log.info("✅ Task assignment email sent successfully to task owner: {}", taskOwnerEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send task assignment email to task owner: {}. Error: {}", 
                    taskOwnerEmail, e.getMessage(), e);
        }
    }
    
    /**
     * Send email to task owner when bidder submits UPI ID
     */
    public void sendUpiSubmissionEmailToOwner(String taskOwnerEmail, String taskTitle, 
                                            String bidderEmail, String upiId) {
        try {
            log.info("📧 Sending UPI submission email to task owner: {}", taskOwnerEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(taskOwnerEmail);
            message.setSubject("💳 UPI ID Submitted - " + taskTitle);
            
            String emailContent = String.format("""
                Dear Task Owner,
                
                Your task bidder %s has sent UPI ID %s for the task '%s'.
                
                Please check and make payment to complete the transaction.
                
                Next Steps:
                1. Log in to your CampusWorks account
                2. View the UPI ID details
                3. Make payment to the provided UPI ID
                4. Accept the work once completed
                
                Best regards,
                CampusWorks Team
                """, bidderEmail, upiId, taskTitle);
            
            message.setText(emailContent);
            
            mailSender.send(message);
            log.info("✅ UPI submission email sent successfully to task owner: {}", taskOwnerEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send UPI submission email to task owner: {}. Error: {}", 
                    taskOwnerEmail, e.getMessage(), e);
        }
    }
    
    /**
     * Send email to bidder when task owner accepts work
     */
    public void sendWorkAcceptanceEmailToBidder(String bidderEmail, String taskTitle, 
                                              String taskOwnerEmail) {
        try {
            log.info("📧 Sending work acceptance email to bidder: {}", bidderEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(bidderEmail);
            message.setSubject("✅ Work Accepted - " + taskTitle);
            
            String emailContent = String.format("""
                Dear Bidder,
                
                Your work for task '%s' has been accepted by %s.
                
                🎉 The deal is now completed!
                
                You should receive your payment shortly. Thank you for your excellent work on CampusWorks.
                
                Best regards,
                CampusWorks Team
                """, taskTitle, taskOwnerEmail);
            
            message.setText(emailContent);
            
            mailSender.send(message);
            log.info("✅ Work acceptance email sent successfully to bidder: {}", bidderEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send work acceptance email to bidder: {}. Error: {}", 
                    bidderEmail, e.getMessage(), e);
        }
    }
    
    /**
     * Send generic email notification
     */
    public void sendEmail(String to, String subject, String content) {
        try {
            log.info("📧 Sending email to: {} with subject: {}", to, subject);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}. Error: {}", to, e.getMessage(), e);
        }
    }
}
