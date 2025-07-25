package com.researchers_conicet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import com.researchers_conicet.dto.comment.CommentRequestDTO;
import com.researchers_conicet.dto.comment.CommentResponseDTO;
import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.entity.Comment;
import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.exception.UnauthorizedCommentException;
import com.researchers_conicet.repository.AnalogyRepository;
import com.researchers_conicet.repository.CommentRepository;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {

    @Mock
    private CommentRepository repository;
    @Mock
    private AnalogyRepository analogyRepository;
    @Mock
    private EmailVerificationService emailService;

    @InjectMocks
    private CommentService service;

    @Test
    void createComment_shouldReturnCreatedCommentResponse() {
        Long analogyId = 1L;
        CommentRequestDTO request = new CommentRequestDTO();
        request.setUserName("User");
        request.setContent("Content");
        request.setEmail("email@gmail.com");
        
        when(emailService.isEmailRegistered(request.getEmail())).thenReturn(true);
        Analogy analogy = new Analogy();
        analogy.setId(analogyId);
        when(analogyRepository.findById(analogyId)).thenReturn(Optional.of(analogy));
        when(repository.save(ArgumentMatchers.any(Comment.class))).thenAnswer(invocation -> {
            Comment comment = invocation.getArgument(0);
            comment.setId(1L); // Simulate ID generation
            comment.setSupportEmails(new HashSet<String>());
            return comment;
        });

        CommentResponseDTO result = service.createComment(request, analogyId);

        CommentResponseDTO response = new CommentResponseDTO();
        response.setId(1L);
        response.setUserName("User");
        response.setContent("Content");
        response.setEmail("email@gmail.com");
        response.setCreatedAt(result.getCreatedAt());
        response.setAnalogyId(analogyId);
        response.setParentId(null);
        response.setSupportCount(0);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(response);
    }
    
    @Test
    void createComment_shouldFailFor() {

        when(emailService.isEmailRegistered("email@gmail.com")).thenReturn(true);
        when(emailService.isEmailRegistered("nonregisteredemail@gmail.com")).thenReturn(false);
        
        // Invalid request
        CommentRequestDTO requestNoUserName = new CommentRequestDTO();
        requestNoUserName.setUserName("");
        requestNoUserName.setContent("Content");
        requestNoUserName.setEmail("email@gmail.com");
        assertThrows(IllegalArgumentException.class, () -> service.createComment(requestNoUserName, 1L));
        
        // Email not registered
        CommentRequestDTO requestEmailNotRegistered = new CommentRequestDTO();
        requestEmailNotRegistered.setUserName("User");
        requestEmailNotRegistered.setContent("Content");
        requestEmailNotRegistered.setEmail("nonregisteredemail@gmail.com");
        when(emailService.isEmailRegistered("nonregisteredemail@gmail.com")).thenReturn(false);
        assertThrows(UnauthorizedCommentException.class, () -> service.createComment(requestEmailNotRegistered, 1L));

        // Analogy not found
        CommentRequestDTO request = new CommentRequestDTO();
        request.setUserName("User");
        request.setContent("Content");
        request.setEmail("email@gmail.com");
        when(analogyRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.createComment(request, 1L));
    }

    @Test
    void updateComment_shouldReturnUpdatedComment() {
        Long id = 1L;
        Long analogyId = 1L;
        CommentRequestDTO request = new CommentRequestDTO();
        request.setUserName("Updated User");
        request.setContent(("Updated Content"));
        request.setEmail("updatedemail@gmail.com");

        Analogy analogy = new Analogy();
        analogy.setId(analogyId);
        Comment comment = new Comment("User", "Content", "email@gmail.com", Optional.empty(), analogy);
        comment.setId(id);
        comment.setSupportEmails(new HashSet<String>(Arrays.asList("pepe@gmail.com")));
        when(repository.findById(id)).thenReturn(Optional.of(comment));
        when(analogyRepository.findById(analogyId)).thenReturn(Optional.of(analogy));
        when(repository.save(comment)).thenReturn(comment);

        CommentResponseDTO response = new CommentResponseDTO();
        response.setId(id);
        response.setUserName("Updated User");
        response.setContent("Updated Content");
        response.setEmail("updatedemail@gmail.com");
        response.setCreatedAt(comment.getCreatedAt());
        response.setAnalogyId(analogyId);
        response.setParentId(null);
        response.setSupportCount(1); // pepe supported it

        CommentResponseDTO result = service.updateComment(id, request);
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(response);
    }

    @Test
    void getCommentsByAnalogy_shouldReturnCommentsForExistingAnalogy() {
        Long analogyId = 1L;
        Analogy analogy = new Analogy();
        analogy.setId(analogyId);
        Comment comment1 = new Comment("User1", "Content1", "email1@gmail.com", Optional.empty(), analogy);
        comment1.setId(1L);
        Comment comment2 = new Comment("User2", "Content2", "email2@gmail.com", Optional.empty(), analogy);
        comment2.setId(2L);
        Comment comment3 = new Comment("User3", "Content3", "email3@gmail.com", Optional.of(comment1), analogy);
        comment3.setId(3L);

        when(analogyRepository.findById(analogyId)).thenReturn(Optional.of(analogy));
        when(repository.findByAnalogyId(analogyId, null)).thenReturn(new PageImpl<>(Arrays.asList(comment1, comment2, comment3)));

        CommentResponseDTO response1 = new CommentResponseDTO();
        response1.setId(comment1.getId());
        response1.setUserName(comment1.getUserName());
        response1.setContent(comment1.getContent());
        response1.setEmail(comment1.getEmail());
        response1.setCreatedAt(comment1.getCreatedAt());
        response1.setAnalogyId(analogyId);
        response1.setParentId(null);
        response1.setSupportCount(0);

        CommentResponseDTO response2 = new CommentResponseDTO();
        response2.setId(comment2.getId());
        response2.setUserName(comment2.getUserName());
        response2.setContent(comment2.getContent());
        response2.setEmail(comment2.getEmail());
        response2.setCreatedAt(comment2.getCreatedAt());
        response2.setAnalogyId(analogyId);
        response2.setParentId(null);
        response2.setSupportCount(0);

        CommentResponseDTO response3 = new CommentResponseDTO();
        response3.setId(comment3.getId());
        response3.setUserName(comment3.getUserName());
        response3.setContent(comment3.getContent());
        response3.setEmail(comment3.getEmail());
        response3.setCreatedAt(comment3.getCreatedAt());
        response3.setAnalogyId(analogyId);
        response3.setParentId(comment1.getId());
        response3.setSupportCount(0);

        Page<CommentResponseDTO> page = service.getCommentsByAnalogy(analogyId, null);
        List<CommentResponseDTO> result = page.getContent();
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(3);
        assertThat(result).containsExactlyInAnyOrder(response1, response2, response3);
    }

    @Test
    void addSupport_shouldAddEmailAndReturnUpdatedComment() {
        Long commentId = 1L;
        String email = "user@example.com";

        Comment comment = new Comment("User", "Content", email, Optional.empty(), new Analogy());
        comment.setId(commentId);
        comment.setSupportEmails(new HashSet<>());

        when(repository.findById(commentId)).thenReturn(Optional.of(comment));
        when(emailService.isEmailRegistered(email)).thenReturn(true);
        when(repository.save(comment)).thenReturn(comment);

        CommentResponseDTO result = service.addSupport(commentId, email);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(commentId);
        assertThat(result.getSupportCount()).isEqualTo(1);
    }

    @Test
    void removeSupport_shouldRemoveEmailAndReturnUpdatedComment() {
        Long commentId = 1L;
        String email = "user@example.com";

        Comment comment = new Comment("User", "Content", email, Optional.empty(), new Analogy());
        comment.setId(commentId);
        comment.setSupportEmails(new HashSet<>(List.of(email)));

        when(repository.findById(commentId)).thenReturn(Optional.of(comment));
        when(repository.save(comment)).thenReturn(comment);

        CommentResponseDTO result = service.removeSupport(commentId, email);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(commentId);
        assertThat(result.getSupportCount()).isEqualTo(0);
    }

    @Test
    void getSupportCount_shouldReturnCount() {
        Long commentId = 1L;

        when(repository.existsById(commentId)).thenReturn(true);
        when(repository.countSupportsByCommentId(commentId)).thenReturn(3);

        int count = service.getSupportCount(commentId);

        assertThat(count).isEqualTo(3);
    }
}
