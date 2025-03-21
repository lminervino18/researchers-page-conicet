package com.researchers_conicet.service;

import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.repository.EmailVerificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;

    public EmailVerificationService(EmailVerificationRepository emailVerificationRepository) {
        this.emailVerificationRepository = emailVerificationRepository;
    }

    /**
     * Verifies if an email is already registered
     *
     * @param email The email to verify
     * @return true if the email is registered, false otherwise
     */
    public boolean isEmailRegistered(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return emailVerificationRepository.existsByEmail(email);
    }

    /**
     * Registers a new email for verification
     *
     * @param email The email to register
     * @return The registered EmailVerification entity
     */
    @Transactional
    public EmailVerification registerEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        // Si el email ya existe, no lo registra de nuevo
        if (isEmailRegistered(email)) {
            log.info("Email already registered: {}", email);
            return emailVerificationRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Unexpected error finding existing email"));
        }

        try {
            EmailVerification verification = new EmailVerification();
            verification.setEmail(email);

            EmailVerification savedVerification = emailVerificationRepository.save(verification);
            log.info("Registered new email: {}", email);
            
            return savedVerification;
        } catch (Exception e) {
            log.error("Error registering email: {}", email, e);
            throw new RuntimeException("Failed to register email", e);
        }
    }

    /**
     * Removes an email from verification
     *
     * @param email The email to remove
     */
    @Transactional
    public void removeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        try {
            if (isEmailRegistered(email)) {
                emailVerificationRepository.deleteByEmail(email);
                log.info("Removed email: {}", email);
            } else {
                log.warn("Attempted to remove non-existent email: {}", email);
            }
        } catch (Exception e) {
            log.error("Error removing email: {}", email, e);
            throw new RuntimeException("Failed to remove email", e);
        }
    }

    /**
     * Retrieves an email verification entry
     *
     * @param email The email to retrieve
     * @return Optional of EmailVerification
     */
    public Optional<EmailVerification> getEmailVerification(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return emailVerificationRepository.findByEmail(email);
    }
}