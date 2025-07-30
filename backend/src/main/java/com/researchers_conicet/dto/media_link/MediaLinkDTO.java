package com.researchers_conicet.dto.media_link;

import lombok.Data;

/**
 * DTO representing a media link (image or video) sent from or to the frontend.
 */
@Data
public class MediaLinkDTO {

    /**
     * URL of the media in Firebase.
     */
    private String url;

    /**
     * Type of media, either "image" or "video".
     */
    private String mediaType;
}
