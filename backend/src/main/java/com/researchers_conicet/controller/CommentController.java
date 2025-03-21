package com.researchers_conicet.controller;

import com.researchers_conicet.service.CommentService;
import com.researchers_conicet.dto.comment.CommentRequestDTO;
import com.researchers_conicet.dto.comment.CommentResponseDTO;
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
 * REST Controller for managing comment publications.
 * Provides endpoints for CRUD operations, searches, and file handling.
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
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * Creates a new comment publication
     * 
     * @param requestDTO Comment data in JSON format
     * @param analogyId Analogy that is being commented
     * @return Created comment details
     */
    @PostMapping("/{analogyId}/comments")
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable Long analogyId,
            @RequestBody @Valid CommentRequestDTO requestDTO) {
        log.info("REST request to create Comment");
        return new ResponseEntity<>(
            commentService.createComment(requestDTO, analogyId),
            HttpStatus.CREATED
        );
    }

    /**
     * Updates an existing comment publication
     */
    @PutMapping(value = "{analogyId}/comments/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long id,
            @RequestBody @Valid CommentRequestDTO requestDTO) {
        log.info("REST request to update Comment : {}", id);

        return ResponseEntity.ok(commentService.updateComment(id, requestDTO));
    }

    /**
     * Retrieves an specific comment publication by ID
     */
    @GetMapping("{analogyId}/comments/{id}")
    public ResponseEntity<CommentResponseDTO> getComment(@PathVariable Long id) {
        log.info("REST request to get Comment : {}", id);
        return ResponseEntity.ok(commentService.getComment(id));
    }

    /**
     * Retrieves all comment publications with pagination and sorting
     * 
     * @param page Page number (0-based)
     * @param size Items per page
     * @param sort Sort field
     * @param direction Sort direction (ASC/DESC)
     */
    @GetMapping("/comments")
    public ResponseEntity<Page<CommentResponseDTO>> getAllComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("REST request to get all Comments");
        PageRequest pageRequest = PageRequest.of(
            page, 
            size, 
            Sort.Direction.fromString(direction), 
            sort
        );
        return ResponseEntity.ok(commentService.getAllComments(pageRequest));
    }

    /**
     * Deletes an comment publication
     */
    @DeleteMapping("{analogyId}/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        log.info("REST request to delete Comment : {}", id);
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches comments by user name
     */
    @GetMapping(value = "/{analogyId}/comments/search", params = "userName")
    public ResponseEntity<List<CommentResponseDTO>> searchByUser(
            @PathVariable Long analogyId,
            @RequestParam String userName) {
        log.info("REST request to search Comments by user name: {}", userName);
        return ResponseEntity.ok(commentService.searchByUserName(userName, analogyId));
    }

    /**
     * Searches comments by email
     */
    @GetMapping(value = "/{analogyId}/comments/search", params = "email")
    public ResponseEntity<List<CommentResponseDTO>> searchByEmail(
            @PathVariable Long analogyId,
            @RequestParam String email) {
        log.info("REST request to search Comments by email: {}", email);
        return ResponseEntity.ok(commentService.searchByEmail(email, analogyId));
    }

    /**
     * Searches comments which content contains a specific keyword
     */
    @GetMapping(value = "/{analogyId}/comments/search", params = "term")
    public ResponseEntity<List<CommentResponseDTO>> searchEverywhere(
            @PathVariable Long analogyId,
            @RequestParam String term) {
        log.info("REST request to search Comments everywhere: {}", term);
        return ResponseEntity.ok(commentService.searchEverywhere(term, analogyId));
    }

    /**
     * Verifies if an email is authorized to comment
     */
    @GetMapping("/{analogyId}/comments/verify-email")
    public ResponseEntity<Boolean> verifyEmailAuthorization(
            @RequestParam String email) {
        log.info("REST request to verify email authorization: {}", email);
        return ResponseEntity.ok(commentService.isEmailAuthorizedToComment(email));
    }
}