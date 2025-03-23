package com.researchers_conicet.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing an analogy publication.
 * This class maps to the 'analogies' table in the database and contains
 * all information about an analogy box, including its relationships and support count.
 */
@Entity
@Data
@Table(
    name = "analogies",
    indexes = {
        @Index(name = "idx_analogy_created_at", columnList = "created_at")
    }
)
public class Analogy {
    
    /**
     * Unique identifier for the analogy.
     * Auto-generated using database identity strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Detailed content of the analogy.
     * Stored as a text column to allow longer descriptions.
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Title of the analogy.
     * Required field, cannot be null.
     */
    @Column(nullable = false)
    private String title;

    /**
     * Timestamp of analogy creation.
     * Cannot be updated after initial creation.
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Number of supports (likes) for this analogy.
     * Defaults to 0 if no supports are given.
     */
    @Column(name = "support_count", nullable = false)
    private Integer supportCount = 0;

    /**
     * Collection of author names for this analogy.
     * Stored as simple strings in a separate table.
     */
    @ElementCollection
    @CollectionTable(
        name = "analogy_authors",
        joinColumns = @JoinColumn(name = "analogy_id")
    )
    @Column(name = "author_name")
    private Set<String> authors = new HashSet<>();

    /**
     * Collection of analogy-related links.
     * Stored as simple strings in a separate table.
     * URL validation is handled in the frontend.
     */
    @ElementCollection
    @CollectionTable(
        name = "analogy_links",
        joinColumns = @JoinColumn(name = "analogy_id")
    )
    @Column(name = "link")
    private Set<String> links = new HashSet<>();

    /**
     * Collection of emails that have supported this analogy.
     * Prevents multiple supports from the same email.
     */
    @ElementCollection
    @CollectionTable(
        name = "analogy_supports",
        joinColumns = @JoinColumn(name = "analogy_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"analogy_id", "email"})
    )
    @Column(name = "email")
    private Set<String> supportEmails = new HashSet<>();

    /**
     * Automatically sets creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}