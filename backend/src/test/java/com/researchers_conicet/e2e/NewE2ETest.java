package com.researchers_conicet.e2e;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.time.Duration;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.AfterAll;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.DynamicPropertyRegistry;

import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import com.researchers_conicet.dto.news.NewsRequestDTO;
import com.researchers_conicet.dto.news.NewsResponseDTO;
import com.researchers_conicet.dto.media_link.MediaLinkDTO;
import com.researchers_conicet.utils.RestResponsePage;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class NewE2ETest {

    @Container
    private static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:5.7.42")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test")
        .withReuse(true)
        .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofMinutes(5)));

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @BeforeAll
    static void beforeAll() {
        mysql.start();
    }

    @AfterAll
    static void afterAll() {
        mysql.stop();
    }

    private String baseUrl() {
        return "http://localhost:" + port + "/api/news";
    }

    private NewsRequestDTO sampleRequest(String suffix) {
        NewsRequestDTO dto = new NewsRequestDTO();
        dto.setTitle("Title" + suffix);
        dto.setContent("Content" + suffix);
        dto.setAuthors(Set.of("Author A"));
        dto.setLinks(Set.of("http://link.com"));
        MediaLinkDTO ml = new MediaLinkDTO();
        ml.setUrl("http://media.com");
        ml.setMediaType("image");
        dto.setMediaLinks(Set.of(ml));
        dto.setPreviewImage("http://media.com");
        return dto;
    }

    @Test
    void e2e_CRUD_and_search_and_pagination() {
        // CREATE
        var req = sampleRequest("1");
        ResponseEntity<NewsResponseDTO> createResp =
            restTemplate.postForEntity(baseUrl(), req, NewsResponseDTO.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        NewsResponseDTO created = createResp.getBody();
        assertThat(created).isNotNull();
        assertThat(created.getPreviewImage()).isEqualTo(req.getPreviewImage());

        Long id = created.getId();

        // GET
        ResponseEntity<NewsResponseDTO> getResp =
            restTemplate.getForEntity(baseUrl() + "/" + id, NewsResponseDTO.class);
        assertThat(getResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        NewsResponseDTO fetched = getResp.getBody();
        assertThat(fetched.getCreatedAt()).isCloseTo(created.getCreatedAt(), within(Duration.ofSeconds(1)));

        // UPDATE
        var update = sampleRequest("Updated");
        HttpEntity<NewsRequestDTO> reqUpdate = new HttpEntity<>(update, createJsonHeaders());
        ResponseEntity<NewsResponseDTO> updateResp =
            restTemplate.exchange(baseUrl() + "/" + id, HttpMethod.PUT, reqUpdate, NewsResponseDTO.class);
        assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        NewsResponseDTO updated = updateResp.getBody();
        assertThat(updated.getTitle()).isEqualTo("TitleUpdated");

        // PAGINATION
        restTemplate.postForEntity(baseUrl(), sampleRequest("2"), NewsResponseDTO.class);
        ResponseEntity<RestResponsePage<NewsResponseDTO>> pageResp =
            restTemplate.exchange(baseUrl() + "?page=0&size=10&sort=createdAt&direction=DESC", HttpMethod.GET, null,
                new ParameterizedTypeReference<RestResponsePage<NewsResponseDTO>>() {});
        assertThat(pageResp.getBody().getContent()).hasSize(2);

        // GLOBAL SEARCH
        ResponseEntity<RestResponsePage<NewsResponseDTO>> searchResp =
            restTemplate.exchange(baseUrl() + "?page=0&size=10&sort=createdAt&direction=DESC&query=Updated",
                HttpMethod.GET, null,
                new ParameterizedTypeReference<RestResponsePage<NewsResponseDTO>>() {});
        assertThat(searchResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(searchResp.getBody().getContent())
            .anySatisfy(dto -> assertThat(dto.getTitle()).contains("Updated"));

        // DELETE
        restTemplate.delete(baseUrl() + "/" + id);
        ResponseEntity<String> afterDel = restTemplate.getForEntity(baseUrl() + "/" + id, String.class);
        assertThat(afterDel.getStatusCode()).satisfiesAnyOf(
            s -> assertThat(s).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR),
            s -> assertThat(s).isEqualTo(HttpStatus.NOT_FOUND)
        );
    }

    private HttpHeaders createJsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
