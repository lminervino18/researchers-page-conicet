package com.researchers_conicet.dto.research;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;

/**
 * DTO for incoming research creation/update requests
 * Excludes auto-generated fields and assumes PDF is handled via Firebase link
 */
@Data
public class ResearchRequestDTO {

    private String researchAbstract;

    // Firebase URL or null if only links are provided
    private String pdfPath;

    private Set<String> authors = new HashSet<>();

    private Set<String> links = new HashSet<>();
}
