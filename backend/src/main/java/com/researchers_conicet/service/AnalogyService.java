package com.researchers_conicet.service;

import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.dto.analogy.AnalogyRequestDTO;
import com.researchers_conicet.dto.analogy.AnalogyResponseDTO;
import com.researchers_conicet.repository.AnalogyRepository;
import com.researchers_conicet.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.hibernate.Hibernate;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing Analogy entities.
 * Handles business logic, file storage, and data transformation.
 * Provides CRUD operations and search functionality for analogy papers.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class AnalogyService {

    private final AnalogyRepository analogyRepository;

    private static final int MAX_AUTHORS = 10;
    private static final int MAX_LINKS = 5;

    public AnalogyService(AnalogyRepository analogyRepository) {
        this.analogyRepository = analogyRepository;
    }

    /**
     * Creates a new analogy.
     * Validates input data.
     *
     * @param requestDTO The analogy data
     * @return AnalogyResponseDTO containing the created analogy details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public AnalogyResponseDTO createAnalogy(AnalogyRequestDTO requestDTO) {
        log.info("Creating new analogy");

        validateAnalogyData(requestDTO);

        try {

            Analogy analogy = new Analogy();
            analogy.setTitle(requestDTO.getTitle());
            analogy.setContent(requestDTO.getContent());
            analogy.setAuthors(requestDTO.getAuthors());
            analogy.setLinks(requestDTO.getLinks());

            Analogy savedAnalogy = analogyRepository.save(analogy);
            log.info("Created analogy with ID: {}", savedAnalogy.getId());
            
            // Initialize lazy collections explicitly
            Hibernate.initialize(savedAnalogy.getAuthors());
            Hibernate.initialize(savedAnalogy.getLinks());
            
            return mapToDTO(savedAnalogy);
        } catch (Exception e) {
            log.error("Error creating analogy", e);
            throw new RuntimeException("Failed to create analogy", e);
        }
    }

    /**
     * Retrieves a analogy by ID.
     *
     * @param id The analogy ID
     * @return AnalogyResponseDTO containing the analogy details
     * @throws ResourceNotFoundException if analogy not found
     */
    @Transactional(readOnly = true)
    public AnalogyResponseDTO getAnalogy(Long id) {
        Analogy analogy = findAnalogyById(id);
        // Initialize lazy collections
        Hibernate.initialize(analogy.getAuthors());
        Hibernate.initialize(analogy.getLinks());
        return mapToDTO(analogy);
    }

    /**
     * Retrieves all analogies with pagination.
     *
     * @param pageable Pagination information
     * @return Page of AnalogyResponseDTO
     */
    @Transactional(readOnly = true)
    public Page<AnalogyResponseDTO> getAllAnalogies(Pageable pageable) {
        return analogyRepository.findAll(pageable)
            .map(analogy -> {
                // Initialize lazy collections for each element
                Hibernate.initialize(analogy.getAuthors());
                Hibernate.initialize(analogy.getLinks());
                return mapToDTO(analogy);
            });
    }

    /**
     * Updates an existing analogy.
     *
     * @param id The analogy ID
     * @param requestDTO Updated analogy data
     * @return AnalogyResponseDTO containing updated analogy details
     * @throws ResourceNotFoundException if analogy not found
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public AnalogyResponseDTO updateAnalogy(Long id, AnalogyRequestDTO requestDTO) {
        log.info("Updating analogy with ID: {}", id);
        
        validateAnalogyData(requestDTO);
        Analogy analogy = findAnalogyById(id);

        try {
            analogy.setTitle(requestDTO.getTitle());
            analogy.setContent(requestDTO.getContent());
            analogy.setAuthors(requestDTO.getAuthors());
            analogy.setLinks(requestDTO.getLinks());

            Analogy updatedAnalogy = analogyRepository.save(analogy);
            log.info("Updated analogy with ID: {}", id);
            
            // Initialize lazy collections
            Hibernate.initialize(updatedAnalogy.getAuthors());
            Hibernate.initialize(updatedAnalogy.getLinks());
            
            return mapToDTO(updatedAnalogy);
        } catch (Exception e) {
            log.error("Error updating analogy with ID: {}", id, e);
            throw new RuntimeException("Failed to update analogy", e);
        }
    }

    /**
     * Deletes a analogy.
     *
     * @param id The analogy ID
     * @throws ResourceNotFoundException if analogy not found
     */
    @Transactional
    public void deleteAnalogy(Long id) {
        log.info("Deleting analogy with ID: {}", id);
        
        Analogy analogy = findAnalogyById(id);

        try {
            analogyRepository.delete(analogy);
            log.info("Deleted analogy with ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting analogy with ID: {}", id, e);
            throw new RuntimeException("Failed to delete analogy", e);
        }
    }

    /**
     * Searches analogies by title content.
     *
     * @param text The search text
     * @return List of matching AnalogyResponseDTO
     * @throws IllegalArgumentException if search text is empty
     */
    @Transactional(readOnly = true)
    public List<AnalogyResponseDTO> searchByTitle(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("Search text cannot be empty");
        }
        return analogyRepository.findByTitleContainingIgnoreCase(text)
            .stream()
            .map(analogy -> {
                Hibernate.initialize(analogy.getAuthors());
                Hibernate.initialize(analogy.getLinks());
                return mapToDTO(analogy);
            })
            .collect(Collectors.toList());
    }

    /**
     * Searches analogies by author name.
     *
     * @param authorName The author name to search
     * @return List of matching AnalogyResponseDTO
     * @throws IllegalArgumentException if author name is empty
     */
    @Transactional(readOnly = true)
    public List<AnalogyResponseDTO> searchByAuthor(String authorName) {
        if (!StringUtils.hasText(authorName)) {
            throw new IllegalArgumentException("Author name cannot be empty");
        }
        return analogyRepository.findByAuthor(authorName)
            .stream()
            .map(analogy -> {
                Hibernate.initialize(analogy.getAuthors());
                Hibernate.initialize(analogy.getLinks());
                return mapToDTO(analogy);
            })
            .collect(Collectors.toList());
    }

    /**
     * Performs a global search across all fields.
     *
     * @param term The search term
     * @return List of matching AnalogyResponseDTO
     * @throws IllegalArgumentException if search term is empty
     */
    @Transactional(readOnly = true)
    public List<AnalogyResponseDTO> searchEverywhere(String term) {
        if (!StringUtils.hasText(term)) {
            throw new IllegalArgumentException("Search term cannot be empty");
        }
        return analogyRepository.searchEverywhere(term)
            .stream()
            .map(analogy -> {
                Hibernate.initialize(analogy.getAuthors());
                Hibernate.initialize(analogy.getLinks());
                return mapToDTO(analogy);
            })
            .collect(Collectors.toList());
    }

    /**
     * Helper method to find a analogy by ID.
     * 
     * @param id The analogy ID
     * @return Analogy entity
     * @throws ResourceNotFoundException if not found
     */
    private Analogy findAnalogyById(Long id) {
        return analogyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Analogy not found with id: " + id));
    }

    /**
     * Validates analogy data constraints.
     * 
     * @param requestDTO The analogy data to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateAnalogyData(AnalogyRequestDTO requestDTO) {
        if (!StringUtils.hasText(requestDTO.getTitle())) {
            throw new IllegalArgumentException("Analogy title is required");
        }
        if (!StringUtils.hasText(requestDTO.getContent())) {
            throw new IllegalArgumentException("Analogy content is required");
        }
        if (requestDTO.getAuthors() == null || requestDTO.getAuthors().isEmpty()) {
            throw new IllegalArgumentException("At least one author is required");
        }
        if (requestDTO.getAuthors().size() > MAX_AUTHORS) {
            throw new IllegalArgumentException("Maximum number of authors exceeded");
        }
        if (requestDTO.getLinks() != null && requestDTO.getLinks().size() > MAX_LINKS) {
            throw new IllegalArgumentException("Maximum number of links exceeded");
        }
    }

    /**
     * Maps a Analogy entity to AnalogyResponseDTO.
     * 
     * @param analogy The Analogy entity to map
     * @return AnalogyResponseDTO
     */
    private AnalogyResponseDTO mapToDTO(Analogy analogy) {
        AnalogyResponseDTO dto = new AnalogyResponseDTO();
        dto.setId(analogy.getId());
        dto.setTitle(analogy.getTitle());
        dto.setContent(analogy.getContent());
        dto.setCreatedAt(analogy.getCreatedAt());
        dto.setAuthors(analogy.getAuthors());
        dto.setLinks(analogy.getLinks());
        return dto;
    }
}