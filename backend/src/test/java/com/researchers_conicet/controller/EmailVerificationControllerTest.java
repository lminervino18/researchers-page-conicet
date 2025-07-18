package com.researchers_conicet.controller;

import com.researchers_conicet.dto.email_verification.EmailVerificationRequestDTO;
import com.researchers_conicet.dto.email_verification.EmailVerificationResponseDTO;
import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.service.EmailVerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailVerificationControllerTest {

    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private EmailVerificationController emailVerificationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void checkEmailRegistration_shouldReturnPossitiveEmailVerificationResponse() {
        String email = "test@example.com";
        EmailVerification emailVerification = new EmailVerification();
        emailVerification.setEmail(email);
        emailVerification.setUsername("testuser");

        when(emailVerificationService.getEmailVerification(email)).thenReturn(Optional.of(emailVerification));

        ResponseEntity<EmailVerificationResponseDTO> response = emailVerificationController.checkEmailRegistration(email);
        EmailVerificationResponseDTO responseBody = response.getBody();

        assertNotNull(responseBody);
        assertTrue(responseBody.isRegistered());
        assertEquals(email, responseBody.getEmail());
        assertEquals("testuser", responseBody.getUsername());
    }

    @Test
    void checkEmailRegistration_shouldReturnNotRegisteredEmailVerificationResponse() {
        String email = "notregistered@example.com";

        when(emailVerificationService.getEmailVerification(email)).thenReturn(Optional.empty());

        ResponseEntity<EmailVerificationResponseDTO> response = emailVerificationController.checkEmailRegistration(email);
        EmailVerificationResponseDTO responseBody = response.getBody();

        assertNotNull(responseBody);
        assertFalse(responseBody.isRegistered());
        assertEquals(email, responseBody.getEmail());
        assertNull(responseBody.getUsername());
        assertNull(responseBody.getCreatedAt());
    }

    @Test
    void registerEmail_shouldReturnEmailVerificationResponse() {
        String email = "test@example.com";
        EmailVerificationRequestDTO requestDTO = new EmailVerificationRequestDTO();
        requestDTO.setEmail(email);

        EmailVerification emailVerification = new EmailVerification();
        emailVerification.setEmail(email);
        emailVerification.setUsername("testuser");

        when(emailVerificationService.registerEmail(email)).thenReturn(emailVerification);

        ResponseEntity<EmailVerificationResponseDTO> response = emailVerificationController.registerEmail(requestDTO);
        EmailVerificationResponseDTO responseBody = response.getBody();

        assertNotNull(responseBody);
        assertTrue(responseBody.isRegistered());
        assertEquals(email, responseBody.getEmail());
    }

    @Test
    void getAllRegisteredEmails_shouldReturnEmailRegisteredList() {
        List<String> emails = List.of("test1@example.com", "test2@example.com");

        when(emailVerificationService.getAllRegisteredEmails()).thenReturn(emails);

        ResponseEntity<List<String>> response = emailVerificationController.getAllRegisteredEmails();
        List<String> responseBody = response.getBody();

        assertNotNull(responseBody);
        assertEquals(2, responseBody.size());
        assertEquals(emails, responseBody);
    }
}