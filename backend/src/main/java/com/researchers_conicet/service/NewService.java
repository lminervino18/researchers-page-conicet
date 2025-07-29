package com.researchers_conicet.service;

import com.researchers_conicet.entity.New;
import com.researchers_conicet.entity.MediaLink;
import com.researchers_conicet.dto.news.NewsRequestDTO;
import com.researchers_conicet.dto.news.NewsResponseDTO;
import com.researchers_conicet.dto.media_link.MediaLinkDTO;
import com.researchers_conicet.repository.NewRepository;
import com.researchers_conicet.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.hibernate.Hibernate;

import java.util.List;
import java.util.HashSet;
import java.util.stream.Collectors;

/**
 * Service class for managing New entities.
 * Handles business logic, data transformation, and CRUD operations.
 * Provides functionality for news management.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class NewService {

    private final NewRepository newRepository;

    /** Maximum number of authors allowed for a news article */
    private static final int MAX_AUTHORS = 10;
    /** Maximum number of links allowed for a news article */
    private static final int MAX_LINKS = 5;

    public NewService(NewRepository newRepository) {
        this.newRepository = newRepository;
    }

    /**
     * Creates a new news article
     * 
     * @param requestDTO Data transfer object containing news details
     * @return Response DTO with created news details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public NewsResponseDTO createNew(NewsRequestDTO requestDTO) {
        log.info("Creating new news article");

        validateNewsData(requestDTO);

        try {
            New news = new New();
            news.setTitle(requestDTO.getTitle());
            news.setContent(requestDTO.getContent());
            news.setAuthors(requestDTO.getAuthors());
            news.setLinks(requestDTO.getLinks());

            // Asegúrate de que mediaLinks no sea null
            news.setMediaLinks(
                requestDTO.getMediaLinks() == null ? new HashSet<>() : requestDTO.getMediaLinks()
                    .stream()
                    .map(dto -> new MediaLink(dto.getUrl(), dto.getMediaType()))
                    .collect(Collectors.toSet())
            );

            news.setPreviewImage(requestDTO.getPreviewImage());

            New savedNews = newRepository.save(news);
            log.info("Created news article with ID: {}", savedNews.getId());

            // Initialize lazy collections explicitly
            Hibernate.initialize(savedNews.getAuthors());
            Hibernate.initialize(savedNews.getLinks());
            Hibernate.initialize(savedNews.getMediaLinks());

            return mapToDTO(savedNews);
        } catch (Exception e) {
            log.error("Error creating news article", e);
            throw new ResourceNotFoundException("Failed to create news article", e);
        }
    }

    /**
     * Retrieves a news article by its ID
     * 
     * @param id News article identifier
     * @return Response DTO with news article details
     * @throws ResourceNotFoundException if news article not found
     */
    @Transactional(readOnly = true)
    public NewsResponseDTO getNew(Long id) {
        New news = findNewById(id);
        // Initialize lazy collections
        Hibernate.initialize(news.getAuthors());
        Hibernate.initialize(news.getLinks());
        Hibernate.initialize(news.getMediaLinks());

        return mapToDTO(news);
    }

    /**
     * Retrieves all news articles with pagination
     * 
     * @param pageable Pagination information
     * @return Page of news response DTOs
     */
    @Transactional(readOnly = true)
    public Page<NewsResponseDTO> getAllNews(Pageable pageable) {
        return newRepository.findAll(pageable)
            .map(news -> {
                // Initialize lazy collections for each element
                Hibernate.initialize(news.getAuthors());
                Hibernate.initialize(news.getLinks());
                Hibernate.initialize(news.getMediaLinks());

                return mapToDTO(news);
            });
    }

    /**
     * Updates an existing news article
     * 
     * @param id News article identifier
     * @param requestDTO Updated news data
     * @return Response DTO with updated news details
     * @throws ResourceNotFoundException if news article not found
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public NewsResponseDTO updateNew(Long id, NewsRequestDTO requestDTO) {
        log.info("Updating news article with ID: {}", id);

        validateNewsData(requestDTO);
        New news = findNewById(id);

        try {
            news.setTitle(requestDTO.getTitle());
            news.setContent(requestDTO.getContent());
            news.setAuthors(requestDTO.getAuthors());
            news.setLinks(requestDTO.getLinks());

            news.getMediaLinks().clear();

            // Asegúrate de que mediaLinks no sea null
            news.setMediaLinks(
                requestDTO.getMediaLinks() == null ? new HashSet<>() : requestDTO.getMediaLinks()
                    .stream()
                    .map(dto -> new MediaLink(dto.getUrl(), dto.getMediaType()))
                    .collect(Collectors.toSet())
            );

            news.setPreviewImage(requestDTO.getPreviewImage());

            New updatedNews = newRepository.save(news);
            log.info("Updated news article with ID: {}", id);

            Hibernate.initialize(updatedNews.getAuthors());
            Hibernate.initialize(updatedNews.getLinks());
            Hibernate.initialize(updatedNews.getMediaLinks());

            return mapToDTO(updatedNews);
        } catch (Exception e) {
            log.error("Error updating news article with ID: {}", id, e);
            throw new ResourceNotFoundException("Failed to update news article", e);
        }
    }

    @Transactional
    public void deleteNew(Long id) {
    log.info("Deleting news article with ID: {}", id);

    New news = findNewById(id);  

    if (news == null) {
        throw new ResourceNotFoundException("News article not found with id: " + id);
    }

    newRepository.delete(news);  
    log.info("Deleted news article with ID: {}", id);
}



    /**
     * Searches news articles by title content
     * 
     * @param text Search text
     * @return List of matching news response DTOs
     * @throws IllegalArgumentException if search text is empty
     */
    @Transactional(readOnly = true)
    public List<NewsResponseDTO> searchByTitle(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("Search text cannot be empty");
        }
        return newRepository.findByTitleContainingIgnoreCase(text)
            .stream()
            .map(news -> {
                Hibernate.initialize(news.getAuthors());
                Hibernate.initialize(news.getLinks());
                Hibernate.initialize(news.getMediaLinks());

                return mapToDTO(news);
            })
            .collect(Collectors.toList());
    }

    /**
     * Performs a global search across title and authors
     * 
     * @param query Search term
     * @return List of matching news response DTOs
     */
    @Transactional(readOnly = true)
    public List<NewsResponseDTO> searchEverywhere(String query) {
        log.info("Searching news articles everywhere: {}", query);

        return newRepository.searchEverywhere(query)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Finds a news article by its ID
     * 
     * @param id News article identifier
     * @return News entity
     * @throws ResourceNotFoundException if news article not found
     */
    private New findNewById(Long id) {
        return newRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("News article not found with id: " + id));
    }

    /**
     * Validates news data constraints
     * 
     * @param requestDTO News data to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateNewsData(NewsRequestDTO requestDTO) {
        if (!StringUtils.hasText(requestDTO.getTitle())) {
            throw new IllegalArgumentException("News title is required");
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
     * Maps New entity to NewsResponseDTO
     * 
     * @param news New entity to map
     * @return News response DTO
     */
    private NewsResponseDTO mapToDTO(New news) {
    NewsResponseDTO dto = new NewsResponseDTO();
    dto.setId(news.getId());
    dto.setTitle(news.getTitle());
    dto.setContent(news.getContent());
    dto.setCreatedAt(news.getCreatedAt());
    dto.setAuthors(news.getAuthors());
    dto.setLinks(news.getLinks());

    dto.setMediaLinks(
        news.getMediaLinks() == null ? new HashSet<>() : news.getMediaLinks()
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

}
