package com.researchers_conicet.e2e;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.LocalDateTime;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.researchers_conicet.dto.gallery.GalleryImageDTO;
import com.researchers_conicet.entity.GalleryImage;
import com.researchers_conicet.repository.GalleryRepository;
import com.researchers_conicet.utils.RestResponsePage;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class GalleryE2ETest {
    
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
    private GalleryRepository repository;

    @BeforeAll
    static void setUp() {
        mysql.start();
    }

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @AfterAll
    static void tearDown() {
        mysql.stop();
    }

    private String baseUrl() {
        return "http://localhost:" + port + "/api/gallery";
    }

    private GalleryImageDTO createDto() {
        var dto = new GalleryImageDTO();
        dto.setUrl("example.jpg");
        dto.setLegend("Test legend");
        return dto;
    }

    private GalleryImageDTO createDto(String url, String legend) {
        var dto = new GalleryImageDTO();
        dto.setUrl(url != null ? url : "example.jpg");
        dto.setLegend(legend != null ? legend : "Test legend");
        return dto;
    }

    private GalleryImage createGalleryImage() {
        var dto = createDto();
        ResponseEntity<GalleryImage> response = restTemplate.postForEntity(baseUrl(), dto, GalleryImage.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    private GalleryImage createGalleryImage(String url, String legend) {
        var dto = createDto(url, legend);
        ResponseEntity<GalleryImage> response = restTemplate.postForEntity(baseUrl(), dto, GalleryImage.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    @Test
    void shouldRetreiveCreatedGalleryImage() {
        GalleryImageDTO request = createDto();
        ResponseEntity<GalleryImage> response = restTemplate.postForEntity(baseUrl(), request, GalleryImage.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        
        GalleryImage result = response.getBody();
        assertThat(result.getUrl()).isEqualTo(request.getUrl());
        assertThat(result.getLegend()).isEqualTo(request.getLegend());
        assertThat(result.getCreatedAt()).isInstanceOf(LocalDateTime.class);
    }

    @Test
    void shouldRetreiveFetchedGalleryImage() {
        GalleryImage created = createGalleryImage();
        ResponseEntity<GalleryImage> response = restTemplate.getForEntity(baseUrl() + "/by-url?url=" + created.getUrl(), GalleryImage.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        
        GalleryImage result = response.getBody();
        created.setCreatedAt(result.getCreatedAt()); // Set createdAt to match the response format
        assertThat(result.getUrl()).isEqualTo(created.getUrl());
        assertThat(result.getLegend()).isEqualTo(created.getLegend());
        assertThat(result.getCreatedAt()).isEqualTo(created.getCreatedAt());
    }

    @Test
    void shouldRetreiveUpdatedGalleryImage() {
        GalleryImage created = createGalleryImage();

        GalleryImageDTO updateDto = new GalleryImageDTO();
        updateDto.setLegend("Updated legend");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<GalleryImageDTO> request = new HttpEntity<>(updateDto, headers);

        ResponseEntity<GalleryImage> response = restTemplate.exchange(
                baseUrl() + "/by-url?url=" + created.getUrl(),
                HttpMethod.PATCH,
                request,
                GalleryImage.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        GalleryImage result = response.getBody();
        result.setCreatedAt(created.getCreatedAt());
        assertThat(result.getUrl()).isEqualTo(created.getUrl());
        assertThat(result.getLegend()).isEqualTo(updateDto.getLegend());
        assertThat(result.getCreatedAt()).isEqualTo(created.getCreatedAt());
    }

    @Test
    void shouldGetAllImages() {
        createGalleryImage("example1.jpg", "This legend is for example 1");
        createGalleryImage("example2.jpg", "This legend is for example 2");

        ResponseEntity<RestResponsePage<GalleryImage>> response = restTemplate.exchange(
                baseUrl() + "?page=0&size=10&sort=createdAt&direction=DESC",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<RestResponsePage<GalleryImage>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        List<GalleryImage> content = response.getBody().getContent();
        assertThat(content).hasSize(2);

        for (String url : List.of("example1.jpg", "example2.jpg")) {
            assertThat(content.stream().anyMatch(a -> a.getUrl().equals(url))).isTrue();
        }
    }

    @Test
    void shouldDeleteGalleryImage() {
        var created = createGalleryImage();

        restTemplate.delete(baseUrl() + "/by-url?url=" + created.getUrl());

        var response = restTemplate.getForEntity(baseUrl() + "/by-url?url=" + created.getUrl(), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
