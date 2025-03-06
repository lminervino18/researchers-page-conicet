package com.researchers_conicet.service;

import com.researchers_conicet.entity.Research;
import com.researchers_conicet.repository.ResearchRepository;
import com.researchers_conicet.dto.ResearchRequestDTO;
import com.researchers_conicet.dto.ResearchResponseDTO;
import com.researchers_conicet.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.hibernate.Hibernate;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing Research entities.
 * Handles business logic, file storage, and data transformation.
 * Provides CRUD operations and search functionality for research papers.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class ResearchService {

    private final ResearchRepository researchRepository;
    private final FileStorageService fileStorageService;

    private static final long MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB
    private static final int MAX_AUTHORS = 10;
    private static final int MAX_LINKS = 5;

    public ResearchService(ResearchRepository researchRepository, 
                          FileStorageService fileStorageService) {
        this.researchRepository = researchRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Creates a new research with PDF file.
     * Validates input data and stores the PDF file.
     *
     * @param requestDTO The research data
     * @param pdfFile The PDF file to store
     * @return ResearchResponseDTO containing the created research details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public ResearchResponseDTO createResearch(ResearchRequestDTO requestDTO, MultipartFile pdfFile) {
        log.info("Creating new research");

        validateResearchData(requestDTO);

        try {
            Research research = new Research();
            research.setResearchAbstract(requestDTO.getResearchAbstract());
            research.setAuthors(requestDTO.getAuthors());
            research.setLinks(requestDTO.getLinks());

            // Solo procesamos el archivo si se proporciona uno
            if (pdfFile != null && !pdfFile.isEmpty()) {
                validatePdfFile(pdfFile);
                String fileName = fileStorageService.storeFile(pdfFile);
                String fileUrl = fileStorageService.getFileUrl(fileName);

                research.setPdfName(pdfFile.getOriginalFilename());
                research.setPdfPath(fileUrl);
                research.setMimeType(pdfFile.getContentType());
                research.setPdfSize(pdfFile.getSize());
            }

            Research savedResearch = researchRepository.save(research);
            log.info("Created research with ID: {}", savedResearch.getId());
            
            // Initialize lazy collections explicitly
            Hibernate.initialize(savedResearch.getAuthors());
            Hibernate.initialize(savedResearch.getLinks());
            
            return mapToDTO(savedResearch);
        } catch (Exception e) {
            log.error("Error creating research", e);
            throw new RuntimeException("Failed to create research", e);
        }
    }

    /**
     * Retrieves a research by ID.
     *
     * @param id The research ID
     * @return ResearchResponseDTO containing the research details
     * @throws ResourceNotFoundException if research not found
     */
    @Transactional(readOnly = true)
    public ResearchResponseDTO getResearch(Long id) {
        Research research = findResearchById(id);
        // Initialize lazy collections
        Hibernate.initialize(research.getAuthors());
        Hibernate.initialize(research.getLinks());
        return mapToDTO(research);
    }

    /**
     * Retrieves all researches with pagination.
     *
     * @param pageable Pagination information
     * @return Page of ResearchResponseDTO
     */
    @Transactional(readOnly = true)
    public Page<ResearchResponseDTO> getAllResearches(Pageable pageable) {
        return researchRepository.findAll(pageable)
            .map(research -> {
                // Initialize lazy collections for each element
                Hibernate.initialize(research.getAuthors());
                Hibernate.initialize(research.getLinks());
                return mapToDTO(research);
            });
    }

        /**
     * Updates an existing research.
     * Optionally updates the PDF file if provided.
     *
     * @param id The research ID
     * @param requestDTO Updated research data
     * @param pdfFile Optional new PDF file
     * @return ResearchResponseDTO containing updated research details
     * @throws ResourceNotFoundException if research not found
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public ResearchResponseDTO updateResearch(Long id, ResearchRequestDTO requestDTO, MultipartFile pdfFile) {
        log.info("Updating research with ID: {}", id);
        
        validateResearchData(requestDTO);
        Research research = findResearchById(id);

        try {
            if (pdfFile != null && !pdfFile.isEmpty()) {
                validatePdfFile(pdfFile);
                
                if (research.getPdfPath() != null) {
                    fileStorageService.deleteFile(research.getPdfPath());
                }

                String fileName = fileStorageService.storeFile(pdfFile);
                String fileUrl = fileStorageService.getFileUrl(fileName);
                
                research.setPdfName(pdfFile.getOriginalFilename());
                research.setPdfPath(fileUrl);
                research.setMimeType(pdfFile.getContentType());
                research.setPdfSize(pdfFile.getSize());
            }

            research.setResearchAbstract(requestDTO.getResearchAbstract());
            research.setAuthors(requestDTO.getAuthors());
            research.setLinks(requestDTO.getLinks());

            Research updatedResearch = researchRepository.save(research);
            log.info("Updated research with ID: {}", id);
            
            // Initialize lazy collections
            Hibernate.initialize(updatedResearch.getAuthors());
            Hibernate.initialize(updatedResearch.getLinks());
            
            return mapToDTO(updatedResearch);
        } catch (Exception e) {
            log.error("Error updating research with ID: {}", id, e);
            throw new RuntimeException("Failed to update research", e);
        }
    }

    /**
     * Deletes a research and its associated PDF file.
     *
     * @param id The research ID
     * @throws ResourceNotFoundException if research not found
     */
    @Transactional
    
    public void deleteResearch(Long id) {
        log.info("Deleting research with ID: {}", id);
        
        Research research = findResearchById(id);
    
        try {
            // First try to delete the PDF file if it exists
            if (research.getPdfName() != null) {  // Cambiado de getPdfPath a getPdfName
                try {
                    fileStorageService.deleteFile(research.getPdfName());  // Usar getPdfName en lugar de getPdfPath
                    log.info("Successfully deleted PDF file: {} for research ID: {}", 
                        research.getPdfName(), id);
                } catch (Exception e) {
                    // Log the error but continue with research deletion
                    log.warn("Could not delete PDF file: {} for research ID: {}. Error: {}", 
                        research.getPdfName(), id, e.getMessage());
                }
            }
    
            // Then delete the research from database
            researchRepository.delete(research);
            log.info("Successfully deleted research with ID: {}", id);
            
        } catch (Exception e) {
            log.error("Failed to delete research with ID: {}. Error: {}", 
                id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete research: " + e.getMessage());
        }
    }

    /**
     * Searches researches by abstract content.
     *
     * @param text The search text
     * @return List of matching ResearchResponseDTO
     * @throws IllegalArgumentException if search text is empty
     */
    @Transactional(readOnly = true)
    public List<ResearchResponseDTO> searchByAbstract(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("Search text cannot be empty");
        }
        return researchRepository.findByResearchAbstractContainingIgnoreCase(text)
            .stream()
            .map(research -> {
                Hibernate.initialize(research.getAuthors());
                Hibernate.initialize(research.getLinks());
                return mapToDTO(research);
            })
            .collect(Collectors.toList());
    }

    /**
     * Searches researches by author name.
     *
     * @param authorName The author name to search
     * @return List of matching ResearchResponseDTO
     * @throws IllegalArgumentException if author name is empty
     */
    @Transactional(readOnly = true)
    public List<ResearchResponseDTO> searchByAuthor(String authorName) {
        if (!StringUtils.hasText(authorName)) {
            throw new IllegalArgumentException("Author name cannot be empty");
        }
        return researchRepository.findByAuthor(authorName)
            .stream()
            .map(research -> {
                Hibernate.initialize(research.getAuthors());
                Hibernate.initialize(research.getLinks());
                return mapToDTO(research);
            })
            .collect(Collectors.toList());
    }

    /**
     * Performs a global search across all fields.
     *
     * @param term The search term
     * @return List of matching ResearchResponseDTO
     * @throws IllegalArgumentException if search term is empty
     */
    @Transactional(readOnly = true)
    public List<ResearchResponseDTO> searchEverywhere(String term) {
        if (!StringUtils.hasText(term)) {
            throw new IllegalArgumentException("Search term cannot be empty");
        }
        return researchRepository.searchEverywhere(term)
            .stream()
            .map(research -> {
                Hibernate.initialize(research.getAuthors());
                Hibernate.initialize(research.getLinks());
                return mapToDTO(research);
            })
            .collect(Collectors.toList());
    }

    /**
     * Helper method to find a research by ID.
     * 
     * @param id The research ID
     * @return Research entity
     * @throws ResourceNotFoundException if not found
     */
    private Research findResearchById(Long id) {
        return researchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Research not found with id: " + id));
    }

    /**
     * Validates PDF file constraints.
     * 
     * @param file The PDF file to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validatePdfFile(MultipartFile file) {
        // Solo validamos el tipo y tamaño del archivo, no si es requerido
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
        if (file.getSize() > MAX_PDF_SIZE) {
            throw new IllegalArgumentException("PDF file size must not exceed 25MB");
        }
    }

    /**
     * Validates research data constraints.
     * 
     * @param requestDTO The research data to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateResearchData(ResearchRequestDTO requestDTO) {
        if (!StringUtils.hasText(requestDTO.getResearchAbstract())) {
            throw new IllegalArgumentException("Research abstract is required");
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
     * Maps a Research entity to ResearchResponseDTO.
     * 
     * @param research The Research entity to map
     * @return ResearchResponseDTO
     */
    private ResearchResponseDTO mapToDTO(Research research) {
        ResearchResponseDTO dto = new ResearchResponseDTO();
        dto.setId(research.getId());
        dto.setResearchAbstract(research.getResearchAbstract());
        dto.setPdfName(research.getPdfName());
        dto.setPdfPath(research.getPdfPath());
        dto.setPdfSize(research.getPdfSize());
        dto.setMimeType(research.getMimeType());
        dto.setCreatedAt(research.getCreatedAt());
        dto.setAuthors(research.getAuthors());
        dto.setLinks(research.getLinks());
        return dto;
    }
}