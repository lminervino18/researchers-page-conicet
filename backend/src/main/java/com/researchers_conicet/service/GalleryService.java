package com.researchers_conicet.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.researchers_conicet.dto.gallery.GalleryImageDTO;
import com.researchers_conicet.dto.gallery.GalleryUpdateDTO;
import com.researchers_conicet.entity.GalleryImage;
import com.researchers_conicet.repository.GalleryRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service class for managing Gallery images.
 * Handles business logic, data transformation, and CRUD operations.
 * Provides functionality for gallery images management and support system.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class GalleryService {

    private GalleryRepository repository;
    
    public GalleryService(GalleryRepository repository) {
        this.repository = repository;
    }

    /**
     * Creates a new analogy
     * 
     * @param requestDTO Data transfer object containing analogy details
     * @return Response DTO with created analogy details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public GalleryImage createGalleryImage(GalleryImageDTO request) {
        GalleryImage image = new GalleryImage();
        image.setUrl(request.getUrl());
        image.setLegend(request.getLegend());

        try {
            GalleryImage savedImage = repository.save(image);
            log.info("Created gallery image with url: {}", savedImage.getUrl());
            return savedImage;
        } catch (Exception e) {
            log.error("Error creating the gallery image", e);
            throw new RuntimeException("Failed to create gallery image", e);
        }
    }

    @Transactional
    public GalleryImage updateLegend(String url, GalleryUpdateDTO update) {
        GalleryImage image = repository.findById(url)
                .orElseThrow(() -> new IllegalArgumentException("Image not found with url: " + url));
        image.setLegend(update.getLegend());
        try {
            GalleryImage updatedImage = repository.save(image);
            log.info("Updated legend for image with url: {}", updatedImage.getUrl());
            return updatedImage;
        } catch (Exception e) {
            log.error("Error updating legend for image", e);
            throw new RuntimeException("Failed to update legend", e);
        }
    }

    @Transactional
    public void deleteGalleryImage(String url) {
        GalleryImage image = repository.findById(url)
                .orElseThrow(() -> new IllegalArgumentException("Image not found with url: " + url));
        try {
            repository.delete(image);
            log.info("Deleted gallery image with url: {}", url);
        } catch (Exception e) {
            log.error("Error deleting gallery image", e);
            throw new RuntimeException("Failed to delete gallery image", e);
        }
    }

    public GalleryImage getGalleryImage(String url) {
        GalleryImage image = repository.findById(url)
                .orElseThrow(() -> new IllegalArgumentException("Image not found with url: " + url));
        return image;
    }

    @Transactional(readOnly = true)
    public Page<GalleryImage> getAllImages(Pageable pageable) {
        Page<GalleryImage> imagesPage = repository.findAll(pageable);
        return imagesPage;
    }
}
