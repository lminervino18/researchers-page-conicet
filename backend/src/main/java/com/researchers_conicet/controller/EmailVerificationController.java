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
import java.util.Optional;

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

    public EmailVerificationController(EmailVerificationService emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }

    @GetMapping("/check")
    public ResponseEntity<EmailVerificationResponseDTO> checkEmailRegistration(
            @RequestParam String email) {
        log.info("Checking email registration: {}", email);
        Optional<EmailVerification> verificationOpt = emailVerificationService.getEmailVerification(email);

        EmailVerificationResponseDTO responseDTO = new EmailVerificationResponseDTO();
        if (verificationOpt.isPresent()) {
            EmailVerification verification = verificationOpt.get();
            responseDTO.setEmail(verification.getEmail());
            responseDTO.setCreatedAt(verification.getCreatedAt());
            responseDTO.setRegistered(true);
            responseDTO.setUsername(verification.getUsername());
        } else {
            responseDTO.setEmail(email);
            responseDTO.setRegistered(false);
            responseDTO.setUsername(null);
            responseDTO.setCreatedAt(null);
        }

        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<EmailVerificationResponseDTO> registerEmail(
            @RequestBody @Valid EmailVerificationRequestDTO requestDTO) {
        log.info("Registering email: {}", requestDTO.getEmail());

        EmailVerification verification = emailVerificationService.registerEmail(requestDTO.getEmail());

        EmailVerificationResponseDTO responseDTO = new EmailVerificationResponseDTO();
        responseDTO.setEmail(verification.getEmail());
        responseDTO.setCreatedAt(verification.getCreatedAt());
        responseDTO.setRegistered(true);
        responseDTO.setUsername(verification.getUsername());

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeEmail(
            @RequestParam String email) {
        log.info("Removing email: {}", email);
        emailVerificationService.removeEmail(email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{email}/update-username")
    public ResponseEntity<Void> updateUserName(
            @PathVariable String email,
            @RequestParam String newUsername) {
        log.info("Updating username for email: {}, new username: {}", email, newUsername);
        emailVerificationService.updateUserName(email, newUsername);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register-multiple")
    public ResponseEntity<List<EmailVerification>> registerMultipleEmails(
            @RequestBody List<String> emails) {
        log.info("Registering multiple emails: {}", emails);
        List<EmailVerification> registeredEmails = emailVerificationService.registerMultipleEmails(emails);
        return ResponseEntity.ok(registeredEmails);
    }

    @DeleteMapping("/remove-multiple")
    public ResponseEntity<Void> removeMultipleEmails(
            @RequestBody List<String> emails) {
        log.info("Removing multiple emails: {}", emails);
        emailVerificationService.removeMultipleEmails(emails);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<String>> getAllRegisteredEmails() {
        List<String> emails = emailVerificationService.getAllRegisteredEmails();
        return emails.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(emails);
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> removeAllEmails() {
        log.info("Removing all registered emails");
        emailVerificationService.removeAllEmails();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countRegisteredEmails() {
        long count = emailVerificationService.countRegisteredEmails();
        log.info("Total registered emails: {}", count);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/check-registration")
    public ResponseEntity<List<EmailVerificationService.EmailRegistrationStatus>>
    checkEmailsRegistration(@RequestBody List<String> emails) {
        log.info("Checking registration status for emails: {}", emails);
        List<EmailVerificationService.EmailRegistrationStatus> statuses =
                emailVerificationService.checkEmailsRegistration(emails);
        return ResponseEntity.ok(statuses);
    }
}
