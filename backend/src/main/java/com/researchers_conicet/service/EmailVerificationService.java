package com.researchers_conicet.service;

import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.repository.EmailVerificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
     * @throws IllegalArgumentException if email is empty
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
     * @throws IllegalArgumentException if email is empty
     * @throws RuntimeException if registration fails
     */
    @Transactional
    public EmailVerification registerEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        // If email already exists, return existing entry
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
     * @throws IllegalArgumentException if email is empty
     * @throws RuntimeException if removal fails
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
     * @throws IllegalArgumentException if email is empty
     */
    public Optional<EmailVerification> getEmailVerification(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return emailVerificationRepository.findByEmail(email);
    }

    /**
     * Registers multiple emails
     *
     * @param emails List of emails to register
     * @return List of registered EmailVerification entities
     * @throws IllegalArgumentException if email list is empty
     */
    @Transactional
    public List<EmailVerification> registerMultipleEmails(List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            throw new IllegalArgumentException("Email list cannot be empty");
        }

        return emails.stream()
            .map(this::registerEmail)
            .collect(Collectors.toList());
    }

    /**
     * Removes multiple emails
     *
     * @param emails List of emails to remove
     * @throws IllegalArgumentException if email list is empty
     * @throws RuntimeException if removal fails
     */
    @Transactional
    public void removeMultipleEmails(List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            throw new IllegalArgumentException("Email list cannot be empty");
        }

        try {
            emails.forEach(this::removeEmail);
            log.info("Removed multiple emails: {}", emails);
        } catch (Exception e) {
            log.error("Error removing multiple emails", e);
            throw new RuntimeException("Failed to remove multiple emails", e);
        }
    }

    /**
     * Retrieves all registered emails
     *
     * @return List of all registered emails
     * @throws RuntimeException if retrieval fails
     */
    public List<String> getAllRegisteredEmails() {
        try {
            List<EmailVerification> verifications = emailVerificationRepository.findAll();
            return verifications.stream()
                .map(EmailVerification::getEmail)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving all registered emails", e);
            throw new RuntimeException("Failed to retrieve registered emails", e);
        }
    }

    /**
     * Removes all registered emails
     *
     * @throws RuntimeException if removal fails
     */
    @Transactional
    public void removeAllEmails() {
        try {
            long count = emailVerificationRepository.count();
            emailVerificationRepository.deleteAll();
            log.info("Removed all {} email registrations", count);
        } catch (Exception e) {
            log.error("Error removing all emails", e);
            throw new RuntimeException("Failed to remove all emails", e);
        }
    }

    /**
     * Counts the total number of registered emails
     *
     * @return Number of registered emails
     */
    public long countRegisteredEmails() {
        return emailVerificationRepository.count();
    }

    /**
     * Checks registration status for a list of emails
     *
     * @param emails List of emails to check
     * @return List of email registration statuses
     * @throws IllegalArgumentException if email list is empty
     */
    public List<EmailRegistrationStatus> checkEmailsRegistration(List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            throw new IllegalArgumentException("Email list cannot be empty");
        }

        return emails.stream()
            .map(email -> new EmailRegistrationStatus(
                email, 
                isEmailRegistered(email)
            ))
            .collect(Collectors.toList());
    }

    /**
     * Represents the registration status of an email
     */
    public static class EmailRegistrationStatus {
        private final String email;
        private final boolean registered;

        public EmailRegistrationStatus(String email, boolean registered) {
            this.email = email;
            this.registered = registered;
        }

        /**
         * Gets the email address
         *
         * @return Email address
         */
        public String getEmail() {
            return email;
        }

        /**
         * Checks if the email is registered
         *
         * @return true if registered, false otherwise
         */
        public boolean isRegistered() {
            return registered;
        }
    }
}