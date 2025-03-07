package com.researchers_conicet.dto.analogy;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for outgoing analogy’s responses
 * Includes all fields needed for frontend display
 */
@Data
public class AnalogyResponseDTO {
    private Long id;
    private String title;
    private String content;
    
    // Metadata
    private LocalDateTime createdAt;
    
    // Collections
    private Set<String> authors;
    private Set<String> links;
}