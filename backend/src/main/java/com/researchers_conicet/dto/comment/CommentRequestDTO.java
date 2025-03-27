package com.researchers_conicet.dto.comment;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for comment creation/update requests
 * Excludes auto-generated fields
 */
@Data
public class CommentRequestDTO {
    
    @NotBlank(message = "Username cannot be empty")
    private String userName;

    @NotBlank(message = "Comment content cannot be empty")
    private String content;
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    private Long parentId;
}