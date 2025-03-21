package com.researchers_conicet.controller;

import com.researchers_conicet.dto.email_verification.EmailVerificationRequestDTO;
import com.researchers_conicet.dto.email_verification.EmailVerificationResponseDTO;
import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/email-verification")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    public EmailVerificationController(EmailVerificationService emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Verifies if an email is registered
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkEmailRegistration(
            @RequestParam String email) {
        log.info("Checking email registration: {}", email);
        return ResponseEntity.ok(emailVerificationService.isEmailRegistered(email));
    }

    /**
     * Registers a new email for verification
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
     * Removes an email from verification
     */
    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeEmail(
            @RequestParam String email) {
        log.info("Removing email: {}", email);
        emailVerificationService.removeEmail(email);
        return ResponseEntity.noContent().build();
    }
}