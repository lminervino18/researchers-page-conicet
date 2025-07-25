package com.researchers_conicet.e2e;

import com.researchers_conicet.dto.comment.CommentRequestDTO;
import com.researchers_conicet.dto.comment.CommentResponseDTO;
import com.researchers_conicet.repository.CommentRepository;
import com.researchers_conicet.repository.EmailVerificationRepository;
import com.researchers_conicet.utils.RestResponsePage;
import com.researchers_conicet.repository.AnalogyRepository;
import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.entity.EmailVerification;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class CommentE2ETest {
    
    @SuppressWarnings("resource")
    @Container
    static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:5.7.42")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test")
        .withReuse(true)
        .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(5)));

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
    }

    @LocalServerPort
    int port;
    
    @Autowired
    TestRestTemplate restTemplate;

    @Autowired
    CommentRepository commentRepository;

    @Autowired
    EmailVerificationRepository emailRepo;
    
    @Autowired
    AnalogyRepository analogyRepo;

    static final String EMAIL = "user@example.com";
    static final String USERNAME = "User";

    private String baseUrl() {
        return "http://localhost:" + port + "/api";
    }

    private Long analogyId;

    @BeforeAll
    static void initDatabase() {
        mysql.start();
    }

    @BeforeEach
    void setUp() {
        // Register email
        EmailVerification emailVerification = new EmailVerification();
        emailVerification.setEmail(EMAIL);
        emailVerification.setUsername(USERNAME);
        emailRepo.save(emailVerification);
    
        // Create analogy
        Analogy analogy = new Analogy();
        analogy.setTitle("Test title");
        analogy.setContent("Test content");
        analogy.setAuthors(Set.of("Author 1"));
        analogy.setLinks(Set.of("http://example.com"));
        analogy.setSupportEmails(new HashSet<>());
        analogy.setSupportCount(0);
        analogy = analogyRepo.save(analogy);
        analogyId = analogy.getId();
    }

    @BeforeEach
    void cleanDatabase() {
        commentRepository.deleteAll();
        emailRepo.deleteAll();
    }

    @AfterAll
    static void tearDown() {
        mysql.stop();
    }

    private CommentRequestDTO createRequest(String userName, String content, String email, Long parentId) {
        CommentRequestDTO request = new CommentRequestDTO();
        request.setUserName(userName != null ? userName : USERNAME);
        request.setContent(content != null ? content : "Test Comment");
        request.setEmail(email != null ? email : EMAIL);
        request.setParentId(parentId);
        return request;
    }

    private CommentRequestDTO createRequest() {
        CommentRequestDTO dto = new CommentRequestDTO();
        dto.setUserName(USERNAME);
        dto.setContent("Test Comment");
        dto.setEmail(EMAIL);
        return dto;
    }

    private CommentResponseDTO createComment() {
        var dto = createRequest();
        ResponseEntity<CommentResponseDTO> response = restTemplate.postForEntity(baseUrl() + "/analogies/" + analogyId + "/comments", dto, CommentResponseDTO.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    private CommentResponseDTO createComment(String userName, String content, String email, Long parentId) {
        var dto = createRequest(userName, content, email, parentId);
        ResponseEntity<CommentResponseDTO> response = restTemplate.postForEntity(baseUrl() + "/analogies/" + analogyId + "/comments", dto, CommentResponseDTO.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    @Test
    void shouldRetreiveCreatedComment() {
        CommentRequestDTO request = createRequest();
        ResponseEntity<CommentResponseDTO> response = restTemplate.postForEntity(baseUrl() + "/analogies/" + analogyId + "/comments", request, CommentResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        CommentResponseDTO result = response.getBody();
        
        CommentResponseDTO expected = new CommentResponseDTO();
        expected.setUserName(request.getUserName());
        expected.setContent(request.getContent());
        expected.setEmail(request.getEmail());
        expected.setParentId(request.getParentId());
        expected.setId(result.getId());
        expected.setCreatedAt(result.getCreatedAt());
        expected.setAnalogyId(analogyId);
        expected.setSupportCount(0);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void shouldRetreiveUpdatedComment() {
        CommentResponseDTO createdComment = createComment();
        Long commentId = createdComment.getId();

        CommentRequestDTO updateRequest = createRequest("Updated username", "Updated content", createdComment.getEmail(), createdComment.getParentId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CommentRequestDTO> request = new HttpEntity<>(updateRequest, headers);

        ResponseEntity<CommentResponseDTO> response = restTemplate.exchange(
                baseUrl() + "/analogies/" + analogyId + "/comments/" + commentId,
                HttpMethod.PUT,
                request,
                CommentResponseDTO.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        CommentResponseDTO result = response.getBody();

        CommentResponseDTO expected = new CommentResponseDTO();
        expected.setUserName(updateRequest.getUserName());
        expected.setContent(updateRequest.getContent());
        expected.setId(commentId);
        expected.setEmail(createdComment.getEmail());
        expected.setParentId(createdComment.getParentId());
        expected.setSupportCount(createdComment.getSupportCount());
        expected.setCreatedAt(result.getCreatedAt());
        expected.setAnalogyId(analogyId);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void shouldRetreiveFetchedComment() {
        CommentResponseDTO created = createComment();
        ResponseEntity<CommentResponseDTO> response = restTemplate.getForEntity(baseUrl() + "/comments/" + created.getId(), CommentResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        CommentResponseDTO result = response.getBody();
        created.setCreatedAt(result.getCreatedAt()); // Set createdAt to match the response format
        assertThat(result).isEqualTo(created);
    }

    @Test
    void shouldRetreiveAllComments() {
        createComment("C1", null, null, null);
        createComment("C2", null, null, null);

        ResponseEntity<RestResponsePage<CommentResponseDTO>> response = restTemplate.exchange(
                baseUrl() + "/comments?page=0&size=10&sort=createdAt&direction=DESC",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<RestResponsePage<CommentResponseDTO>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        List<CommentResponseDTO> content = response.getBody().getContent();
        assertThat(content).hasSize(2);

        for (String title : List.of("C1", "C2")) {
            assertThat(content.stream().anyMatch(a -> a.getUserName().equals(title))).isTrue();
        }
    }

    @Test
    void shouldDeleteComment() {
        var created = createComment();

        restTemplate.delete(baseUrl() + "/comments/" + created.getId());

        var response = restTemplate.getForEntity(baseUrl() + "/comments/" + created.getId(), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldRetreiveMatchingComments() {
        // Register email
        EmailVerification emailVerification1 = new EmailVerification();
        emailVerification1.setEmail("mario@gmail.com");
        emailVerification1.setUsername("Mario");
        emailRepo.save(emailVerification1);

        EmailVerification emailVerification2 = new EmailVerification();
        emailVerification2.setEmail("lucas@gmail.com");
        emailVerification2.setUsername("Lucas");
        emailRepo.save(emailVerification2);

        EmailVerification emailVerification3 = new EmailVerification();
        emailVerification3.setEmail("othermario@gmail.com");
        emailVerification3.setUsername("Mario");
        emailRepo.save(emailVerification3);

        // Create comments
        createComment("Mario", "Mario’s comment", "mario@gmail.com", null);
        createComment("Lucas", "Lucas’ first comment", "lucas@gmail.com", null);
        createComment("Mario", "Whatever", "othermario@gmail.com", null);
        createComment("Lucas", "Lucas’ second comment", "lucas@gmail.com", null);

        // search by user name
        String userName = "Mario";
        var userNameResponse = restTemplate.getForEntity(baseUrl() + "/analogies/" + analogyId + "/comments/search?userName=" + userName, CommentResponseDTO[].class);

        assertThat(userNameResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(userNameResponse.getBody()).isNotEmpty();
        assertThat(userNameResponse.getBody()).hasSize(2);
        for (CommentResponseDTO comment : userNameResponse.getBody()) {
            assertThat(comment.getUserName()).isEqualTo(userName);
        }

        // search by email
        String email = "lucas@gmail.com";
        var emailResponse = restTemplate.getForEntity(baseUrl() + "/analogies/" + analogyId + "/comments/search?email=" + email, CommentResponseDTO[].class);

        assertThat(emailResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(emailResponse.getBody()).isNotEmpty();
        assertThat(emailResponse.getBody()).hasSize(2);
        for (CommentResponseDTO comment : emailResponse.getBody()) {
            assertThat(comment.getEmail()).isEqualTo(email);
        }

        // search by content
        String term = "comment";
        var contentResponse = restTemplate.getForEntity(baseUrl() + "/analogies/" + analogyId + "/comments/search?term=" + term, CommentResponseDTO[].class);

        assertThat(contentResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(contentResponse.getBody()).isNotEmpty();
        assertThat(contentResponse.getBody()).hasSize(3);
        for (CommentResponseDTO comment : contentResponse.getBody()) {
            assertThat(comment.getContent()).contains(term);
        }
    }

    @Test
    void shouldRetreiveFetchedCommentsByAnalogy() {
        // Create another analogy
        Analogy analogy = new Analogy();
        analogy.setTitle("Other test title");
        analogy.setContent("Other test content");
        analogy.setAuthors(Set.of("Author 2"));
        analogy.setLinks(Set.of("http://otherexample.com"));
        analogy.setSupportEmails(new HashSet<>());
        analogy.setSupportCount(0);
        analogy = analogyRepo.save(analogy);
        Long otherAnalogyId = analogy.getId();

        // Create comments for the first analogy
        createComment();
        createComment();

        // Create comments for the second analogy
        var dto = createRequest();
        ResponseEntity<CommentResponseDTO> createResponse = restTemplate.postForEntity(baseUrl() + "/analogies/" + otherAnalogyId + "/comments", dto, CommentResponseDTO.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<RestResponsePage<CommentResponseDTO>> response = restTemplate.exchange(
                baseUrl() + "/analogies/" + analogyId + "/comments",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<RestResponsePage<CommentResponseDTO>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        List<CommentResponseDTO> comments = response.getBody().getContent();

        assertThat(comments).hasSize(2);
        for (CommentResponseDTO comment : comments) {
            assertThat(comment.getAnalogyId()).isEqualTo(analogyId);
        }
    }

    @Test
    void shouldAddAndRemoveSupport() {
        var comment = createComment();

        // add support
        var addResp = restTemplate.postForEntity(baseUrl() + "/comments/" + comment.getId() + "/support?email=" + EMAIL, null, CommentResponseDTO.class);
        assertThat(addResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(addResp.getBody().getSupportCount()).isEqualTo(1);

        // has supported
        var hasSupport = restTemplate.getForEntity(baseUrl() + "/comments/" + comment.getId() + "/has-supported?email=" + EMAIL, Boolean.class);
        assertThat(hasSupport.getBody()).isTrue();

        // remove support
        restTemplate.delete(baseUrl() + "/comments/" + comment.getId() + "/support?email=" + EMAIL);
        var afterRemove = restTemplate.getForEntity(baseUrl() + "/comments/" + comment.getId() + "/has-supported?email=" + EMAIL, Boolean.class);
        assertThat(afterRemove.getBody()).isFalse();
    }

    @Test
    void shouldRetreiveSupportCountAndEmails() {
        // Register email
        EmailVerification emailVerification1 = new EmailVerification();
        emailVerification1.setEmail("mario@gmail.com");
        emailVerification1.setUsername("Mario");
        emailRepo.save(emailVerification1);

        CommentResponseDTO comment = createComment();

        // Add supports
        restTemplate.postForEntity(baseUrl() + "/comments/" + comment.getId() + "/support?email=" + EMAIL, null, CommentResponseDTO.class);
        restTemplate.postForEntity(baseUrl() + "/comments/" + comment.getId() + "/support?email=mario@gmail.com", null, CommentResponseDTO.class);

        // Get support count
        ResponseEntity<Integer> countResponse = restTemplate.getForEntity(baseUrl() + "/comments/" + comment.getId() + "/support-count", Integer.class);
        assertThat(countResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(countResponse.getBody()).isEqualTo(2);

        // Get support emails
        ResponseEntity<String[]> emailsResponse = restTemplate.getForEntity(baseUrl() + "/comments/" + comment.getId() + "/support-emails", String[].class);
        assertThat(emailsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(emailsResponse.getBody()).isNotEmpty();
        assertThat(emailsResponse.getBody()).containsExactlyInAnyOrder(EMAIL, "mario@gmail.com");

        ResponseEntity<Long[]> supportedCommentIds = restTemplate.getForEntity(baseUrl() + "/comments/supported?email=" + EMAIL, Long[].class);
        assertThat(supportedCommentIds.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(supportedCommentIds.getBody()).isNotEmpty();
        assertThat(supportedCommentIds.getBody()).contains(comment.getId());
    }
}
