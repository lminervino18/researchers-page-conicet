package com.researchers_conicet.service;

import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.entity.Comment;
import com.researchers_conicet.dto.comment.CommentRequestDTO;
import com.researchers_conicet.dto.comment.CommentResponseDTO;
import com.researchers_conicet.repository.AnalogyRepository;
import com.researchers_conicet.repository.CommentRepository;

import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.exception.UnauthorizedCommentException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class CommentService {

    // Repositories and services used by this service
    private final CommentRepository commentRepository;
    private final AnalogyRepository analogyRepository;
    private final EmailVerificationService emailVerificationService;

    /** Email validation regex */
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

    // Constructor to inject dependencies
    public CommentService(
        CommentRepository commentRepository, 
        AnalogyRepository analogyRepository,
        EmailVerificationService emailVerificationService
    ) {
        this.commentRepository = commentRepository;
        this.analogyRepository = analogyRepository;
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Checks if an email is verified
     * 
     * @param email Email to verify
     * @return true if email is registered, false otherwise
     */
    public boolean isEmailVerified(String email) {
        return emailVerificationService.isEmailRegistered(email);
    }

    /**
     * Gets the support count for a specific comment
     * 
     * @param commentId ID of the comment
     * @return Number of supports for the comment
     */
    public int getSupportCount(Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new ResourceNotFoundException("Comment not found with id: " + commentId);
        }
        return commentRepository.countSupportsByCommentId(commentId);
    }

    /**
     * Gets the emails that have supported a comment
     * 
     * @param commentId Comment identifier
     * @return Set of support emails
     */
    public Set<String> getSupportEmails(Long commentId) {
        Comment comment = findCommentById(commentId);
        return comment.getSupportEmails();
    }

    /**
     * Checks if an email has supported a specific comment
     * 
     * @param commentId ID of the comment
     * @param email Email to check
     * @return Boolean indicating if the email has supported the comment
     */
    public boolean hasEmailSupported(Long commentId, String email) {
        Comment comment = findCommentById(commentId);
        return comment.getSupportEmails().contains(email);
    }

    /**
     * Creates a new comment for a given analogy.
     * Validates the email, analogy, and optional parent comment before saving.
     */
    @Transactional
    public CommentResponseDTO createComment(CommentRequestDTO requestDTO, Long analogyId) {
        log.info("Creating new comment");

        // Check if the email is registered
        if (!emailVerificationService.isEmailRegistered(requestDTO.getEmail())) {
            log.warn("Attempt to comment with unregistered email: {}", requestDTO.getEmail());
            throw new UnauthorizedCommentException("Email is not registered for commenting");
        }

        // Validate analogy and comment data
        Analogy analogy = validateCommentData(requestDTO, analogyId);
        Optional<Comment> optParent = getParentById(requestDTO.getParentId(), analogyId);

        try {
            // Create and save the comment
            Comment comment = new Comment(
                requestDTO.getUserName(),
                requestDTO.getContent(),
                requestDTO.getEmail(),
                optParent,
                analogy
            );

            Comment savedComment = commentRepository.save(comment);
            log.info("Created comment with ID: {}", savedComment.getId());
            
            return mapToDTO(savedComment);
        } catch (Exception e) {
            log.error("Error creating comment", e);
            throw new RuntimeException("Failed to create comment", e);
        }
    }

    /**
     * Retrieves a comment by its ID.
     */
    @Transactional(readOnly = true)
    public CommentResponseDTO getComment(Long id) {
        Comment comment = findCommentById(id);
        return mapToDTO(comment);
    }

    /**
     * Retrieves all comments with pagination.
     */
    @Transactional(readOnly = true)
    public Page<CommentResponseDTO> getAllComments(Pageable pageable) {
        return commentRepository.findAll(pageable)
            .map(this::mapToDTO);
    }

    /**
     * Updates an existing comment by its ID.
     * Validates the email, analogy, and optional parent comment before saving.
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
            comment.setEmail(requestDTO.getEmail());
            optParent.ifPresent(comment::setParent);

            Comment updatedComment = commentRepository.save(comment);
            log.info("Updated comment with ID: {}", id);
            
            return mapToDTO(updatedComment);
        } catch (Exception e) {
            log.error("Error updating comment with ID: {}", id, e);
            throw new RuntimeException("Failed to update comment", e);
        }
    }

    /**
     * Deletes a comment by its ID.
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
     * Searches for comments by user name and analogy ID.
     */
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> searchByUserName(String userName, Long analogyId) {
        if (!StringUtils.hasText(userName)) {
            throw new IllegalArgumentException("User name cannot be empty");
        }
        return commentRepository.findByUserNameAndAnalogyId(userName, analogyId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Searches for comments by a term in the content and analogy ID.
     */
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> searchEverywhere(String term, Long analogyId) {
        if (!StringUtils.hasText(term)) {
            throw new IllegalArgumentException("Search term cannot be empty");
        }
        return commentRepository.findByAnalogyIdAndContentContaining(analogyId, term)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Searches for comments by email and analogy ID.
     */
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> searchByEmail(String email, Long analogyId) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return commentRepository.findByEmailAndAnalogyId(email, analogyId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Checks if an email is authorized to comment.
     */
    @Transactional(readOnly = true)
    public boolean isEmailAuthorizedToComment(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return commentRepository.isEmailAuthorizedToComment(email);
    }
 
    /**
     * Retrieves comments by analogy ID with pagination.
     */
    @Transactional(readOnly = true)
    public Page<CommentResponseDTO> getCommentsByAnalogy(Long analogyId, Pageable pageable) {
        analogyRepository.findById(analogyId)
            .orElseThrow(() -> new ResourceNotFoundException("Analogy not found with ID: " + analogyId));

        return commentRepository.findByAnalogyId(analogyId, pageable)
            .map(this::mapToDTO);
    }

    /**
     * Adds support to a comment
     * 
     * @param commentId Comment identifier
     * @param email User's email
     * @return Updated comment response DTO
     * @throws ResourceNotFoundException if comment not found
     * @throws IllegalArgumentException if email is invalid
     */
    @Transactional
    public CommentResponseDTO addSupport(Long commentId, String email) {
        log.info("Adding support to comment with ID: {}", commentId);

        // Validate email input
        validateEmail(email);

        // Verify email is registered in the system
        if (!emailVerificationService.isEmailRegistered(email)) {
            throw new IllegalArgumentException("Email is not registered");
        }

        // Find the comment
        Comment comment = findCommentById(commentId);

        try {
            // Use the method from the entity to add support email
            if (comment.addSupportEmail(email)) {
                // Only save if the email was not already present
                commentRepository.save(comment);
                log.info("Added support to comment with ID: {}", commentId);
            } else {
                log.warn("Email {} has already supported this comment", email);
            }

            return mapToDTO(comment);
        } catch (Exception e) {
            log.error("Error adding support to comment with ID: {}", commentId, e);
            throw new RuntimeException("Failed to add support to comment", e);
        }
    }

    /**
     * Removes support from a comment
     * 
     * @param commentId Comment identifier
     * @param email User's email
     * @return Updated comment response DTO
     * @throws ResourceNotFoundException if comment not found
     * @throws IllegalArgumentException if email is invalid
     */
    @Transactional
    public CommentResponseDTO removeSupport(Long commentId, String email) {
        log.info("Removing support from comment with ID: {}", commentId);

        // Validate email input
        validateEmail(email);

        // Find the comment
        Comment comment = findCommentById(commentId);

        try {
            // Use the method from the entity to remove support email
            if (comment.removeSupportEmail(email)) {
                // Only save if the email was present
                commentRepository.save(comment);
                log.info("Removed support from comment with ID: {}", commentId);
                return mapToDTO(comment);
            }
        } catch (Exception e) {
            log.error("Error removing support from comment with ID: {}", commentId, e);
            throw new RuntimeException("Failed to remove support from comment", e);
        }
        
        log.warn("Email {} has not supported this comment", email);
        throw new IllegalArgumentException(String.format("Email %s has not given support to comment %d", email, commentId));
    }

    /**
     * Finds a comment by its ID.
     */
    private Comment findCommentById(Long id) {
        return commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    /**
     * Retrieves the parent comment by its ID and analogy ID.
     */
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
     * Validates the data for a comment and ensures the analogy exists.
     */
    private Analogy validateCommentData(CommentRequestDTO requestDTO, Long analogyId) {
        if (!StringUtils.hasText(requestDTO.getUserName())) {
            throw new IllegalArgumentException("Comment user name is required");
        }
        if (!StringUtils.hasText(requestDTO.getContent())) {
            throw new IllegalArgumentException("Comment content is required");
        }
        if (!StringUtils.hasText(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Email is required");
        }

        // Ensure the analogy exists
        Analogy analogy = analogyRepository.findById(analogyId)
        .orElseThrow(() -> new ResourceNotFoundException("Analogy not found with ID: " + analogyId));

        return analogy;
    }

    /**
     * Maps a Comment entity to a CommentResponseDTO.
     */
    private CommentResponseDTO mapToDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setUserName(comment.getUserName());
        dto.setEmail(comment.getEmail());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setAnalogyId(comment.getAnalogy().getId());
        Comment parent = comment.getParent();
        dto.setParentId((parent != null)? parent.getId() : null);
        // Dynamically get support count
        dto.setSupportCount(comment.getSupportEmails().size());
        return dto;
    }

        /**
     * Gets the list of comment IDs supported by a specific email
     *
     * @param email the user's email
     * @return list of comment IDs that the user supported
     */
    @Transactional(readOnly = true)
    public List<Long> getSupportedCommentIdsByEmail(String email) {
        validateEmail(email);
        return commentRepository.findSupportedCommentIdsByEmail(email);
    }


    /**
     * Validates email format
     * 
     * @param email Email to validate
     * @throws IllegalArgumentException if email is invalid
     */
    private void validateEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        
        if (!Pattern.matches(EMAIL_REGEX, email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
}