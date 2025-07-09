package com.researchers_conicet.dto.research;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for outgoing research responses
 * Includes all fields needed for frontend display
 */
@Data
public class ResearchResponseDTO {
    private Long id;
    private String researchAbstract;

    // PDF public URL
    private String pdfPath;

    private LocalDateTime createdAt;

    private Set<String> authors;
    private Set<String> links;
}
