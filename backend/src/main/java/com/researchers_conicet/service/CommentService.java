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
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final AnalogyRepository analogyRepository;
    private final EmailVerificationService emailVerificationService;

    public CommentService(
        CommentRepository commentRepository, 
        AnalogyRepository analogyRepository,
        EmailVerificationService emailVerificationService
    ) {
        this.commentRepository = commentRepository;
        this.analogyRepository = analogyRepository;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public CommentResponseDTO createComment(CommentRequestDTO requestDTO, Long analogyId) {
        log.info("Creating new comment");

        if (!emailVerificationService.isEmailRegistered(requestDTO.getEmail())) {
            log.warn("Attempt to comment with unregistered email: {}", requestDTO.getEmail());
            throw new UnauthorizedCommentException("Email is not registered for commenting");
        }

        Analogy analogy = validateCommentData(requestDTO, analogyId);
        Optional<Comment> optParent = getParentById(requestDTO.getParentId(), analogyId);

        try {
            Comment comment = new Comment();
            comment.setUserName(requestDTO.getUserName());
            comment.setContent(requestDTO.getContent());
            comment.setEmail(requestDTO.getEmail());
            optParent.ifPresent(comment::setParent);
            comment.setAnalogy(analogy);

            Comment savedComment = commentRepository.save(comment);
            log.info("Created comment with ID: {}", savedComment.getId());
            
            return mapToDTO(savedComment);
        } catch (Exception e) {
            log.error("Error creating comment", e);
            throw new RuntimeException("Failed to create comment", e);
        }
    }

    @Transactional(readOnly = true)
    public CommentResponseDTO getComment(Long id) {
        Comment comment = findCommentById(id);
        return mapToDTO(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponseDTO> getAllComments(Pageable pageable) {
        return commentRepository.findAll(pageable)
            .map(this::mapToDTO);
    }

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

    @Transactional(readOnly = true)
    public boolean isEmailAuthorizedToComment(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return commentRepository.isEmailAuthorizedToComment(email);
    }

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

        Analogy analogy = analogyRepository.findById(analogyId)
        .orElseThrow(() -> new ResourceNotFoundException("Analogy not found with ID: " + analogyId));

        return analogy;
    }

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
        return dto;
    }
}