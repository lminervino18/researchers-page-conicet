package com.researchers_conicet.dto.research;

import lombok.Data;
import java.util.HashSet;
import java.util.Set;

/**
 * DTO for incoming research creation/update requests
 * Excludes auto-generated fields and handles PDF separately via MultipartFile
 */
@Data
public class ResearchRequestDTO {
    
    private String researchAbstract;
    
    private Set<String> authors = new HashSet<>();
    
    private Set<String> links = new HashSet<>();
    
    // Note: PDF file is handled separately through MultipartFile in controller
}