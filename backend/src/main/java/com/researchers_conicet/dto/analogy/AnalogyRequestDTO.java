package com.researchers_conicet.dto.analogy;

import lombok.Data;
import java.util.HashSet;
import java.util.Set;

/**
 * Data Transfer Object for creating or updating an analogy.
 * Excludes auto-generated fields and provides input validation.
 */
@Data
public class AnalogyRequestDTO {
    
    /**
     * Title of the analogy.
     * Required field for creating a new analogy.
     */
    private String title;

    /**
     * Detailed content of the analogy.
     * Allows for longer descriptions.
     */
    private String content;
    
    /**
     * Collection of authors associated with the analogy.
     * Defaults to an empty HashSet to prevent null pointer exceptions.
     */
    private Set<String> authors = new HashSet<>();
    
    /**
     * Collection of links related to the analogy.
     * Defaults to an empty HashSet to prevent null pointer exceptions.
     */
    private Set<String> links = new HashSet<>();


    /**
     * Collection of Firebase media links (images or videos) sent from the frontend.
     */
    private Set<MediaLinkDTO> mediaLinks = new HashSet<>();

    /**
     * Number of supports (likes) for the analogy.
     * Optional field, will be managed by the backend.
     */
    private Integer supportCount = 0;
}