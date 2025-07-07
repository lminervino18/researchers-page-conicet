package com.researchers_conicet.service;

import com.researchers_conicet.dto.research.ResearchRequestDTO;
import com.researchers_conicet.dto.research.ResearchResponseDTO;
import com.researchers_conicet.entity.Research;
import com.researchers_conicet.exception.ResourceNotFoundException;
import com.researchers_conicet.repository.ResearchRepository;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ResearchService {

    private final ResearchRepository researchRepository;

    private static final int MAX_AUTHORS = 10;
    private static final int MAX_LINKS = 5;

    public ResearchService(ResearchRepository researchRepository) {
        this.researchRepository = researchRepository;
    }

    @Transactional
    public ResearchResponseDTO createResearch(ResearchRequestDTO requestDTO) {
        log.info("Creating new research");

        validateResearchData(requestDTO);

        try {
            Research research = new Research();
            research.setResearchAbstract(requestDTO.getResearchAbstract());
            research.setAuthors(requestDTO.getAuthors());
            research.setLinks(requestDTO.getLinks());
            research.setPdfPath(requestDTO.getPdfPath());

            Research savedResearch = researchRepository.save(research);
            Hibernate.initialize(savedResearch.getAuthors());
            Hibernate.initialize(savedResearch.getLinks());

            return mapToDTO(savedResearch);
        } catch (Exception e) {
            log.error("Error creating research", e);
            throw new RuntimeException("Failed to create research", e);
        }
    }

    @Transactional(readOnly = true)
    public ResearchResponseDTO getResearch(Long id) {
        Research research = findResearchById(id);
        Hibernate.initialize(research.getAuthors());
        Hibernate.initialize(research.getLinks());
        return mapToDTO(research);
    }

    @Transactional(readOnly = true)
    public Page<ResearchResponseDTO> getAllResearches(Pageable pageable) {
        return researchRepository.findAll(pageable).map(research -> {
            Hibernate.initialize(research.getAuthors());
            Hibernate.initialize(research.getLinks());
            return mapToDTO(research);
        });
    }

    @Transactional
    public ResearchResponseDTO updateResearch(Long id, ResearchRequestDTO requestDTO) {
        log.info("Updating research with ID: {}", id);

        validateResearchData(requestDTO);
        Research research = findResearchById(id);

        try {
            research.setResearchAbstract(requestDTO.getResearchAbstract());
            research.setAuthors(requestDTO.getAuthors());
            research.setLinks(requestDTO.getLinks());
            research.setPdfPath(requestDTO.getPdfPath());

            Research updatedResearch = researchRepository.save(research);
            Hibernate.initialize(updatedResearch.getAuthors());
            Hibernate.initialize(updatedResearch.getLinks());

            return mapToDTO(updatedResearch);
        } catch (Exception e) {
            log.error("Error updating research with ID: {}", id, e);
            throw new RuntimeException("Failed to update research", e);
        }
    }

    @Transactional
    public void deleteResearch(Long id) {
        log.info("Deleting research with ID: {}", id);

        Research research = findResearchById(id);

        try {
            researchRepository.delete(research);
            log.info("Successfully deleted research with ID: {}", id);
        } catch (Exception e) {
            log.error("Failed to delete research with ID: {}. Error: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete research: " + e.getMessage());
        }
    }

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

    private Research findResearchById(Long id) {
        return researchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Research not found with id: " + id));
    }

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

    private ResearchResponseDTO mapToDTO(Research research) {
        ResearchResponseDTO dto = new ResearchResponseDTO();
        dto.setId(research.getId());
        dto.setResearchAbstract(research.getResearchAbstract());
        dto.setPdfPath(research.getPdfPath());
        dto.setCreatedAt(research.getCreatedAt());
        dto.setAuthors(research.getAuthors());
        dto.setLinks(research.getLinks());
        return dto;
    }
}
