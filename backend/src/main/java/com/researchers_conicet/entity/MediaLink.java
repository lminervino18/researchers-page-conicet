package com.researchers_conicet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Embeddable class to represent a media link (image or video) associated with an Analogy.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaLink {

    /**
     * URL of the media stored in Firebase.
     */
    @Column(name = "url", nullable = false, length = 512) // antes era TEXT
    private String url;

    /**
     * Type of media ("image" or "video").
     */
    @Column(name = "media_type", nullable = false, length = 50) // más chico también
    private String mediaType;
}
