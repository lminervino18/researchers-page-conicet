package com.researchers_conicet.controller;

import com.researchers_conicet.service.NewService;
import com.researchers_conicet.dto.news.NewsRequestDTO; 
import com.researchers_conicet.dto.news.NewsResponseDTO; 
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
 * REST Controller for managing new article publications.
 * Provides endpoints for CRUD operations and searches.
 */
@Slf4j
@RestController
@RequestMapping("/api/news") 
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
public class NewController {

    private final NewService newService;

    public NewController(NewService newService) {
        this.newService = newService;
    }

    /**
     * Creates a new article publication
     * 
     * @param requestDTO New article data in JSON format
     * @return Created new article details
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NewsResponseDTO> createNew(
            @RequestBody @Valid NewsRequestDTO requestDTO) {
        log.info("REST request to create New article");
        try {
            NewsResponseDTO response = newService.createNew(requestDTO);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception ex) {
            log.error("Error creating news article: ", ex);
            throw new RuntimeException("Failed to create news article", ex);
        }
    }

    /**
     * Updates an existing new article publication
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NewsResponseDTO> updateNew(
            @PathVariable Long id,
            @RequestBody @Valid NewsRequestDTO requestDTO) {
        log.info("REST request to update New article : {}", id);

        try {
            NewsResponseDTO updatedNews = newService.updateNew(id, requestDTO);
            return ResponseEntity.ok(updatedNews);
        } catch (Exception ex) {
            log.error("Error updating news article with ID: {}", id, ex);
            throw new RuntimeException("Failed to update news article", ex);
        }
    }

    /**
     * Retrieves a specific new article publication by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NewsResponseDTO> getNew(@PathVariable Long id) {
        log.info("REST request to get New article : {}", id);
        try {
            NewsResponseDTO news = newService.getNew(id);
            return ResponseEntity.ok(news);
        } catch (Exception ex) {
            log.error("Error retrieving news article with ID: {}", id, ex);
            throw new RuntimeException("Failed to retrieve news article", ex);
        }
    }

    /**
     * Retrieves all new articles with pagination and sorting
     * 
     * @param page Page number (0-based)
     * @param size Items per page
     * @param sort Sort field
     * @param direction Sort direction (ASC/DESC)
     */
    @GetMapping
    public ResponseEntity<Page<NewsResponseDTO>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("REST request to get all New articles");
        PageRequest pageRequest = PageRequest.of(
            page, 
            size, 
            Sort.Direction.fromString(direction), 
            sort
        );
        Page<NewsResponseDTO> newsPage = newService.getAllNews(pageRequest);
        return ResponseEntity.ok(newsPage);
    }

    /**
     * Deletes a new article publication
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNew(@PathVariable Long id) {
        log.info("REST request to delete New article : {}", id);
        try {
            newService.deleteNew(id);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            log.error("Error deleting news article with ID: {}", id, ex);
            throw new RuntimeException("Failed to delete news article", ex);
        }
    }

    /**
     * Searches new articles by title content
     */
    @GetMapping("/search/title")
    public ResponseEntity<List<NewsResponseDTO>> searchByTitle(
            @RequestParam String query) {
        log.info("REST request to search New articles by title: {}", query);
        try {
            List<NewsResponseDTO> result = newService.searchByTitle(query);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error searching news articles by title", ex);
            throw new RuntimeException("Failed to search news articles by title", ex);
        }
    }

    /**
     * Global search across all fields
     */
    @GetMapping("/search")
    public ResponseEntity<List<NewsResponseDTO>> searchEverywhere(
            @RequestParam String query) {
        log.info("REST request to search New articles everywhere: {}", query);
        try {
            List<NewsResponseDTO> result = newService.searchEverywhere(query);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error performing global search for news articles", ex);
            throw new RuntimeException("Failed to perform global search for news articles", ex);
        }
    }
}
