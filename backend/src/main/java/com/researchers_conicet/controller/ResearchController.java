package com.researchers_conicet.controller;

import com.researchers_conicet.service.ResearchService;
import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;

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

    public ResearchController(ResearchService researchService) {
        this.researchService = researchService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResearchResponseDTO> createResearch(
        @RequestPart("research") @Valid ResearchRequestDTO requestDTO,
        @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("REST request to create Research");

        if ((file == null || file.isEmpty()) &&
            (requestDTO.getLinks() == null || requestDTO.getLinks().isEmpty())) {
            throw new IllegalArgumentException("Either a PDF file or at least one link is required");
        }

        if (file != null && !file.isEmpty()) {
            validatePdfFile(file);
        }

        return new ResponseEntity<>(
            researchService.createResearch(requestDTO, file),
            HttpStatus.CREATED
        );
    }

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

    @GetMapping("/{id}")
    public ResponseEntity<ResearchResponseDTO> getResearch(@PathVariable Long id) {
        log.info("REST request to get Research : {}", id);
        return ResponseEntity.ok(researchService.getResearch(id));
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResearch(@PathVariable Long id) {
        log.info("REST request to delete Research : {}", id);
        researchService.deleteResearch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/abstract")
    public ResponseEntity<List<ResearchResponseDTO>> searchByAbstract(
        @RequestParam String query) {
        log.info("REST request to search Researches by abstract: {}", query);
        return ResponseEntity.ok(researchService.searchByAbstract(query));
    }

    @GetMapping("/search/author")
    public ResponseEntity<List<ResearchResponseDTO>> searchByAuthor(
        @RequestParam String name) {
        log.info("REST request to search Researches by author: {}", name);
        return ResponseEntity.ok(researchService.searchByAuthor(name));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResearchResponseDTO>> searchEverywhere(
        @RequestParam String query) {
        log.info("REST request to search Researches everywhere: {}", query);
        return ResponseEntity.ok(researchService.searchEverywhere(query));
    }

    private void validatePdfFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals(MediaType.APPLICATION_PDF_VALUE)) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }
}
