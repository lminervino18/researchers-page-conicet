package com.researchers_conicet.dto.news;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

import com.researchers_conicet.dto.media_link.MediaLinkDTO;

/**
 * Data Transfer Object for returning news article information.
 * Includes all fields needed for frontend display.
 */
@Data
public class NewsResponseDTO {

    /**
     * Unique identifier for the news article.
     */
    private Long id;

    /**
     * Title of the news article.
     */
    private String title;

    /**
     * Detailed content of the news article.
     */
    private String content;

    /**
     * Timestamp of news article creation.
     */
    private LocalDateTime createdAt;

    /**
     * Collection of authors associated with the news article.
     */
    private Set<String> authors;

    /**
     * Collection of links related to the news article.
     */
    private Set<String> links;

    /**
     * Collection of Firebase media links (images or videos).
     */
    private Set<MediaLinkDTO> mediaLinks;

    /**
     * Preview image for the news article (Firebase URL).
     */
    private String previewImage;
}
