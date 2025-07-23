package com.researchers_conicet.controller;

import com.researchers_conicet.service.ResearchService;
import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import com.researchers_conicet.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.core.io.InputStreamResource;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;

/**
 * REST Controller for managing research papers.
 * Provides endpoints for CRUD operations, searches, and file handling.
 */
@Slf4j
@RestController
@RequestMapping("/api/researches")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:5174"},
    allowedHeaders = "*",
    exposedHeaders = {
        HttpHeaders.CONTENT_DISPOSITION,
        HttpHeaders.CONTENT_TYPE,
        HttpHeaders.CONTENT_LENGTH,
        HttpHeaders.CACHE_CONTROL
    }
)
public class ResearchController {

    private final ResearchService researchService;
    private final FileStorageService fileStorageService;

    public ResearchController(ResearchService researchService,
                            FileStorageService fileStorageService) {
        this.researchService = researchService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Creates a new research paper with PDF file
     * 
     * @param requestDTO Research data in JSON format
     * @param file PDF file
     * @return Created research details
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearchResponseDTO> createResearch(
        @RequestPart("research") @Valid ResearchRequestDTO requestDTO,
        @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("REST request to create Research");
        
        // Validar que haya al menos un PDF o un link
        if ((file == null || file.isEmpty()) && 
            (requestDTO.getLinks() == null || requestDTO.getLinks().isEmpty())) {
                log.error("Invalid request: either a PDF file or at least one link is required");
                throw new IllegalArgumentException("Either a PDF file or at least one link is required");
        }
        
        // Solo validamos el PDF si se proporciona uno
        if (file != null && !file.isEmpty()) {
            validatePdfFile(file);
        }
        
        return new ResponseEntity<>(
            researchService.createResearch(requestDTO, file),
            HttpStatus.CREATED
        );
    }

    /**
     * Updates an existing research paper
     * PDF file update is optional
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearchResponseDTO> updateResearch(
            @PathVariable Long id,
            @RequestPart("research") @Valid ResearchRequestDTO requestDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("REST request to update Research : {}", id);
        
        if (file != null && !file.isEmpty()) {
            validatePdfFile(file);
        }

        return ResponseEntity.ok(researchService.updateResearch(id, requestDTO, file));
    }

    /**
     * Retrieves a specific research paper by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResearchResponseDTO> getResearch(@PathVariable Long id) {
        log.info("REST request to get Research : {}", id);
        return ResponseEntity.ok(researchService.getResearch(id));
    }

    /**
     * Retrieves all research papers with pagination and sorting
     * 
     * @param page Page number (0-based)
     * @param size Items per page
     * @param sort Sort field
     * @param direction Sort direction (ASC/DESC)
     */
    @GetMapping
    public ResponseEntity<Page<ResearchResponseDTO>> getAllResearches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("REST request to get all Researches");
        PageRequest pageRequest = PageRequest.of(
            page, 
            size, 
            Sort.Direction.fromString(direction), 
            sort
        );
        return ResponseEntity.ok(researchService.getAllResearches(pageRequest));
    }

    /**
     * Deletes a research paper and its associated PDF
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResearch(@PathVariable Long id) {
        log.info("REST request to delete Research : {}", id);
        researchService.deleteResearch(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches researches by abstract content
     */
    @GetMapping("/search/abstract")
    public ResponseEntity<List<ResearchResponseDTO>> searchByAbstract(
            @RequestParam String query) {
        log.info("REST request to search Researches by abstract: {}", query);
        return ResponseEntity.ok(researchService.searchByAbstract(query));
    }

    /**
     * Searches researches by author name
     */
    @GetMapping("/search/author")
    public ResponseEntity<List<ResearchResponseDTO>> searchByAuthor(
            @RequestParam String query) {
        log.info("REST request to search Researches by author: {}", query);
        return ResponseEntity.ok(researchService.searchByAuthor(query));
    }

    /**
     * Global search across all fields
     */
    @GetMapping("/search")
    public ResponseEntity<List<ResearchResponseDTO>> searchEverywhere(
            @RequestParam String query) {
        log.info("REST request to search Researches everywhere: {}", query);
        return ResponseEntity.ok(researchService.searchEverywhere(query));
    }

    /**
     * Downloads a PDF file
     * Returns the file as a downloadable attachment
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<InputStreamResource> downloadPdf(@PathVariable Long id) {
        try {
            ResearchResponseDTO research = researchService.getResearch(id);
            if (research.getPdfName() == null) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = fileStorageService.loadFileAsResource(research.getPdfName());
            if (!resource.exists()) {
                log.error("PDF file not found for research: {}", id);
                return ResponseEntity.notFound().build();
            }

            InputStreamResource inputStreamResource = new InputStreamResource(resource.getInputStream());

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + research.getPdfName() + "\"");
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.add(HttpHeaders.PRAGMA, "no-cache");
            headers.add(HttpHeaders.EXPIRES, "0");

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(resource.contentLength())
                .contentType(MediaType.APPLICATION_PDF)
                .body(inputStreamResource);
        } catch (IOException e) {
            log.error("Error downloading PDF for research: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Views a PDF file in the browser
     * Returns the file for inline display
     */
    @GetMapping("/view/{id}")
    public ResponseEntity<InputStreamResource> viewPdf(@PathVariable Long id) {
        try {
            ResearchResponseDTO research = researchService.getResearch(id);
            if (research.getPdfName() == null) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = fileStorageService.loadFileAsResource(research.getPdfName());
            if (!resource.exists()) {
                log.error("PDF file not found for research: {}", id);
                return ResponseEntity.notFound().build();
            }

            InputStreamResource inputStreamResource = new InputStreamResource(resource.getInputStream());

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + research.getPdfName() + "\"");
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.add(HttpHeaders.PRAGMA, "no-cache");
            headers.add(HttpHeaders.EXPIRES, "0");
            headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "*");

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(resource.contentLength())
                .contentType(MediaType.APPLICATION_PDF)
                .body(inputStreamResource);
        } catch (IOException e) {
            log.error("Error viewing PDF for research: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validates if a file is a valid PDF
     */
    private void validatePdfFile(MultipartFile file) {
        // Ya no validamos si es null o está vacío aquí
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals(MediaType.APPLICATION_PDF_VALUE)) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }
}