package com.researchers_conicet.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Entity representing a gallery image.
 * This class maps to the 'gallery_images' table in the database and contains
 * all information about a gallery image, including its relationships.
 */
@Entity
@Data
@Table(
    name = "gallery_images",
    indexes = {
        @Index(name = "idx_image_created_at", columnList = "created_at")
    }
)
public class GalleryImage {
    
    /**
     * URL of the image stored in Firebase.
     */
    @Id
    @Column(name = "url", length = 512) // antes era TEXT
    private String url;

    /**
     * Legend of the image.
     */
    @Column(name = "legend", length = 512) // antes era TEXT
    private String legend;

    /**
     * Timestamp when the image was created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public GalleryImage() {
        this.createdAt = LocalDateTime.now();
    }

    public GalleryImage(String url, String legend) {
        this.url = url;
        this.legend = legend;
        this.createdAt = LocalDateTime.now();
    }
}
