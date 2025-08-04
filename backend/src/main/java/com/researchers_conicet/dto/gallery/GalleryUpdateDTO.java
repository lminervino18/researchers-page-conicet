package com.researchers_conicet.dto.gallery;

import lombok.Data;

/**
 * DTO representing an image used to show in the gallery.
 */
@Data
public class GalleryUpdateDTO {

    /**
     * Caption of the image.
     */
    private String caption;
}
