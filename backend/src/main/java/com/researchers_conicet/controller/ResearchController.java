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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<ResearchResponseDTO> createResearch(
        @RequestBody @Valid ResearchRequestDTO requestDTO) {
        log.info("REST request to create Research");

        if ((requestDTO.getPdfPath() == null || requestDTO.getPdfPath().isEmpty()) &&
            (requestDTO.getLinks() == null || requestDTO.getLinks().isEmpty())) {
            throw new IllegalArgumentException("Either a PDF path or at least one link is required");
        }

        return new ResponseEntity<>(
            researchService.createResearch(requestDTO),
            HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResearchResponseDTO> updateResearch(
        @PathVariable Long id,
        @RequestBody @Valid ResearchRequestDTO requestDTO) {
        log.info("REST request to update Research : {}", id);

        return ResponseEntity.ok(researchService.updateResearch(id, requestDTO));
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
}
