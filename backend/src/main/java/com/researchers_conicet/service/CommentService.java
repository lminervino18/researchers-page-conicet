package com.researchers_conicet.service;

import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.entity.Comment;
import com.researchers_conicet.dto.comment.CommentRequestDTO;
import com.researchers_conicet.dto.comment.CommentResponseDTO;
import com.researchers_conicet.repository.AnalogyRepository;
import com.researchers_conicet.repository.CommentRepository;

import com.researchers_conicet.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing Comment entities.
 * Handles business logic, file storage, and data transformation.
 * Provides CRUD operations and search functionality for comment papers.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final AnalogyRepository analogyRepository;

    public CommentService(CommentRepository commentRepository, AnalogyRepository analogyRepository) {
        this.commentRepository = commentRepository;
        this.analogyRepository = analogyRepository;
    }

    /**
     * Creates a new comment.
     * Validates input data.
     *
     * @param requestDTO The comment data
     * @param analogyId The ID of the analogy commented
     * @return commentResponseDTO containing the created comment details
     * @throws IllegalArgumentException if validation fails, 
     */
    @Transactional
    public CommentResponseDTO createComment(CommentRequestDTO requestDTO, Long analogyId) {
        log.info("Creating new comment");

        Analogy analogy = validateCommentData(requestDTO, analogyId);
        Optional<Comment> optParent = getParentById(requestDTO.getParentId(), analogyId);

        try {

            Comment comment = new Comment();
            comment.setUserName(requestDTO.getUserName());
            comment.setContent(requestDTO.getContent());
            optParent.ifPresent(parent -> comment.setParent(parent));
            comment.setAnalogy(analogy);

            Comment savedComment = commentRepository.save(comment);
            log.info("Created comment with ID: {}", savedComment.getId());
            
            return mapToDTO(savedComment);
        } catch (Exception e) {
            log.error("Error creating comment", e);
            throw new RuntimeException("Failed to create comment", e);
        }
    }

    /**
     * Retrieves a comment by ID.
     *
     * @param id The comment ID
     * @return CommentResponseDTO containing the comment details
     * @throws ResourceNotFoundException if comment not found
     */
    @Transactional(readOnly = true)
    public CommentResponseDTO getComment(Long id) {
        Comment comment = findCommentById(id);
        return mapToDTO(comment);
    }

    /**
     * Retrieves all comments with pagination.
     *
     * @param pageable Pagination information
     * @return Page of CommentResponseDTO
     */
    @Transactional(readOnly = true)
    public Page<CommentResponseDTO> getAllComments(Pageable pageable) {
        return commentRepository.findAll(pageable)
            .map(comment -> {
                return mapToDTO(comment);
            });
    }

    /**
     * Updates an existing comment.
     *
     * @param id The comment ID
     * @param requestDTO Updated comment data
     * @return CommentResponseDTO containing updated comment details
     * @throws ResourceNotFoundException if comment not found
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public CommentResponseDTO updateComment(Long id, CommentRequestDTO requestDTO) {
        log.info("Updating comment with ID: {}", id);
        
        Comment comment = findCommentById(id);
        Long analogyId = comment.getAnalogy().getId();

        validateCommentData(requestDTO, analogyId);
        Optional<Comment> optParent = getParentById(requestDTO.getParentId(), analogyId);

        try {
            comment.setUserName(requestDTO.getUserName());
            comment.setContent(requestDTO.getContent());
            optParent.ifPresent(parent -> comment.setParent(parent));

            Comment updatedComment = commentRepository.save(comment);
            log.info("Updated comment with ID: {}", id);
            
            return mapToDTO(updatedComment);
        } catch (Exception e) {
            log.error("Error updating comment with ID: {}", id, e);
            throw new RuntimeException("Failed to update comment", e);
        }
    }

    /**
     * Deletes a comment.
     *
     * @param id The comment ID
     * @throws ResourceNotFoundException if comment not found
     */
    @Transactional
    public void deleteComment(Long id) {
        log.info("Deleting comment with ID: {}", id);
        
        Comment comment = findCommentById(id);

        try {
            commentRepository.delete(comment);
            log.info("Deleted comment with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting comment with ID: {}", id, e);
            throw new RuntimeException("Failed to delete comment", e);
        }
    }

    /**
     * Searches comments by user name.
     *
     * @param userName The user name to search
     * @param analogyId The ID of the analogy commented
     * @return List of matching CommentResponseDTO
     * @throws IllegalArgumentException if user name is empty
     */
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> searchByUserName(String userName, Long analogyId) {
        if (!StringUtils.hasText(userName)) {
            throw new IllegalArgumentException("User name cannot be empty");
        }
        return commentRepository.findByUserNameAndAnalogyId(userName, analogyId)
            .stream()
            .map(comment -> {
                return mapToDTO(comment);
            })
            .collect(Collectors.toList());
    }

    /**
     * Retreives all comments which content contain a specific keyword
     *
     * @param term The search term
     * @param analogyId The ID of the analogy commented
     * @return List of matching CommentResponseDTO
     * @throws IllegalArgumentException if search term is empty
     */
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> searchEverywhere(String term, Long analogyId) {
        if (!StringUtils.hasText(term)) {
            throw new IllegalArgumentException("Search term cannot be empty");
        }
        return commentRepository.findByAnalogyIdAndContentContaining(analogyId, term)
            .stream()
            .map(comment -> {
                return mapToDTO(comment);
            })
            .collect(Collectors.toList());
    }

    /**
     * Helper method to find a comment by ID.
     * 
     * @param id The comment ID
     * @return Comment entity
     * @throws ResourceNotFoundException if not found
     */
    private Comment findCommentById(Long id) {
        return commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    private Optional<Comment> getParentById(Long parentId, Long analogyId) {
        Comment parent = null;
            
        if (parentId != null) {
            parent = commentRepository.findByIdAndAnalogyId(parentId, analogyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    String.format("Parent comment (ID: %d) not found for Analogy (ID: %d)",
                    parentId, analogyId)
                ));
        }

        return Optional.ofNullable(parent);
    }

    /**
     * Validates comment data constraints.
     * 
     * @param requestDTO The comment data to validate
     * @param analogyId The ID of the analogy commented
     * @throws IllegalArgumentException if validation fails
     */
    private Analogy validateCommentData(CommentRequestDTO requestDTO, Long analogyId) {
        if (!StringUtils.hasText(requestDTO.getUserName())) {
            throw new IllegalArgumentException("Comment user name is required");
        }
        if (!StringUtils.hasText(requestDTO.getContent())) {
            throw new IllegalArgumentException("Comment content is required");
        }

        Analogy analogy = analogyRepository.findById(analogyId)
        .orElseThrow(() -> new ResourceNotFoundException("Analogy not found with ID: " + analogyId));

        return analogy;
    }

    /**
     * Maps a Comment entity to CommentResponseDTO.
     * 
     * @param comment The Comment entity to map
     * @return CommentResponseDTO
     */
    private CommentResponseDTO mapToDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setUserName(comment.getUserName());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setAnalogyId(comment.getAnalogy().getId());
        Comment parent = comment.getParent();
        dto.setParentId((parent != null)? parent.getId() : null);
        return dto;
    }
}