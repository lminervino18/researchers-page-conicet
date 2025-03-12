package com.researchers_conicet.dto.analogy;

import lombok.Data;
import java.util.HashSet;
import java.util.Set;

/**
 * DTO for incoming analogy’s creation/update requests
 * Excludes auto-generated fields
 */
@Data
public class AnalogyRequestDTO {
    
    private String title;

    private String content;
    
    private Set<String> authors = new HashSet<>();
    
    private Set<String> links = new HashSet<>();
}