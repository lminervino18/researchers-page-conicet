// ResearchControllerTest.java
package com.researchers_conicet.controller;

import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import com.researchers_conicet.service.FileStorageService;
import com.researchers_conicet.service.ResearchService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ResearchControllerTest {

    @Mock
    private ResearchService researchService;

    @Mock
    private FileStorageService fileStorageService;

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
        MultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[]{});

        ResearchResponseDTO responseDTO = new ResearchResponseDTO();
        when(researchService.createResearch(requestDTO, file)).thenReturn(responseDTO);

        ResponseEntity<ResearchResponseDTO> response = researchController.createResearch(requestDTO, file);

        assertEquals(201, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void createResearch_shouldThrowExceptionWhenNoFileOrLinkProvided() {
        ResearchRequestDTO requestDTO = new ResearchRequestDTO();

        assertThrows(IllegalArgumentException.class, () -> {
            researchController.createResearch(requestDTO, null);
        });
    }

    @Test
    void updateResearch_shouldReturnUpdatedResearch() {
        Long id = 1L;
        ResearchRequestDTO requestDTO = new ResearchRequestDTO();
        MultipartFile file = null;

        ResearchResponseDTO responseDTO = new ResearchResponseDTO();
        when(researchService.updateResearch(id, requestDTO, file)).thenReturn(responseDTO);

        ResponseEntity<ResearchResponseDTO> response = researchController.updateResearch(id, requestDTO, file);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void downloadPdf_shouldReturnPdf() throws IOException {
        Long id = 1L;
        ResearchResponseDTO researchResponseDTO = new ResearchResponseDTO();
        researchResponseDTO.setPdfName("test.pdf");

        Resource resource = mock(Resource.class);
        when(researchService.getResearch(id)).thenReturn(researchResponseDTO);
        when(fileStorageService.loadFileAsResource("test.pdf")).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[]{}));
        when(resource.contentLength()).thenReturn(10L);

        ResponseEntity<InputStreamResource> response = researchController.downloadPdf(id);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void downloadPdf_shouldReturnNotFoundWhenPdfNotExists() {
        Long id = 1L;
        ResearchResponseDTO researchResponseDTO = new ResearchResponseDTO();

        when(researchService.getResearch(id)).thenReturn(researchResponseDTO);

        ResponseEntity<InputStreamResource> response = researchController.downloadPdf(id);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void viewPdf_shouldReturnPdfInline() throws IOException {
        Long id = 1L;
        ResearchResponseDTO researchResponseDTO = new ResearchResponseDTO();
        researchResponseDTO.setPdfName("test.pdf");

        Resource resource = mock(Resource.class);
        when(researchService.getResearch(id)).thenReturn(researchResponseDTO);
        when(fileStorageService.loadFileAsResource("test.pdf")).thenReturn(resource);
        when(resource.exists()).thenReturn(true);
        when(resource.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[]{}));
        when(resource.contentLength()).thenReturn(10L);

        ResponseEntity<InputStreamResource> response = researchController.viewPdf(id);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void viewPdf_shouldReturnNotFoundWhenPdfNotExists() {
        Long id = 1L;
        ResearchResponseDTO researchResponseDTO = new ResearchResponseDTO();

        when(researchService.getResearch(id)).thenReturn(researchResponseDTO);

        ResponseEntity<InputStreamResource> response = researchController.viewPdf(id);

        assertEquals(404, response.getStatusCode().value());
    }
}