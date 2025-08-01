package com.researchers_conicet.repository;

import com.researchers_conicet.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository interface for GalleryImage entity.
 * Extends JpaRepository to inherit basic CRUD operations and provides custom query methods.
 */
@Repository
public interface GalleryRepository extends JpaRepository<GalleryImage, String> {

    /**
     * Find all images ordered by creation date in ascending order (oldest first).
     * @return List of gallery images sorted by creation date ascending
     */
    List<GalleryImage> findAllByOrderByCreatedAtAsc();
    
    /**
     * Find all images ordered by creation date in descending order (newest first).
     * @return List of gallery images sorted by creation date descending
     */
    List<GalleryImage> findAllByOrderByCreatedAtDesc();
    
    /**
     * Check if an image with a specific URL exists.
     * @param url The URL to check
     * @return true if exists, false otherwise
     */
    boolean existsByUrl(String url);
    
    /**
     * Delete multiple images by their URLs.
     * @param urls List of URLs to delete
     * @return Number of deleted records
     */
    @Query("DELETE FROM GalleryImage g WHERE g.url IN :urls")
    int deleteByUrls(@Param("urls") List<String> urls);

    /**
     * Update legend for an image (with @Modifying for UPDATE queries).
     * @param url URL of the image
     * @param newLegend New legend text
     */
    @Modifying
    @Transactional
    @Query("UPDATE GalleryImage g SET g.legend = :newLegend WHERE g.url = :url")
    void updateImageLegend(@Param("url") String url, @Param("newLegend") String newLegend);
}