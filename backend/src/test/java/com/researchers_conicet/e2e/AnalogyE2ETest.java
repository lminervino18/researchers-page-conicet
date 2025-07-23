package com.researchers_conicet.e2e;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.researchers_conicet.dto.analogy.AnalogyRequestDTO;
import com.researchers_conicet.dto.analogy.AnalogyResponseDTO;
import com.researchers_conicet.dto.email_verification.EmailVerificationRequestDTO;
import com.researchers_conicet.dto.email_verification.EmailVerificationResponseDTO;
import com.researchers_conicet.repository.AnalogyRepository;
import com.researchers_conicet.utils.RestResponsePage;

import org.testcontainers.junit.jupiter.Container;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class AnalogyE2ETest {

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
    private AnalogyRepository analogyRepository;

    @BeforeAll
    static void setUp() {
        mysql.start();
    }

    @BeforeEach
    void cleanDatabase() {
        analogyRepository.deleteAll();
    }

    @AfterAll
    static void tearDown() {
        mysql.stop();
    }

    private String baseUrl() {
        return "http://localhost:" + port + "/api/analogies";
    }

    private AnalogyRequestDTO createDto() {
        var dto = new AnalogyRequestDTO();
        dto.setTitle("Test title");
        dto.setAuthors(Set.of("Author 1"));
        dto.setContent("Test Content");
        dto.setLinks(Set.of("http://example.com"));
        dto.setSupportCount(0);
        return dto;
    }

    private AnalogyRequestDTO createDto(String title, String content, Set<String> authors, Set<String> links, Integer supportCount) {
        var dto = new AnalogyRequestDTO();
        dto.setTitle(title != null ? title : "Test title");
        dto.setContent(content != null ? content : "Test content");
        dto.setAuthors(authors != null ? authors : Set.of("Author 1"));
        dto.setLinks(links != null ? links : Set.of("http://example.com"));
        dto.setSupportCount(supportCount != null ? supportCount : 0);
        return dto;
    }

    private AnalogyResponseDTO createAnalogy() {
        var dto = createDto();
        ResponseEntity<AnalogyResponseDTO> response = restTemplate.postForEntity(baseUrl(), dto, AnalogyResponseDTO.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    private AnalogyResponseDTO createAnalogy(String title, String content, Set<String> authors, Set<String> links, Integer supportCount) {
        var dto = createDto(title, content, authors, links, supportCount);
        ResponseEntity<AnalogyResponseDTO> response = restTemplate.postForEntity(baseUrl(), dto, AnalogyResponseDTO.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    @Test
    void shouldRetreiveCreatedAnalogy() {
        AnalogyRequestDTO request = createDto();
        ResponseEntity<AnalogyResponseDTO> response = restTemplate.postForEntity(baseUrl(), request, AnalogyResponseDTO.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        AnalogyResponseDTO result = response.getBody();
        
        AnalogyResponseDTO expected = new AnalogyResponseDTO();
        expected.setTitle(request.getTitle());
        expected.setContent(request.getContent());
        expected.setAuthors(request.getAuthors());
        expected.setLinks(request.getLinks());
        expected.setSupportCount(request.getSupportCount());
        expected.setId(result.getId());
        expected.setCreatedAt(result.getCreatedAt());

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void shouldRetreiveFetchedAnalogy() {
        AnalogyResponseDTO created = createAnalogy();
        ResponseEntity<AnalogyResponseDTO> response = restTemplate.getForEntity(baseUrl() + "/" + created.getId(), AnalogyResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        AnalogyResponseDTO result = response.getBody();
        created.setCreatedAt(result.getCreatedAt()); // Set createdAt to match the response format
        assertThat(result).isEqualTo(created);
    }

    @Test
    void shouldRetreiveUpdatedAnalogy() {
        AnalogyResponseDTO created = createAnalogy();

        AnalogyRequestDTO updateDto = createDto("Updated title", "Updated Content", Set.of("Author 1", "New author"), created.getLinks(), created.getSupportCount());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AnalogyRequestDTO> request = new HttpEntity<>(updateDto, headers);

        ResponseEntity<AnalogyResponseDTO> response = restTemplate.exchange(
                baseUrl() + "/" + created.getId(),
                HttpMethod.PUT,
                request,
                AnalogyResponseDTO.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        AnalogyResponseDTO result = response.getBody();

        AnalogyResponseDTO expected = new AnalogyResponseDTO();
        expected.setId(created.getId());
        expected.setTitle(updateDto.getTitle());
        expected.setContent(updateDto.getContent());
        expected.setAuthors(updateDto.getAuthors());
        expected.setLinks(created.getLinks());
        expected.setSupportCount(created.getSupportCount());
        expected.setCreatedAt(result.getCreatedAt());

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void shouldGetAllAnalogies() {
        createAnalogy("A1", null, null, null, null);
        createAnalogy("A2", null, null, null, null);

        ResponseEntity<RestResponsePage<AnalogyResponseDTO>> response = restTemplate.exchange(
                baseUrl() + "?page=0&size=10&sort=createdAt&direction=DESC",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<RestResponsePage<AnalogyResponseDTO>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        List<AnalogyResponseDTO> content = response.getBody().getContent();
        assertThat(content).hasSize(2);

        for (String title : List.of("A1", "A2")) {
            assertThat(content.stream().anyMatch(a -> a.getTitle().equals(title))).isTrue();
        }
    }

    @Test
    void shouldDeleteAnalogy() {
        var created = createAnalogy();

        restTemplate.delete(baseUrl() + "/" + created.getId());

        var response = restTemplate.getForEntity(baseUrl() + "/" + created.getId(), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldSearchByTitle() {
        createAnalogy("Test analogy", null, null, null, null);
        createAnalogy("Just analogy", null, null, null, null);

        String query = "test";
        var response = restTemplate.getForEntity(baseUrl() + "/search/title?query=" + query, AnalogyResponseDTO[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody()[0].getTitle().toLowerCase()).contains(query);
    }

    @Test
    void shouldSearchByAuthor() {
        createAnalogy(null, null, Set.of("María", "Mario"), null, null);
        createAnalogy(null, null, Set.of("María", "Juan"), null, null);
        createAnalogy(null, null, Set.of("Juan", "Mario"), null, null);

        String authorName = "María";
        var response = restTemplate.getForEntity(baseUrl() + "/search/author?name=" + authorName, AnalogyResponseDTO[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();

        AnalogyResponseDTO[] analogies = response.getBody();

        assertThat(analogies).hasSize(2);
        for (AnalogyResponseDTO analogy : analogies) {
            assertThat(analogy.getAuthors()).contains(authorName);
        }
    }

    @Test
    void shouldSearchEverywhere() {
        createAnalogy("Test analogy", null, Set.of("Author 1"), null, null);
        createAnalogy("Just analogy", null, Set.of("Author 1", "Test"), null, null);
        createAnalogy("Just analogy", null, Set.of("Author 1"), null, null);

        var response = restTemplate.getForEntity(baseUrl() + "/search?query=Test", AnalogyResponseDTO[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();

        AnalogyResponseDTO[] analogies = response.getBody();

        assertThat(analogies).hasSize(2);
        for (AnalogyResponseDTO analogy : response.getBody()) {
            boolean foundInTitle = analogy.getTitle().toLowerCase().contains("test");
            boolean foundInAuthors = analogy.getAuthors().stream()
            .anyMatch(author -> author.equals("Test"));
            assertThat(foundInTitle || foundInAuthors).isTrue();
        }
    }

    @Test
    void shouldAddAndRemoveSupport() {
        var analogy = createAnalogy();
        String email = "test@example.com";
        
        // register email
        EmailVerificationRequestDTO emailDto = new EmailVerificationRequestDTO();
        emailDto.setEmail(email);
        restTemplate.postForEntity("http://localhost:" + port + "/api/email-verification/register", emailDto, EmailVerificationResponseDTO.class);

        // add support
        var addResp = restTemplate.postForEntity(baseUrl() + "/" + analogy.getId() + "/support?email=" + email, null, AnalogyResponseDTO.class);
        assertThat(addResp.getStatusCode()).isEqualTo(HttpStatus.OK);

        // check support emails
        ResponseEntity<Set<String>> emailsResponse = restTemplate.exchange(
                baseUrl() + "/" + analogy.getId() + "/support-emails",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Set<String>>() {}
        );

        assertThat(emailsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(emailsResponse.getBody()).contains(email);

        // has supported
        var hasSupport = restTemplate.getForEntity(baseUrl() + "/" + analogy.getId() + "/has-supported?email=" + email, Boolean.class);
        assertThat(hasSupport.getBody()).isTrue();

        // remove support
        restTemplate.delete(baseUrl() + "/" + analogy.getId() + "/support?email=" + email);
        var afterRemove = restTemplate.getForEntity(baseUrl() + "/" + analogy.getId() + "/has-supported?email=" + email, Boolean.class);
        assertThat(afterRemove.getBody()).isFalse();
    }

    @Test
    void shouldGetSupportCountAndEmails() {
        var analogy = createAnalogy();

        String aEmail = "a@example.com";
        String bEmail = "b@example.com";

        // register emails
        EmailVerificationRequestDTO aEmailDto = new EmailVerificationRequestDTO();
        aEmailDto.setEmail(aEmail);
        restTemplate.postForEntity("http://localhost:" + port + "/api/email-verification/register", aEmailDto, EmailVerificationResponseDTO.class);
        EmailVerificationRequestDTO bEmailDto = new EmailVerificationRequestDTO();
        bEmailDto.setEmail(bEmail);
        restTemplate.postForEntity("http://localhost:" + port + "/api/email-verification/register", bEmailDto, EmailVerificationResponseDTO.class);

        // add supports
        restTemplate.postForEntity(baseUrl() + "/" + analogy.getId() + "/support?email=" + aEmail, null, String.class);
        restTemplate.postForEntity(baseUrl() + "/" + analogy.getId() + "/support?email=" + bEmail, null, String.class);

        // check support count and emails
        var count = restTemplate.getForEntity(baseUrl() + "/" + analogy.getId() + "/support-count", Integer.class);
        assertThat(count.getBody()).isEqualTo(2);

        var emails = restTemplate.getForEntity(baseUrl() + "/" + analogy.getId() + "/support-emails", String[].class);
        assertThat(emails.getBody()).containsExactlyInAnyOrder(aEmail, bEmail);
    }

    @Test
    void shouldVerifyEmail() {
        var response = restTemplate.getForEntity(baseUrl() + "/verify-email?email=notverified@example.com", Boolean.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isFalse();
    }
}
