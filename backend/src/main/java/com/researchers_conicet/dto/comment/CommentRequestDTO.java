package com.researchers_conicet.dto.comment;

import lombok.Data;

/**
 * DTO for incoming comment’s creation/update requests
 * Excludes auto-generated fields
 */
@Data
public class CommentRequestDTO {
    
    private String userName;

    private String content;
    
    private Long parentId;
}