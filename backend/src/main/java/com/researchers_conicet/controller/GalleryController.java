package com.researchers_conicet.controller;

import com.researchers_conicet.service.GalleryService;
import com.researchers_conicet.dto.gallery.GalleryImageDTO;
import com.researchers_conicet.dto.gallery.GalleryUpdateDTO;
import com.researchers_conicet.entity.GalleryImage;

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

/**
 * REST Controller for managing analogy publications.
 * Provides endpoints for CRUD operations, searches, and support management.
 */
@Slf4j
@RestController
@RequestMapping("/api/gallery")
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
public class GalleryController {

    private final GalleryService service;

    public GalleryController(GalleryService service) {
        this.service = service;
    }

    /**
     * Creates a new gallery image
     * 
     * @param requestDTO Gallery image data in JSON format
     * @return Created analogy details
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GalleryImage> createGalle(
            @RequestBody @Valid GalleryImageDTO requestDTO) {
        log.info("REST request to create a Gallery image.");
        return new ResponseEntity<>(
            service.createGalleryImage(requestDTO),
            HttpStatus.CREATED
        );
    }

    /**
     * Retrieves an specific gallery image by URL.
     */
    @GetMapping("/by-url")
    public ResponseEntity<GalleryImage> getImageByUrl(@RequestParam String url) {
        log.info("REST request to get GalleryImage : {}", url);
        GalleryImage image = service.getGalleryImage(url);
        return ResponseEntity.ok(image);
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
    public ResponseEntity<Page<GalleryImage>> getAllImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("REST request to get all GalleryImage");
        PageRequest pageable = PageRequest.of(page, size, Sort.Direction.fromString(direction), sort);
        Page<GalleryImage> images = service.getAllImages(pageable);
        return ResponseEntity.ok(images);
    }

    /**
     * Updates the legend of an existing gallery image
     */
    @PatchMapping("/by-url")
    public ResponseEntity<GalleryImage> updateLegend(
            @RequestParam String url,
            @RequestBody GalleryUpdateDTO update) {
        log.info("REST request to patch the legend of the GalleryImage : {}", url);
        GalleryImage updated = service.updateLegend(url, update);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a gallery image by its URL.
     */
    @DeleteMapping("/by-url")
    public ResponseEntity<Void> deleteImage(@RequestParam String url) {
        log.info("REST request to delete GalleryImage : {}", url);
        service.deleteGalleryImage(url);
        return ResponseEntity.noContent().build();
    }
}