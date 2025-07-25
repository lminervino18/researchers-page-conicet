package com.researchers_conicet.e2e;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.researchers_conicet.dto.email_verification.EmailVerificationRequestDTO;
import com.researchers_conicet.dto.email_verification.EmailVerificationResponseDTO;
import com.researchers_conicet.entity.EmailVerification;
import com.researchers_conicet.repository.EmailVerificationRepository;
import com.researchers_conicet.service.EmailVerificationService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class EmailVerificationE2ETest {
    
    @SuppressWarnings("resource")
    @Container
    // mysql version 8.0 container is too heavy to run, use 5.7.42 instead
    private static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:5.7.42")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true)
            .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(5)));

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        // Si es necesario, configurar más propiedades de Hibernate
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;


    @BeforeAll
    static void setUp() {
        mysql.start();
    }

    @BeforeEach
    void cleanDatabase() {
        emailVerificationRepository.deleteAll();
    }

    @AfterAll
    static void tearDown() {
        mysql.stop();
    }

    private String baseUrl() {
        return "http://localhost:" + port + "/api/email-verification";
    }

    @Test
    void shouldRetreiveRegisteredEmail() {
        String email = "test@example.com";
        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail(email);

        ResponseEntity<EmailVerificationResponseDTO> response = restTemplate.postForEntity(
            baseUrl() + "/register",
            request,
            EmailVerificationResponseDTO.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo(email);
        assertThat(response.getBody().isRegistered()).isTrue();
    }

    @Test
    void shouldRetreiveEmailRegistrationChecking() {
        // register email
        String email = "check@example.com";
        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail(email);
        restTemplate.postForEntity(baseUrl() + "/register", request, EmailVerificationResponseDTO.class);

        // check email verification
        ResponseEntity<EmailVerificationResponseDTO> response = restTemplate.getForEntity(
            baseUrl() + "/check?email=" + email,
            EmailVerificationResponseDTO.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo(email);
        assertThat(response.getBody().isRegistered()).isTrue();
    }

    @Test
    void shouldDeleteEmail() {
        String email = "delete@example.com";
        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail(email);
        restTemplate.postForEntity(baseUrl() + "/register", request, EmailVerificationResponseDTO.class);

        ResponseEntity<Void> response = restTemplate.exchange(
            baseUrl() + "/remove?email=" + email,
            HttpMethod.DELETE,
            null,
            Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(emailVerificationRepository.findByEmail(email)).isEmpty();
    }

    @Test
    void shouldUpdateUsername() {
        String email = "update@example.com";
        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail(email);
        restTemplate.postForEntity(baseUrl() + "/register", request, EmailVerificationResponseDTO.class);

        ResponseEntity<Void> response = restTemplate.exchange(
            baseUrl() + "/" + email + "/update-username?newUsername=newuser",
            HttpMethod.PATCH,
            null,
            Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(emailVerificationRepository.findByEmail(email).get().getUsername()).isEqualTo("newuser");
    }

    @Test
    void shouldRegisterMultipleEmails() {
        List<String> emails = List.of("multi1@example.com", "multi2@example.com");

        HttpEntity<List<String>> request = new HttpEntity<>(emails);
        ResponseEntity<EmailVerification[]> response = restTemplate.postForEntity(
            baseUrl() + "/register-multiple",
            request,
            EmailVerification[].class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void shouldGetAllRegisteredEmails() {
        List<String> emails = List.of("email1@example.com", "email2@example.com");
        restTemplate.postForEntity(baseUrl() + "/register-multiple", new HttpEntity<>(emails), String.class);

        ResponseEntity<String[]> response = restTemplate.getForEntity(baseUrl() + "/all", String[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).containsExactlyInAnyOrder("email1@example.com", "email2@example.com");
    }

    @Test
    void shouldDeleteAllEmails() {
        List<String> emails = List.of("email1@example.com", "email2@example.com");
        restTemplate.postForEntity(baseUrl() + "/register-multiple", new HttpEntity<>(emails), String.class);

        ResponseEntity<Void> response = restTemplate.exchange(
            baseUrl() + "/all",
            HttpMethod.DELETE,
            null,
            Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(emailVerificationRepository.count()).isZero();
    }

    @Test
    void shouldCountRegisteredEmails() {
        List<String> emails = List.of("email1@example.com", "email2@example.com");
        restTemplate.postForEntity(baseUrl() + "/register-multiple", new HttpEntity<>(emails), String.class);

        ResponseEntity<Long> response = restTemplate.getForEntity(baseUrl() + "/count", Long.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(2L);
    }

    @Test
    void shouldRetreiveRegistrationStatusCheckingForMultiple() {
        List<String> emails = List.of("registered1@example.com", "registered2@example.com", "notregistered@example.com");
        restTemplate.postForEntity(baseUrl() + "/register-multiple", new HttpEntity<>(emails.subList(0, 2)), String.class);

        ResponseEntity<List<EmailVerificationService.EmailRegistrationStatus>> response = restTemplate.exchange(
            baseUrl() + "/check-registration",
            HttpMethod.POST,
            new HttpEntity<>(emails),
            new ParameterizedTypeReference<List<EmailVerificationService.EmailRegistrationStatus>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();

        List<EmailVerificationService.EmailRegistrationStatus> statuses = response.getBody();
        assertThat(statuses).hasSize(3);
        for (EmailVerificationService.EmailRegistrationStatus status : statuses) {
            if (status.getEmail().equals("registered1@example.com") || status.getEmail().equals("registered2@example.com")) {
                assertThat(status.isRegistered()).isTrue();
            }
            else {
                assertThat(status.isRegistered()).isFalse();
            }
        }
    }
}
