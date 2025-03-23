package com.researchers_conicet.controller;

import com.researchers_conicet.service.AnalogyService;
import com.researchers_conicet.dto.analogy.AnalogyRequestDTO;
import com.researchers_conicet.dto.analogy.AnalogyResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for managing analogy publications.
 * Provides endpoints for CRUD operations, searches, support management, and file handling.
 */
@Slf4j
@RestController
@RequestMapping("/api/analogies")
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
public class AnalogyController {

    private final AnalogyService analogyService;

    public AnalogyController(AnalogyService analogyService) {
        this.analogyService = analogyService;
    }

    /**
     * Creates a new analogy publication
     * 
     * @param requestDTO Analogy data in JSON format
     * @return Created analogy details
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AnalogyResponseDTO> createAnalogy(
            @RequestBody @Valid AnalogyRequestDTO requestDTO) {
        log.info("REST request to create Analogy");
        return new ResponseEntity<>(
            analogyService.createAnalogy(requestDTO),
            HttpStatus.CREATED
        );
    }

    /**
     * Updates an existing analogy publication
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AnalogyResponseDTO> updateAnalogy(
            @PathVariable Long id,
            @RequestBody @Valid AnalogyRequestDTO requestDTO) {
        log.info("REST request to update Analogy : {}", id);

        return ResponseEntity.ok(analogyService.updateAnalogy(id, requestDTO));
    }

    /**
     * Retrieves an specific analogy publication by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AnalogyResponseDTO> getAnalogy(@PathVariable Long id) {
        log.info("REST request to get Analogy : {}", id);
        return ResponseEntity.ok(analogyService.getAnalogy(id));
    }

    /**
     * Retrieves all analogy publications with pagination and sorting
     * 
     * @param page Page number (0-based)
     * @param size Items per page
     * @param sort Sort field
     * @param direction Sort direction (ASC/DESC)
     */
    @GetMapping
    public ResponseEntity<Page<AnalogyResponseDTO>> getAllAnalogies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("REST request to get all Analogies");
        PageRequest pageRequest = PageRequest.of(
            page, 
            size, 
            Sort.Direction.fromString(direction), 
            sort
        );
        return ResponseEntity.ok(analogyService.getAllAnalogies(pageRequest));
    }

    /**
     * Deletes an analogy publication
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalogy(@PathVariable Long id) {
        log.info("REST request to delete Analogy : {}", id);
        analogyService.deleteAnalogy(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches analogies by title content
     */
    @GetMapping("/search/title")
    public ResponseEntity<List<AnalogyResponseDTO>> searchByTitle(
            @RequestParam String query) {
        log.info("REST request to search Analogies by title: {}", query);
        return ResponseEntity.ok(analogyService.searchByTitle(query));
    }

    /**
     * Searches analogies by author name
     */
    @GetMapping("/search/author")
    public ResponseEntity<List<AnalogyResponseDTO>> searchByAuthor(
            @RequestParam String name) {
        log.info("REST request to search Analogies by author: {}", name);
        return ResponseEntity.ok(analogyService.searchByAuthor(name));
    }

    /**
     * Global search across all fields
     */
    @GetMapping("/search")
    public ResponseEntity<List<AnalogyResponseDTO>> searchEverywhere(
            @RequestParam String query) {
        log.info("REST request to search Analogies everywhere: {}", query);
        return ResponseEntity.ok(analogyService.searchEverywhere(query));
    }

    /**
     * Adds support to an analogy
     * 
     * @param analogyId ID of the analogy to support
     * @param email Email of the user giving support
     * @return Updated analogy with support information
     */
    @PostMapping("/{id}/support")
    public ResponseEntity<AnalogyResponseDTO> addSupport(
            @PathVariable("id") Long analogyId,
            @RequestParam String email) {
        log.info("REST request to add support to Analogy: {}", analogyId);
        return ResponseEntity.ok(analogyService.addSupport(analogyId, email));
    }

    /**
     * Removes support from an analogy
     * 
     * @param analogyId ID of the analogy to remove support from
     * @param email Email of the user removing support
     * @return Updated analogy with support information
     */
    @DeleteMapping("/{id}/support")
    public ResponseEntity<AnalogyResponseDTO> removeSupport(
            @PathVariable("id") Long analogyId,
            @RequestParam String email) {
        log.info("REST request to remove support from Analogy: {}", analogyId);
        return ResponseEntity.ok(analogyService.removeSupport(analogyId, email));
    }

    /**
     * Checks if an email is verified
     * 
     * @param email Email to verify
     * @return Boolean indicating if email is verified
     */
    @GetMapping("/verify-email")
    public ResponseEntity<Boolean> verifyEmail(
            @RequestParam String email) {
        log.info("REST request to verify email: {}", email);
        return ResponseEntity.ok(analogyService.isEmailVerified(email));
    }
}