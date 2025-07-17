package com.researchers_conicet.service;

import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.repository.EmailVerificationRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
import static org.junit.Assert.assertThrows;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock
    private EmailVerificationRepository repository;

    @InjectMocks
    private EmailVerificationService service;

    private final String email = "test@example.com";
    private final String username = "TestUser";

    @BeforeEach
    void setup() {
        reset(repository);
    }

    @Test
    void registerEmail_shouldSaveAndReturnNewEmail() {
        when(repository.existsByEmail(email)).thenReturn(false);
        when(repository.save(any(EmailVerification.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        EmailVerification result = service.registerEmail(email);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(email);
        verify(repository).save(any(EmailVerification.class));
        assertThrows(IllegalArgumentException.class, () -> service.registerEmail(""));
    }

    @Test
    void registerEmail_shouldReturnExistingIfAlreadyRegistered() {
        EmailVerification existing = new EmailVerification();
        existing.setEmail(email);
        when(repository.existsByEmail(email)).thenReturn(true);
        when(repository.findByEmail(email)).thenReturn(Optional.of(existing));

        EmailVerification result = service.registerEmail(email);

        assertThat(result).isEqualTo(existing);
        verify(repository, never()).save(any());
    }

    @Test
    void removeEmail_shouldDeleteIfExists() {
        when(repository.existsByEmail(email)).thenReturn(true);
        doNothing().when(repository).deleteByEmail(email);

        service.removeEmail(email);

        verify(repository).deleteByEmail(email);
    }

    @Test
    void removeEmail_shouldDoNothingIfNotExists() {
        when(repository.existsByEmail(email)).thenReturn(false);

        service.removeEmail(email);

        verify(repository, never()).deleteByEmail(email);
    }

    @Test
    void updateUserName_shouldUpdateUsernameIfExists() {
        EmailVerification entity = new EmailVerification();
        entity.setEmail(email);
        when(repository.findByEmail(email)).thenReturn(Optional.of(entity));
        when(repository.save(entity)).thenReturn(entity);

        service.updateUserName(email, username);

        assertThat(entity.getUsername()).isEqualTo(username);
        verify(repository).save(entity);
    }

    @Test
    void updateUserName_shouldThrowIfEmailNotFound() {
        when(repository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateUserName(email, username))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Email " + email + " was not found");
    }

    @Test
    void registerMultipleEmails_shouldRegisterEach() {
        List<String> emails = Arrays.asList("a@example.com", "b@example.com");
        when(repository.existsByEmail(anyString())).thenReturn(false);
        when(repository.save(any(EmailVerification.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        List<EmailVerification> results = service.registerMultipleEmails(emails);

        assertThat(results).hasSize(2);
        verify(repository, times(2)).save(any(EmailVerification.class));
    }

    @Test
    void removeMultipleEmails_shouldCallRemoveForEach() {
        List<String> emails = Arrays.asList("a@example.com", "b@example.com");

        when(repository.existsByEmail(anyString())).thenReturn(true);

        service.removeMultipleEmails(emails);

        verify(repository, times(2)).deleteByEmail(anyString());

        assertThrows(IllegalArgumentException.class, () -> service.removeMultipleEmails(Arrays.asList()));
    }

    @Test
    void checkEmailsRegistration_shouldReturnCorrectStatuses() {
        List<String> emails = Arrays.asList("a@example.com", "b@example.com");

        when(repository.existsByEmail("a@example.com")).thenReturn(true);
        when(repository.existsByEmail("b@example.com")).thenReturn(false);

        List<EmailVerificationService.EmailRegistrationStatus> result = service.checkEmailsRegistration(emails);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getEmail()).isEqualTo("a@example.com");
        assertThat(result.get(0).isRegistered()).isTrue();
        assertThat(result.get(1).isRegistered()).isFalse();
    }
}
