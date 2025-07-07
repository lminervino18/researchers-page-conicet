package com.researchers_conicet.service;

import com.researchers_conicet.entity.Analogy;
import com.researchers_conicet.entity.MediaLink;
import com.researchers_conicet.dto.analogy.AnalogyRequestDTO;
import com.researchers_conicet.dto.analogy.AnalogyResponseDTO;
import com.researchers_conicet.dto.analogy.MediaLinkDTO;
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
import java.util.Set;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

/**
 * Service class for managing Analogy entities.
 * Handles business logic, data transformation, and CRUD operations.
 * Provides functionality for analogy management and support system.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class AnalogyService {

    private final AnalogyRepository analogyRepository;
    private final EmailVerificationService emailVerificationService;

    /** Maximum number of authors allowed for an analogy */
    private static final int MAX_AUTHORS = 10;
    /** Maximum number of links allowed for an analogy */
    private static final int MAX_LINKS = 5;
    /** Email validation regex */
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

    /**
     * Constructor for dependency injection
     * 
     * @param analogyRepository Repository for analogy database operations
     * @param emailVerificationService Service for email verification
     */
    public AnalogyService(
        AnalogyRepository analogyRepository,
        EmailVerificationService emailVerificationService
    ) {
        this.analogyRepository = analogyRepository;
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Checks if an email is verified
     * 
     * @param email Email to verify
     * @return true if email is registered, false otherwise
     */
    public boolean isEmailVerified(String email) {
        return emailVerificationService.isEmailRegistered(email);
    }

    /**
     * Gets the support count for a specific analogy
     * 
     * @param analogyId ID of the analogy
     * @return Number of supports for the analogy
     */
    public int getSupportCount(Long analogyId) {
        return analogyRepository.countSupportsByAnalogyId(analogyId);
    }

    /**
     * Gets the emails that have supported an analogy
     * 
     * @param analogyId Analogy identifier
     * @return Set of support emails
     */
    public Set<String> getSupportEmails(Long analogyId) {
        Analogy analogy = findAnalogyById(analogyId);
        return analogy.getSupportEmails();
    }

    /**
     * Creates a new analogy
     * 
     * @param requestDTO Data transfer object containing analogy details
     * @return Response DTO with created analogy details
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

            analogy.setMediaLinks(
            requestDTO.getMediaLinks()
                .stream()
                .map(dto -> new MediaLink(dto.getUrl(), dto.getMediaType()))
                .collect(Collectors.toSet())
            );

            Analogy savedAnalogy = analogyRepository.save(analogy);
            log.info("Created analogy with ID: {}", savedAnalogy.getId());
            
            // Initialize lazy collections explicitly
            Hibernate.initialize(savedAnalogy.getAuthors());
            Hibernate.initialize(savedAnalogy.getLinks());
            Hibernate.initialize(savedAnalogy.getMediaLinks());

            return mapToDTO(savedAnalogy);
        } catch (Exception e) {
            log.error("Error creating analogy", e);
            throw new RuntimeException("Failed to create analogy", e);
        }
    }

    /**
     * Retrieves an analogy by its ID
     * 
     * @param id Analogy identifier
     * @return Response DTO with analogy details
     * @throws ResourceNotFoundException if analogy not found
     */
    @Transactional(readOnly = true)
    public AnalogyResponseDTO getAnalogy(Long id) {
        Analogy analogy = findAnalogyById(id);
        // Initialize lazy collections
        Hibernate.initialize(analogy.getAuthors());
        Hibernate.initialize(analogy.getLinks());
        Hibernate.initialize(analogy.getMediaLinks());

        return mapToDTO(analogy);
    }

    /**
     * Retrieves all analogies with pagination
     * 
     * @param pageable Pagination information
     * @return Page of analogy response DTOs
     */
    @Transactional(readOnly = true)
    public Page<AnalogyResponseDTO> getAllAnalogies(Pageable pageable) {
        return analogyRepository.findAll(pageable)
            .map(analogy -> {
                // Initialize lazy collections for each element
                Hibernate.initialize(analogy.getAuthors());
                Hibernate.initialize(analogy.getLinks());
                Hibernate.initialize(analogy.getMediaLinks());

                return mapToDTO(analogy);
            });
    }

    /**
     * Updates an existing analogy
     * 
     * @param id Analogy identifier
     * @param requestDTO Updated analogy data
     * @return Response DTO with updated analogy details
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

                analogy.getMediaLinks().clear();

                analogy.setMediaLinks(
                    requestDTO.getMediaLinks()
                        .stream()
                        .map(dto -> new MediaLink(dto.getUrl(), dto.getMediaType()))
                        .collect(Collectors.toSet())
                );

                Analogy updatedAnalogy = analogyRepository.save(analogy);
                log.info("Updated analogy with ID: {}", id);

                Hibernate.initialize(updatedAnalogy.getAuthors());
                Hibernate.initialize(updatedAnalogy.getLinks());
                Hibernate.initialize(updatedAnalogy.getMediaLinks());

                return mapToDTO(updatedAnalogy);
            } catch (Exception e) {
                log.error("Error updating analogy with ID: {}", id, e);
                throw new RuntimeException("Failed to update analogy", e);
            }
        }


    /**
     * Deletes an analogy
     * 
     * @param id Analogy identifier
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
     * Searches analogies by title content
     * 
     * @param text Search text
     * @return List of matching analogy response DTOs
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
                Hibernate.initialize(analogy.getMediaLinks());

                return mapToDTO(analogy);
            })
            .collect(Collectors.toList());
    }

    /**
     * Searches analogies by author name
     * 
     * @param authorName Author name to search
     * @return List of matching analogy response DTOs
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
                Hibernate.initialize(analogy.getMediaLinks());

                return mapToDTO(analogy);
            })
            .collect(Collectors.toList());
    }

    /**
     * Performs a global search across all fields
     * 
     * @param term Search term
     * @return List of matching analogy response DTOs
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
                Hibernate.initialize(analogy.getMediaLinks());

                return mapToDTO(analogy);
            })
            .collect(Collectors.toList());
    }

    /**
     * Adds support to an analogy
     * 
     * @param analogyId Analogy identifier
     * @param email User's email
     * @return Updated analogy response DTO
     * @throws ResourceNotFoundException if analogy not found
     * @throws IllegalArgumentException if email is invalid
     */
    @Transactional
    public AnalogyResponseDTO addSupport(Long analogyId, String email) {
        log.info("Adding support to analogy with ID: {}", analogyId);

        // Validate email input
        validateEmail(email);

        // Verify email is registered in the system
        if (!emailVerificationService.isEmailRegistered(email)) {
            throw new IllegalArgumentException("Email is not registered");
        }

        // Find the analogy
        Analogy analogy = findAnalogyById(analogyId);

        try {
            // Use the method from the entity to add support email
            if (analogy.addSupportEmail(email)) {
                // Only save if the email was not already present
                analogyRepository.save(analogy);
                log.info("Added support to analogy with ID: {}", analogyId);
            } else {
                log.warn("Email {} has already supported this analogy", email);
            }

            return mapToDTO(analogy);
        } catch (Exception e) {
            log.error("Error adding support to analogy with ID: {}", analogyId, e);
            throw new RuntimeException("Failed to add support to analogy", e);
        }
    }

    /**
     * Removes support from an analogy
     * 
     * @param analogyId Analogy identifier
     * @param email User's email
     * @return Updated analogy response DTO
     * @throws ResourceNotFoundException if analogy not found
     * @throws IllegalArgumentException if email is invalid
     */
    @Transactional
    public AnalogyResponseDTO removeSupport(Long analogyId, String email) {
        log.info("Removing support from analogy with ID: {}", analogyId);

        // Validate email input
        validateEmail(email);

        // Find the analogy
        Analogy analogy = findAnalogyById(analogyId);

        try {
            // Use the method from the entity to remove support email
            if (analogy.removeSupportEmail(email)) {
                // Only save if the email was present
                analogyRepository.save(analogy);
                log.info("Removed support from analogy with ID: {}", analogyId);
            } else {
                log.warn("Email {} has not supported this analogy", email);
            }

            return mapToDTO(analogy);
        } catch (Exception e) {
            log.error("Error removing support from analogy with ID: {}", analogyId, e);
            throw new RuntimeException("Failed to remove support from analogy", e);
        }
    }

    /**
     * Finds an analogy by its ID
     * 
     * @param id Analogy identifier
     * @return Analogy entity
     * @throws ResourceNotFoundException if analogy not found
     */
    private Analogy findAnalogyById(Long id) {
        return analogyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Analogy not found with id: " + id));
    }

    /**
     * Validates analogy data constraints
     * 
     * @param requestDTO Analogy data to validate
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
     * Validates email format
     * 
     * @param email Email to validate
     * @throws IllegalArgumentException if email is invalid
     */
    private void validateEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        
        if (!Pattern.matches(EMAIL_REGEX, email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    /**
     * Maps Analogy entity to AnalogyResponseDTO
     * 
     * @param analogy Analogy entity to map
     * @return Analogy response DTO
     */
    private AnalogyResponseDTO mapToDTO(Analogy analogy) {
        AnalogyResponseDTO dto = new AnalogyResponseDTO();
        dto.setId(analogy.getId());
        dto.setTitle(analogy.getTitle());
        dto.setContent(analogy.getContent());
        dto.setCreatedAt(analogy.getCreatedAt());
        dto.setAuthors(analogy.getAuthors());
        dto.setLinks(analogy.getLinks());
        
        // Dynamically get support count
        dto.setSupportCount(analogy.getSupportEmails().size());
        
        dto.setMediaLinks(
        analogy.getMediaLinks()
            .stream()
            .map(media -> {
                MediaLinkDTO dtoItem = new MediaLinkDTO();
                dtoItem.setUrl(media.getUrl());
                dtoItem.setMediaType(media.getMediaType());
                return dtoItem;
            })
            .collect(Collectors.toSet())
         );


        return dto;
    }

    /**
     * Checks if an email has supported a specific analogy
     * 
     * @param analogyId ID of the analogy
     * @param email Email to check
     * @return Boolean indicating if the email has supported the analogy
     */
    public boolean hasEmailSupported(Long analogyId, String email) {
        Analogy analogy = findAnalogyById(analogyId);
        return analogy.getSupportEmails().contains(email);
    }
}