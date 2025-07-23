package com.researchers_conicet.e2e;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashSet;
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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import com.researchers_conicet.repository.ResearchRepository;
import com.researchers_conicet.utils.RestResponsePage;

import org.testcontainers.junit.jupiter.Container;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class ResearchE2ETest {

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
    private ResearchRepository researchRepository;

    @BeforeAll
    static void setUp() {
        mysql.start();
    }

    @BeforeEach
    void cleanDatabase() {
        researchRepository.deleteAll();
    }

    @AfterAll
    static void tearDown() {
        mysql.stop();
    }

    @Test
    void shouldRetreiveCreatedResearch() throws com.fasterxml.jackson.core.JsonProcessingException {
        // Create a new Research
        ResearchRequestDTO request = new ResearchRequestDTO();
        request.setResearchAbstract("Test Abstract");
        request.setAuthors(new HashSet<String>(Arrays.asList("Author One", "Author Two")));
        request.setLinks(new HashSet<>(Arrays.asList("http://example.com")));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // JSON serialize "research" part
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> jsonPart = new HttpEntity<>(
            new ObjectMapper().writeValueAsString(request), jsonHeaders);
        body.add("research", jsonPart);

        // Set headers for multipart/form-data
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Create the HttpEntity
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<ResearchResponseDTO> response = restTemplate.postForEntity(
            "http://localhost:" + port + "/api/researches",
            entity,
            ResearchResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        
        ResearchResponseDTO responseDto = response.getBody();
        assertThat(responseDto.getResearchAbstract()).isEqualTo(request.getResearchAbstract());
        assertThat(responseDto.getAuthors()).isEqualTo(request.getAuthors());
        assertThat(responseDto.getLinks()).isEqualTo(request.getLinks());
        assertThat(responseDto.getId()).isNotNull();
        assertThat(responseDto.getId()).isInstanceOf(Long.class);
        assertThat(responseDto.getCreatedAt()).isNotNull();
        assertThat(responseDto.getPdfName()).isNull();
        assertThat(responseDto.getPdfSize()).isNull();
        assertThat(responseDto.getPdfPath()).isNull();
        assertThat(responseDto.getMimeType()).isNull();
    }

    @Test
    void shouldUpdateResearch() throws Exception {
        ResearchResponseDTO createdResearch = createNewResearch().getBody();

        // Change the research abstract
        ResearchRequestDTO updateRequest = new ResearchRequestDTO();
        updateRequest.setResearchAbstract("Updated Abstract");
        updateRequest.setAuthors(createdResearch.getAuthors());
        updateRequest.setLinks(createdResearch.getLinks());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        // JSON serialize "research" part
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> jsonPart = new HttpEntity<>(new ObjectMapper().writeValueAsString(updateRequest), jsonHeaders);
        body.add("research", jsonPart);
        
        // Set headers for multipart/form-data
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Create the HttpEntity
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<ResearchResponseDTO> response = restTemplate.exchange(
            "http://localhost:" + port + "/api/researches/" + createdResearch.getId(),
            HttpMethod.PUT,
            entity,
            ResearchResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getResearchAbstract()).isEqualTo("Updated Abstract");
    }

    @Test
    void shouldDeleteResearch() throws JsonProcessingException {
        ResponseEntity<ResearchResponseDTO> createResponse = createNewResearch();
        Long researchId = createResponse.getBody().getId();

        restTemplate.delete("http://localhost:" + port + "/api/researches/" + researchId);

        ResponseEntity<ResearchResponseDTO> fetchResponse = restTemplate.getForEntity(
            "http://localhost:" + port + "/api/researches/" + researchId,
            ResearchResponseDTO.class);

        assertThat(fetchResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldGetAllResearches() throws JsonProcessingException {
        ResearchResponseDTO research1 = createNewResearch().getBody();
        ResearchResponseDTO research2 = createNewResearch(
            "Another abstract",
            new HashSet<String>(Arrays.asList("Author 1")),
            new HashSet<String>(Arrays.asList("http://another-example.com"))
            ).getBody();
        ResponseEntity<RestResponsePage<ResearchResponseDTO>> response = restTemplate.exchange(
            "http://localhost:" + port + "/api/researches?page=0&size=10&sort=createdAt&direction=DESC",
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<RestResponsePage<ResearchResponseDTO>>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        List<ResearchResponseDTO> researches = response.getBody().getContent();
        assertThat(researches.size()).isEqualTo(2);
        
        Boolean[] matches = {false, false};
        for (ResearchResponseDTO research: researches) {
            if (research.getId().equals(research1.getId())) {
                matches[0] = true;
            } else if (research.getId().equals(research2.getId())) {
                matches[1] = true;
            }
        }
        assertThat(matches).containsExactly(true, true);
    }

    @Test
    void shouldSearchByAbstract() throws JsonProcessingException {
        createNewResearch(); // Has 'Test' in abstract
        // Should not be retrieved
        createNewResearch("Another abstract", null, null);
        createNewResearch("Another abstract with test", null, null);

        String query = "Test";
        
        ResponseEntity<ResearchResponseDTO[]> response = restTemplate.getForEntity(
        "http://localhost:" + port + "/api/researches/search/abstract?query=" + query,
        ResearchResponseDTO[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();

        ResearchResponseDTO[] researches = response.getBody();
        assertThat(researches.length).isEqualTo(2);
        for (ResearchResponseDTO dto : researches) {
            assertThat(dto.getResearchAbstract().toLowerCase()).contains(query.toLowerCase());
        }
    }

    @Test
    void shouldSearchByAuthor() throws JsonProcessingException {
        createNewResearch(null , new HashSet<String>(Arrays.asList("Albert", "Alfredo")), null);
        createNewResearch(null, new HashSet<String>(Arrays.asList("Albert")), null);
        createNewResearch(null, new HashSet<String>(Arrays.asList("Alfredo")), null);

        String query = "Albert";
        
        ResponseEntity<ResearchResponseDTO[]> response = restTemplate.getForEntity(
        "http://localhost:" + port + "/api/researches/search/author?query=" + query,
        ResearchResponseDTO[].class);
            
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();

        ResearchResponseDTO[] researches = response.getBody();
        assertThat(researches.length).isEqualTo(2);
        for (ResearchResponseDTO dto : researches) {
            assertThat(dto.getAuthors().stream().anyMatch(author -> author.toLowerCase().contains(query.toLowerCase()))).isTrue();
        }
    }

    @Test
    void shouldSearchEverywhere() throws JsonProcessingException {
        createNewResearch();
        ResponseEntity<List<ResearchResponseDTO>> response = restTemplate.exchange(
            "http://localhost:" + port + "/api/researches/search?query=Test",
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ResearchResponseDTO>>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
    }

    private ResponseEntity<ResearchResponseDTO> createNewResearch() throws com.fasterxml.jackson.core.JsonProcessingException {
        ResearchRequestDTO request = new ResearchRequestDTO();
        request.setResearchAbstract("Test Abstract");
        request.setAuthors(new HashSet<>(Arrays.asList("Author One", "Author Two")));
        request.setLinks(new HashSet<>(Arrays.asList("http://example.com")));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> jsonPart = new HttpEntity<>(
            new ObjectMapper().writeValueAsString(request), jsonHeaders);
        body.add("research", jsonPart);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        return restTemplate.postForEntity(
            "http://localhost:" + port + "/api/researches",
            entity,
            ResearchResponseDTO.class);
    }

    private ResponseEntity<ResearchResponseDTO> createNewResearch(
        String researchAbstract,
        Set<String> authors,
        Set<String> links
        ) throws com.fasterxml.jackson.core.JsonProcessingException {
        ResearchRequestDTO request = new ResearchRequestDTO();
        request.setResearchAbstract(researchAbstract != null ? researchAbstract : "Test Abstract");
        request.setAuthors(authors != null ? authors : new HashSet<>(Arrays.asList("Author One", "Author Two")));
        request.setLinks(links != null ? links : new HashSet<>(Arrays.asList("http://example.com")));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> jsonPart = new HttpEntity<>(
            new ObjectMapper().writeValueAsString(request), jsonHeaders);
        body.add("research", jsonPart);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        return restTemplate.postForEntity(
            "http://localhost:" + port + "/api/researches",
            entity,
            ResearchResponseDTO.class);
    }
}
