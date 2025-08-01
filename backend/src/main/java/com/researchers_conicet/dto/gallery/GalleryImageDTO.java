package com.researchers_conicet.dto.gallery;

import lombok.Data;

/**
 * DTO representing an image used to show in the gallery.
 */
@Data
public class GalleryImageDTO {
    /**
     * URL of the media in Firebase.
     */
    private String url;

    /**
     * Legend of the image.
     */
    private String legend;
}
