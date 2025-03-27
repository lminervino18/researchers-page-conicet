package com.researchers_conicet.dto.analogy;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Data Transfer Object for returning analogy information.
 * Includes all fields needed for frontend display.
 */
@Data
public class AnalogyResponseDTO {
    /**
     * Unique identifier for the analogy.
     */
    private Long id;

    /**
     * Title of the analogy.
     */
    private String title;

    /**
     * Detailed content of the analogy.
     */
    private String content;
    
    /**
     * Timestamp of analogy creation.
     */
    private LocalDateTime createdAt;
    
    /**
     * Collection of authors associated with the analogy.
     */
    private Set<String> authors;

    /**
     * Collection of links related to the analogy.
     */
    private Set<String> links;

    /**
     * Number of supports (likes) for the analogy.
     */
    private Integer supportCount = 0;
}