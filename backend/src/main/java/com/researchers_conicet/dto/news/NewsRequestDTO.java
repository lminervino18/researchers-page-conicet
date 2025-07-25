package com.researchers_conicet.dto.news;

import lombok.Data;
import java.util.HashSet;
import java.util.Set;

import com.researchers_conicet.dto.media_link.MediaLinkDTO;

/**
 * Data Transfer Object for creating or updating a news article.
 * Excludes auto-generated fields and provides input validation.
 */
@Data
public class NewsRequestDTO {

    /**
     * Title of the news article.
     * Required field for creating a new news article.
     */
    private String title;

    /**
     * Detailed content of the news article.
     * Allows for longer descriptions.
     */
    private String content;

    /**
     * Collection of authors associated with the news article.
     * Defaults to an empty HashSet to prevent null pointer exceptions.
     */
    private Set<String> authors = new HashSet<>();

    /**
     * Collection of links related to the news article.
     * Defaults to an empty HashSet to prevent null pointer exceptions.
     */
    private Set<String> links = new HashSet<>();

    /**
     * Collection of Firebase media links (images or videos) sent from the frontend.
     */
    private Set<MediaLinkDTO> mediaLinks = new HashSet<>();

    /**
     * Preview image for the news article (Firebase URL).
     */
    private String previewImage;
}
