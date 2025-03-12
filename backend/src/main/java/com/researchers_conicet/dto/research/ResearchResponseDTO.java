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
    
    // PDF-related fields
    private String pdfName;
    private String pdfPath;
    private Long pdfSize;
    private String mimeType;
    
    // Metadata
    private LocalDateTime createdAt;
    
    // Collections
    private Set<String> authors;
    private Set<String> links;
}