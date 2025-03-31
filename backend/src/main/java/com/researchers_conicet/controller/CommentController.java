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
import java.util.Set;

/**
 * REST Controller for managing comment publications.
 * Provides endpoints for CRUD operations, searches, and fsupport management.
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
    @PutMapping(value = "/{analogyId}/comments/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long id,
            @RequestBody @Valid CommentRequestDTO requestDTO) {
        log.info("REST request to update Comment : {}", id);

        return ResponseEntity.ok(commentService.updateComment(id, requestDTO));
    }

    /**
     * Retrieves an specific comment publication by ID
     */
    @GetMapping("/{analogyId}/comments/{id}")
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
    @DeleteMapping("/{analogyId}/comments/{id}")
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
     * 
     * @param email Email to verify
     * @return True if the email is authorized, false otherwise
     */
    @GetMapping("/{analogyId}/comments/verify-email")
    public ResponseEntity<Boolean> verifyEmailAuthorization(
            @RequestParam String email) {
        log.info("REST request to verify email authorization: {}", email);
        return ResponseEntity.ok(commentService.isEmailAuthorizedToComment(email));
    }

    /**
     * Retrieves comments for a specific analogy with pagination and sorting
     * 
     * @param analogyId ID of the analogy
     * @param page Page number (0-based)
     * @param size Items per page
     * @param sort Sort field
     * @param direction Sort direction (ASC/DESC)
     * @return Paginated list of comments for the analogy
     */
    @GetMapping("/{analogyId}/comments")
    public ResponseEntity<Page<CommentResponseDTO>> getCommentsByAnalogy(
            @PathVariable Long analogyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        log.info("REST request to get Comments for Analogy {}", analogyId);
        
        PageRequest pageRequest = PageRequest.of(
            page,
            size,
            Sort.Direction.fromString(direction),
            sort
        );

        return ResponseEntity.ok(commentService.getCommentsByAnalogy(analogyId, pageRequest));
    }

    /**
     * Adds support to a comment
     * 
     * @param commentId ID of the comment to support
     * @param email Email of the user giving support
     * @return Updated comment with support information
     */
    @PostMapping("/{analogyId}/comments/{id}/support")
    public ResponseEntity<CommentResponseDTO> addSupport(
            @PathVariable("id") Long commentId,
            @RequestParam String email) {
        log.info("REST request to add support to Comment: {}", commentId);
        return ResponseEntity.ok(commentService.addSupport(commentId, email));
    }

    /**
     * Removes support from a comment
     * 
     * @param commentId ID of the comment to remove support from
     * @param email Email of the user removing support
     * @return Updated comment with support information
     */
    @DeleteMapping("/{analogyId}/comments/{id}/support")
    public ResponseEntity<CommentResponseDTO> removeSupport(
            @PathVariable("id") Long commentId,
            @RequestParam String email) {
        log.info("REST request to remove support from Comment: {}", commentId);
        return ResponseEntity.ok(commentService.removeSupport(commentId, email));
    }

    /**
     * Checks if an email is verified
     * 
     * @param email Email to verify
     * @return Boolean indicating if email is verified
     */
    @GetMapping("/comments/verify-email")
    public ResponseEntity<Boolean> verifyEmail(
            @RequestParam String email) {
        log.info("REST request to verify email: {}", email);
        return ResponseEntity.ok(commentService.isEmailVerified(email));
    }

    /**
     * Gets the support count for a specific comment
     * 
     * @param commentId ID of the comment
     * @return Number of supports for the comment
     */
    @GetMapping("/{analogyId}/comments/{id}/support-count")
    public ResponseEntity<Integer> getSupportCount(
            @PathVariable("id") Long commentId) {
        log.info("REST request to get support count for Comment: {}", commentId);
        return ResponseEntity.ok(commentService.getSupportCount(commentId));
    }

    /**
     * Gets the support emails for a specific comment
     * 
     * @param commentId ID of the comment
     * @return Set of support emails
     */
    @GetMapping("/{analogyId}/comments/{id}/support-emails")
    public ResponseEntity<Set<String>> getSupportEmails(
            @PathVariable("id") Long commentId) {
        log.info("REST request to get support emails for Comment: {}", commentId);
        return ResponseEntity.ok(commentService.getSupportEmails(commentId));
    }

    /**
     * Checks if a specific email has supported a comment
     * 
     * @param commentId ID of the comment
     * @param email Email to check
     * @return Boolean indicating if the email has supported the comment
     */
    @GetMapping("/{analogyId}/comments/{id}/has-supported")
    public ResponseEntity<Boolean> hasEmailSupported(
            @PathVariable("id") Long commentId,
            @RequestParam String email) {
        log.info("REST request to check if email {} has supported Comment: {}", email, commentId);
        Set<String> supportEmails = commentService.getSupportEmails(commentId);
        return ResponseEntity.ok(supportEmails.contains(email));
    }

}