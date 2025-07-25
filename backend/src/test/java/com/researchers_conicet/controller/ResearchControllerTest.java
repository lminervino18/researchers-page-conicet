// ResearchControllerTest.java
package com.researchers_conicet.controller;

import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import com.researchers_conicet.service.ResearchService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ResearchControllerTest {

    @Mock
    private ResearchService researchService;

    @InjectMocks
    private ResearchController researchController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createResearch_shouldReturnCreatedResearch() {
        ResearchRequestDTO requestDTO = new ResearchRequestDTO();
        requestDTO.setLinks(new HashSet<String>(Arrays.asList("http://example.com")));

        ResearchResponseDTO responseDTO = new ResearchResponseDTO();
        when(researchService.createResearch(requestDTO)).thenReturn(responseDTO);

        ResponseEntity<ResearchResponseDTO> response = researchController.createResearch(requestDTO);

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void createResearch_shouldThrowExceptionWhenNoFileOrLinkProvided() {
        ResearchRequestDTO requestDTO = new ResearchRequestDTO();

        assertThrows(IllegalArgumentException.class, () -> {
            researchController.createResearch(requestDTO);
        });
    }

    @Test
    void updateResearch_shouldReturnUpdatedResearch() {
        Long id = 1L;
        ResearchRequestDTO requestDTO = new ResearchRequestDTO();

        ResearchResponseDTO responseDTO = new ResearchResponseDTO();
        when(researchService.updateResearch(id, requestDTO)).thenReturn(responseDTO);

        ResponseEntity<ResearchResponseDTO> response = researchController.updateResearch(id, requestDTO);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }
}