package com.researchers_conicet.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a news article.
 * This class maps to the 'new' table in the database and contains
 * all information about a news article, including its relationships.
 */
@Entity
@Data
@Table(
    name = "news", // Cambié el nombre de la tabla a 'ne
    indexes = {
        @Index(name = "idx_new_created_at", columnList = "created_at")
    }
)
public class News {

    /**
     * Unique identifier for the news article.
     * Auto-generated using database identity strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Detailed content of the news article.
     * Stored as a text column to allow longer descriptions.
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Title of the news article.
     * Required field, cannot be null.
     */
    @Column(nullable = false)
    private String title;

    /**
     * Timestamp of news creation.
     * Cannot be updated after initial creation.
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Collection of author names for this news article.
     * Stored as simple strings in a separate table.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "new_authors", // Cambié el nombre de la tabla de 'news_authors' a 'new_authors'
        joinColumns = @JoinColumn(name = "new_id")
    )
    @Column(name = "author_name")
    private Set<String> authors = new HashSet<>();

    /**
     * Collection of news-related links.
     * Stored as simple strings in a separate table.
     * URL validation is handled in the frontend.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "new_links", // Cambié el nombre de la tabla de 'news_links' a 'new_links'
        joinColumns = @JoinColumn(name = "new_id")
    )
    @Column(name = "link")
    private Set<String> links = new HashSet<>();

    /**
     * Collection of Firebase media links (images or videos) related to this news article.
     * Stored as embeddable objects with media type and URL.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "new_media_links", // Cambié el nombre de la tabla de 'news_media_links' a 'new_media_links'
        joinColumns = @JoinColumn(name = "new_id")
    )
    private Set<MediaLink> mediaLinks = new HashSet<>();

    /**
     * The image that will be used for preview purposes.
     * This field refers to one of the media links.
     */
    @Column(name = "preview_image")
    private String previewImage;

    @Transient
    private int mediaCount;

    public News() {
        createdAt = LocalDateTime.now();
    }

    public News(String title, String content, Set<String> authors, Set<String> links, Set<String> previewImage) {
        this.content = content;
        this.title = title;
        this.authors = authors != null ? authors : new HashSet<>();
        this.links = links != null ? links : new HashSet<>();
        this.previewImage = previewImage != null ? previewImage.iterator().next() : null; // Setting the preview image as the first link if available
        this.createdAt = LocalDateTime.now();
    }

    /*
     * Deep copy constructor for cloning news article
     * WARNING: This does not create a new row in database, it only clones the object in memory.
     * @param news The news article to clone
     */
    public News(News news) {
        this.id = news.id;
        this.content = news.content;
        this.title = news.title;
        this.createdAt = news.createdAt;
        this.authors = new HashSet<>(news.authors);
        this.links = new HashSet<>(news.links);
        this.previewImage = news.previewImage;
        this.mediaCount = news.mediaCount;
    }
}
