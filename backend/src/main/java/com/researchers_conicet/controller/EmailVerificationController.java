package com.researchers_conicet.controller;

import com.researchers_conicet.dto.email_verification.EmailVerificationRequestDTO;
import com.researchers_conicet.dto.email_verification.EmailVerificationResponseDTO;
import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/email-verification")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:5174"},
    allowedHeaders = "*",
    exposedHeaders = {
        HttpHeaders.CONTENT_DISPOSITION,
        HttpHeaders.CONTENT_TYPE,
        HttpHeaders.CONTENT_LENGTH,
        HttpHeaders.CACHE_CONTROL
    }
)
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    /**
     * Constructor for EmailVerificationController
     *
     * @param emailVerificationService Service for email verification operations
     */
    public EmailVerificationController(EmailVerificationService emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Checks if an email is registered in the system
     *
     * @param email Email address to check
     * @return ResponseEntity with boolean indicating registration status
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkEmailRegistration(
            @RequestParam String email) {
        log.info("Checking email registration: {}", email);
        return ResponseEntity.ok(emailVerificationService.isEmailRegistered(email));
    }

    /**
     * Registers a new email for verification
     *
     * @param requestDTO DTO containing email to register
     * @return ResponseEntity with registered email details
     */
    @PostMapping("/register")
    public ResponseEntity<EmailVerificationResponseDTO> registerEmail(
            @RequestBody @Valid EmailVerificationRequestDTO requestDTO) {
        log.info("Registering email: {}", requestDTO.getEmail());
        
        EmailVerification verification = emailVerificationService.registerEmail(requestDTO.getEmail());
        
        EmailVerificationResponseDTO responseDTO = new EmailVerificationResponseDTO();
        responseDTO.setId(verification.getId());
        responseDTO.setEmail(verification.getEmail());
        responseDTO.setCreatedAt(verification.getCreatedAt());
        responseDTO.setRegistered(true);
        
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * Removes a specific email from verification
     *
     * @param email Email address to remove
     * @return ResponseEntity with no content
     */
    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeEmail(
            @RequestParam String email) {
        log.info("Removing email: {}", email);
        emailVerificationService.removeEmail(email);
        return ResponseEntity.noContent().build();
    }

    /**
     * Registers multiple emails for verification
     *
     * @param emails List of email addresses to register
     * @return ResponseEntity with list of registered email verification entities
     */
    @PostMapping("/register-multiple")
    public ResponseEntity<List<EmailVerification>> registerMultipleEmails(
            @RequestBody List<String> emails) {
        log.info("Registering multiple emails: {}", emails);
        List<EmailVerification> registeredEmails = emailVerificationService.registerMultipleEmails(emails);
        return ResponseEntity.ok(registeredEmails);
    }

    /**
     * Removes multiple emails from verification
     *
     * @param emails List of email addresses to remove
     * @return ResponseEntity with no content
     */
    @DeleteMapping("/remove-multiple")
    public ResponseEntity<Void> removeMultipleEmails(
            @RequestBody List<String> emails) {
        log.info("Removing multiple emails: {}", emails);
        emailVerificationService.removeMultipleEmails(emails);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves all registered emails
     *
     * @return ResponseEntity with list of registered emails
     */
    @GetMapping("/all")
    public ResponseEntity<List<String>> getAllRegisteredEmails() {
        List<String> emails = emailVerificationService.getAllRegisteredEmails();
        return emails.isEmpty() 
            ? ResponseEntity.noContent().build() 
            : ResponseEntity.ok(emails);
    }

    /**
     * Removes all registered emails
     *
     * @return ResponseEntity with no content
     */
    @DeleteMapping("/all")
    public ResponseEntity<Void> removeAllEmails() {
        log.info("Removing all registered emails");
        emailVerificationService.removeAllEmails();
        return ResponseEntity.noContent().build();
    }

    /**
     * Counts the number of registered emails
     *
     * @return ResponseEntity with the count of registered emails
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countRegisteredEmails() {
        long count = emailVerificationService.countRegisteredEmails();
        log.info("Total registered emails: {}", count);
        return ResponseEntity.ok(count);
    }

    /**
     * Checks registration status for multiple emails
     *
     * @param emails List of email addresses to check
     * @return ResponseEntity with registration status for each email
     */
    @PostMapping("/check-registration")
    public ResponseEntity<List<EmailVerificationService.EmailRegistrationStatus>> 
    checkEmailsRegistration(@RequestBody List<String> emails) {
        log.info("Checking registration status for emails: {}", emails);
        List<EmailVerificationService.EmailRegistrationStatus> statuses = 
            emailVerificationService.checkEmailsRegistration(emails);
        return ResponseEntity.ok(statuses);
    }
}