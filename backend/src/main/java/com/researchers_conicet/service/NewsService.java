package com.researchers_conicet.service;

import com.researchers_conicet.entity.News;
import com.researchers_conicet.entity.MediaLink;
import com.researchers_conicet.dto.news.NewsRequestDTO;
import com.researchers_conicet.dto.news.NewsResponseDTO;
import com.researchers_conicet.dto.media_link.MediaLinkDTO;
import com.researchers_conicet.repository.NewsRepository;
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
 * Service class for managing News entities.
 * Handles business logic, data transformation, and CRUD operations.
 * Provides functionality for news management.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class NewsService {

    private final NewsRepository newsRepository;

    /** Maximum number of authors allowed for a news article */
    private static final int MAX_AUTHORS = 10;
    /** Maximum number of links allowed for a news article */
    private static final int MAX_LINKS = 5;

    public NewsService(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    /**
     * Creates a new news article
     */
    @Transactional
    public NewsResponseDTO createNews(NewsRequestDTO requestDTO) {
        log.info("Creating new news article");

        validateNewsData(requestDTO);

        try {
            News news = new News();
            news.setTitle(requestDTO.getTitle());
            news.setContent(requestDTO.getContent());
            news.setAuthors(requestDTO.getAuthors());
            news.setLinks(requestDTO.getLinks());
            news.setMediaLinks(
                requestDTO.getMediaLinks() == null ? new HashSet<>() : requestDTO.getMediaLinks()
                    .stream()
                    .map(dto -> new MediaLink(dto.getUrl(), dto.getMediaType()))
                    .collect(Collectors.toSet())
            );
            news.setPreviewImage(requestDTO.getPreviewImage());

            News savedNews = newsRepository.save(news);
            newsRepository.flush();
            log.info("Created news article with ID: {}", savedNews.getId());

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
     */
    @Transactional(readOnly = true)
    public NewsResponseDTO getNews(Long id) {
        News news = findNewsById(id);
        Hibernate.initialize(news.getAuthors());
        Hibernate.initialize(news.getLinks());
        Hibernate.initialize(news.getMediaLinks());
        return mapToDTO(news);
    }

    /**
     * Retrieves all news articles with pagination
     */
    @Transactional(readOnly = true)
    public Page<NewsResponseDTO> getAllNews(Pageable pageable) {
        return newsRepository.findAll(pageable)
            .map(news -> {
                Hibernate.initialize(news.getAuthors());
                Hibernate.initialize(news.getLinks());
                Hibernate.initialize(news.getMediaLinks());
                return mapToDTO(news);
            });
    }

    /**
     * Updates an existing news article
     */
    @Transactional
    public NewsResponseDTO updateNews(Long id, NewsRequestDTO requestDTO) {
        log.info("Updating news article with ID: {}", id);
        validateNewsData(requestDTO);
        News news = findNewsById(id);

        try {
            news.setTitle(requestDTO.getTitle());
            news.setContent(requestDTO.getContent());
            news.setAuthors(requestDTO.getAuthors());
            news.setLinks(requestDTO.getLinks());
            news.getMediaLinks().clear();
            news.setMediaLinks(
                requestDTO.getMediaLinks() == null ? new HashSet<>() : requestDTO.getMediaLinks()
                    .stream()
                    .map(dto -> new MediaLink(dto.getUrl(), dto.getMediaType()))
                    .collect(Collectors.toSet())
            );
            news.setPreviewImage(requestDTO.getPreviewImage());

            News updatedNews = newsRepository.save(news);
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
    public void deleteNews(Long id) {
        log.info("Deleting news article with ID: {}", id);
        News news = findNewsById(id);
        newsRepository.delete(news);
        log.info("Deleted news article with ID: {}", id);
    }

    /**
     * Searches news articles by title content
     */
    @Transactional
    public List<NewsResponseDTO> searchByTitle(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("Search text cannot be empty");
        }
        return newsRepository.findByTitleContainingIgnoreCase(text)
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
     */
    @Transactional(readOnly = true)
    public List<NewsResponseDTO> searchEverywhere(String query) {
        log.info("Searching news articles everywhere: {}", query);
        return newsRepository.searchEverywhere(query)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Finds a news article by its ID
     */
    private News findNewsById(Long id) {
        return newsRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("News article not found with id: " + id));
    }

    /**
     * Validates news data constraints
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
     * Maps News entity to NewsResponseDTO
     */
    private NewsResponseDTO mapToDTO(News news) {
        NewsResponseDTO dto = new NewsResponseDTO();
        dto.setId(news.getId());
        dto.setTitle(news.getTitle());
        dto.setContent(news.getContent());
        dto.setCreatedAt(news.getCreatedAt());
        dto.setAuthors(news.getAuthors());
        dto.setLinks(news.getLinks());
        dto.setPreviewImage(news.getPreviewImage());

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
