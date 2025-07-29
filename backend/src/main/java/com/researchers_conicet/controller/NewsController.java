package com.researchers_conicet.controller;

import com.researchers_conicet.service.NewsService;
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
 * REST Controller for managing news article publications.
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
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    /**
     * Creates a news article
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NewsResponseDTO> createNews(
            @RequestBody @Valid NewsRequestDTO requestDTO) {
        log.info("REST request to create news article: {}", requestDTO);
        try {
            NewsResponseDTO response = newsService.createNews(requestDTO);
            log.info("News article created successfully with ID: {}", response.getId());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception ex) {
            log.error("Error creating news article: " + ex.getMessage(), ex);
            throw ex;
        }
    }

    /**
     * Updates an existing news article
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NewsResponseDTO> updateNews(
            @PathVariable Long id,
            @RequestBody @Valid NewsRequestDTO requestDTO) {
        log.info("REST request to update news article : {}", id);

        try {
            NewsResponseDTO updatedNews = newsService.updateNews(id, requestDTO);
            return ResponseEntity.ok(updatedNews);
        } catch (Exception ex) {
            log.error("Error updating news article with ID: {}", id, ex);
            throw new RuntimeException("Failed to update news article", ex);
        }
    }

    /**
     * Retrieves a specific news article by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NewsResponseDTO> getNews(@PathVariable Long id) {
        log.info("REST request to get news article : {}", id);
        try {
            NewsResponseDTO news = newsService.getNews(id);
            return ResponseEntity.ok(news);
        } catch (Exception ex) {
            log.error("Error retrieving news article with ID: {}", id, ex);
            throw new RuntimeException("Failed to retrieve news article", ex);
        }
    }

    /**
     * Retrieves all news articles with pagination and sorting
     */
    @GetMapping
    public ResponseEntity<Page<NewsResponseDTO>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("REST request to get all news articles");
        PageRequest pageRequest = PageRequest.of(
            page, 
            size, 
            Sort.Direction.fromString(direction), 
            sort
        );
        Page<NewsResponseDTO> newsPage = newsService.getAllNews(pageRequest);
        return ResponseEntity.ok(newsPage);
    }

    /**
     * Deletes a news article
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        log.info("REST request to delete news article : {}", id);
        try {
            newsService.deleteNews(id);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            log.error("Error deleting news article with ID: {}", id, ex);
            throw new RuntimeException("Failed to delete news article", ex);
        }
    }

    /**
     * Searches news articles by title content
     */
    @GetMapping("/search/title")
    public ResponseEntity<List<NewsResponseDTO>> searchByTitle(
            @RequestParam String query) {
        log.info("REST request to search news articles by title: {}", query);
        try {
            List<NewsResponseDTO> result = newsService.searchByTitle(query);
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
        log.info("REST request to search news articles everywhere: {}", query);
        try {
            List<NewsResponseDTO> result = newsService.searchEverywhere(query);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error performing global search for news articles", ex);
            throw new RuntimeException("Failed to perform global search for news articles", ex);
        }
    }
}
