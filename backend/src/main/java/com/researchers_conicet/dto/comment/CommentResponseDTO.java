package com.researchers_conicet.dto.comment;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for comment responses
 * Includes all fields needed for frontend display
 */
@Data
public class CommentResponseDTO {
    private Long id;
    private String userName;
    private String email;
    private String content;
    private Long parentId;
    private Long analogyId;
    private Integer supportCount;
    
    // Metadata
    private LocalDateTime createdAt;
}