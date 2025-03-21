package com.researchers_conicet.repository;

import com.researchers_conicet.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    /**
     * Checks if an email exists in the verification table
     *
     * @param email The email to check
     * @return true if the email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Finds an email verification entry by email
     *
     * @param email The email to search
     * @return Optional of EmailVerification if found
     */
    Optional<EmailVerification> findByEmail(String email);

    /**
     * Deletes an email verification entry by email
     *
     * @param email The email to delete
     */
    void deleteByEmail(String email);

    /**
     * Counts the number of entries for a specific email
     *
     * @param email The email to count
     * @return Number of entries for the email
     */
    long countByEmail(String email);
}